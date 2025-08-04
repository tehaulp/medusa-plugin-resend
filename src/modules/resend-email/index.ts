import { Module } from "@medusajs/framework/utils";
import ResendEmailModuleService from "./service";
import loader from "./loaders/loader";

export const RESEND_EMAIL_MODULE = "resend_email_module";

export default Module(RESEND_EMAIL_MODULE, {
  service: ResendEmailModuleService,
  loaders: [loader],
});
