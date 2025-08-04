import { Attachment, Logger, NotificationTypes } from "@medusajs/types";
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/utils";
import { Resend, CreateEmailOptions } from "resend";
import { ProviderInjectedDependencies, ResendOptions } from "../../types/types";

export class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-resend";
  protected resend: Resend;
  protected options: ResendOptions;
  protected logger_: Logger;

  constructor({ logger }: ProviderInjectedDependencies, options: ResendOptions) {
    ResendNotificationProviderService.validateOptions(options);
    super();
    this.options = options;
    this.logger_ = logger;
    this.resend = new Resend(this.options.api_key);
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `api_key` is required in the provider's options."
      );
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `from` is required in the provider's options."
      );
    }
  }

  static validateNotification(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ) {
    if (!notification) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No notification information provided"
      );
    }
    if (notification.channel === "sms") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "SMS notification not supported"
      );
    }
  }

  formatAttachments(input?: Attachment[] | null) {
    if (!Array.isArray(input)) return undefined;

    return input.map((attachment) => ({
      content: attachment.content,
      filename: attachment.filename,
      content_type: attachment.content_type,
      disposition: attachment.disposition ?? "attachment",
      id: attachment.id ?? undefined,
    }));
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    ResendNotificationProviderService.validateNotification(notification);

    const attachments = this.formatAttachments(notification.attachments);
    const from = notification.from?.trim() || this.options.from;
    const text = String(notification.data?.text) || "";
    const subject = String(notification.data?.subject) || "";
    const message: CreateEmailOptions = {
      to: notification.to,
      from: from,
      text: text,
      html: notification.template,
      subject,
      attachments: attachments,
    };

    try {
      // Unfortunately we don't get anything useful back in the response
      await this.resend.emails.send(message);
      return {};
    } catch (error) {
      const errorCode = error.code;
      const responseError = error.response?.body?.errors?.[0];
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send resend email: ${errorCode} - ${
          responseError?.message ?? "unknown error"
        }`
      );
    }
  }
}