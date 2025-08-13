import {
  logger,
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/framework";

import sendEmailResendWorkflow from "../workflows/send-email-resend-workflow";
import { RESEND_EMAIL_MODULE } from "../modules/resend-email";
import ResendEmailModuleService from "../modules/resend-email/service";
import { OrderDTO } from "@medusajs/framework/types";
import { Attachment } from "resend";
import { MedusaError } from "@medusajs/framework/utils";

/**
 * Subscriber handling the `order.placed` event.
 *
 * Responsibilities:
 * - Verify if the event is enabled in the Resend plugin configuration.
 * - Retrieve order details via Graph query.
 * - Optionally generate an invoice PDF if the Documents plugin is enabled.
 * - Send an order confirmation email via Resend workflow.
 *
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  let resendEmailService: ResendEmailModuleService;
  let documentsModuleService: any;
  let query: any;

  try {
    resendEmailService = container.resolve(RESEND_EMAIL_MODULE);
    documentsModuleService = container.resolve("documentsModuleService");
    query = container.resolve("query");
  } catch (err) {
    logger.error("[RESEND PLUGIN] Failed to resolve required services.");
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Unable to resolve required services from container."
    );
  }

  let isHandled: boolean;
  let useDocumentsPlugin: boolean;
  try {
    isHandled = await resendEmailService.isEventSet("order.placed");
    useDocumentsPlugin = await resendEmailService.useDocumentsPlugin();
  } catch (err) {
    logger.error("[RESEND PLUGIN] Failed to check event configuration.");
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Unable to verify event configuration."
    );
  }

  if (!isHandled) {
    logger.info("[RESEND PLUGIN] Event not listed in config. Skipping.");
    return;
  }

  let order: OrderDTO;
  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "email",
        "billing_address.*",
        "shipping_address.*",
        "currency_code",
        "total",
        "subtotal",
        "tax_total",
        "original_total",
        "original_subtotal",
        "original_tax_total",
        "discount_total",
        "discount_tax_total",
        "shipping_total",
        "shipping_subtotal",
        "shipping_tax_total",
        "original_shipping_total",
        "original_shipping_subtotal",
        "original_shipping_tax_total",
        "item_total",
        "item_tax_total",
        "item_subtotal",
        "original_item_total",
        "original_item_tax_total",
        "original_item_subtotal",
        "gift_card_total",
        "gift_card_tax_total",
        "items.*",
        "shipping_methods.*",
        "summary.*",
      ],
      filters: {
        id: data.id,
      },
    });

    if (!orders?.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Order with ID ${data.id} not found.`
      );
    }

    order = orders[0];
  } catch (err) {
    logger.error(`[RESEND PLUGIN] Failed to fetch order details: ${err}`);
    if (err instanceof MedusaError) throw err;
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Unable to fetch order details."
    );
  }

  let pdf: Attachment | undefined;
  if (useDocumentsPlugin) {
    try {
      const { buffer } =
        await documentsModuleService.generateInvoiceForOrder(order);

      if (!buffer) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Generated invoice buffer is empty."
        );
      }

      pdf = {
        filename: `invoice-${order.id}.pdf`,
        content: buffer.toString("base64"),
        contentType: "application/pdf",
      };
    } catch (err) {
      logger.error(`[RESEND PLUGIN] Failed to generate PDF invoice: ${err}`);
      if (err instanceof MedusaError) throw err;
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Failed to generate invoice PDF."
      );
    }
  }

  try {
    logger.info("[RESEND PLUGIN] Sending order confirmation email...");

    await sendEmailResendWorkflow().run({
      input: {
        templateKey: "order-placed", // Required field for the workflow
        data: {
          toEmail: order.email, // Required field for the workflow
          total: order.total,
          currency: order.currency_code,
        },
        ...(pdf ? { attachments: [pdf] } : {}),
      },
    });

    logger.info("[RESEND PLUGIN] Order confirmation email sent.");
  } catch (err) {
    logger.error(`[RESEND PLUGIN] Failed to send confirmation email: ${err}`);
    if (err instanceof MedusaError) throw err;
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Failed to send confirmation email."
    );
  }
}

export const config: SubscriberConfig = {
  event: ["order.placed"],
};
