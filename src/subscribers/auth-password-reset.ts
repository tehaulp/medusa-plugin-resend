import {
  logger,
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/framework";

import sendEmailResendWorkflow from "../workflows/send-email-resend-workflow";
import { RESEND_EMAIL_MODULE } from "../modules/resend-email";
import ResendEmailModuleService from "../modules/resend-email/service";

/**
 * Handles the "auth.password_reset" event by sending an email via the Resend plugin.
 */
export default async function authPasswordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  entity_id: string;
  actor_type: string;
  token: string;
}>) {
  const resendEmailService =
    container.resolve<ResendEmailModuleService>(RESEND_EMAIL_MODULE);

  const isHandled = await resendEmailService.isEventSet("auth.password_reset");
  if (!isHandled) {
    logger.info("[RESEND PLUGIN] Event not listed in config. Skipping.");
    return;
  }

  const backendUrl = process.env.MEDUSA_BACKEND_URL;
  if (!backendUrl) {
    logger.warn("[RESEND PLUGIN] MEDUSA_BACKEND_URL is not defined.");
    return;
  }

  const resetUrl = `${backendUrl}/app/reset-password?token=${encodeURIComponent(
    data.token
  )}&email=${encodeURIComponent(data.entity_id)}`;

  logger.info("[RESEND PLUGIN] Sending password reset email...");

  // DO NOT PASS THE CONTAINER TO THE WORKFLOW !!
  await sendEmailResendWorkflow().run({
    input: {
      templateKey: "auth-password-reset",
      data: {
        toEmail: data.entity_id,
        resetUrl,
      },
    },
  });

  logger.info("[RESEND PLUGIN] Password reset email sent.");
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
};
