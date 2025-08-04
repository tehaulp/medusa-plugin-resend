import { logger } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { INotificationModuleService } from "@medusajs/framework/types";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

import ResendEmailModuleService from "../../modules/resend-email/service";
import { RESEND_EMAIL_MODULE } from "../../modules/resend-email";
import { StepInput } from "../../types/types";

/**
 * Step to render and send an email using the Resend plugin.
 */
async function stepFunction({ templateKey, data }: StepInput, { container }) {
  const notificationModuleService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION);

  const resendService: ResendEmailModuleService =
    container.resolve(RESEND_EMAIL_MODULE);

  try {
    // Render the HTML from the template
    const html = await resendService.renderTemplate(templateKey, data);

    // Retrieve metadata (e.g., subject)
    const tpl = await resendService.getTemplate(templateKey);
    const subject = tpl.metadata.subject || "New message";

    // Send the email via the notification module
    await notificationModuleService.createNotifications({
      to: data.toEmail,
      channel: "email",
      template: html,
      data: { subject },
    });

    logger.info(`[RESEND PLUGIN] Email queued to ${data.toEmail}`);

    return new StepResponse(true);
  } catch (err) {
    logger.error("[RESEND PLUGIN] Failed to send email.", err);
    throw err;
  }
}

export const sendEmailResendStep = createStep(
  "send-password-reset",
  stepFunction
);
