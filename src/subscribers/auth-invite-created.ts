import {
  logger,
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/framework";

import sendEmailResendWorkflow from "../workflows/send-email-resend-workflow";
import { RESEND_EMAIL_MODULE } from "../modules/resend-email";
import ResendEmailModuleService from "../modules/resend-email/service";

/**
 * Handles the "event.name" event by sending an email via the Resend plugin.
 */
export default async function authPasswordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  id: any;
}>) {
  const resendEmailService =
    container.resolve<ResendEmailModuleService>(RESEND_EMAIL_MODULE);

  const isHandled = await resendEmailService.isEventSet("invite.created");
  if (!isHandled) {
    logger.info("[RESEND PLUGIN] Event not listed in config. Skipping.");
    return;
  }

  logger.info("[RESEND PLUGIN] Sending password reset email...");

  // Retrieve email and token from database
  const query = container.resolve("query");

  const {
    data: [invite],
  } = await query.graph({
    entity: "invite",
    fields: ["email", "token"],
    filters: {
      id: data.id,
    },
  });

  const email = invite.email;
  const token = invite.token;

  const backendUrl = process.env.MEDUSA_BACKEND_URL;
  if (!backendUrl) {
    logger.warn("[RESEND PLUGIN] MEDUSA_BACKEND_URL is not defined.");
    return;
  }

  // Build invite URL
  const inviteUrl = `${backendUrl}/app/invite?token=${encodeURIComponent(
    token
  )}&email=${encodeURIComponent(email)}`;

  // DO NOT PASS THE CONTAINER TO THE WORKFLOW !!
  await sendEmailResendWorkflow().run({
    input: {
      templateKey: "auth-invite",
      data: {
        toEmail: email,
        inviteUrl: inviteUrl,
      },
    },
  });

  logger.info("[RESEND PLUGIN] Password reset email sent.");
}

export const config: SubscriberConfig = {
  event: ["invite.created"],
};
