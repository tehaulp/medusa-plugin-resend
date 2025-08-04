### Subscriber example

```typescript
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
  somedata: any;
}>) {
  const resendEmailService =
    container.resolve<ResendEmailModuleService>(RESEND_EMAIL_MODULE);

  const isHandled = await resendEmailService.isEventSet("event.name");
  if (!isHandled) {
    logger.info("[RESEND PLUGIN] Event not listed in config. Skipping.");
    return;
  }

  logger.info("[RESEND PLUGIN] Sending email...");

  // DO NOT PASS THE CONTAINER TO THE WORKFLOW !!
  await sendEmailResendWorkflow().run({
    input: {
      templateKey: "template-name",
      data: {
        somedata: data.somedata,
      },
    },
  });

  logger.info("[RESEND PLUGIN] Password reset email sent.");
}

export const config: SubscriberConfig = {
  event: "event.name",
};
```
