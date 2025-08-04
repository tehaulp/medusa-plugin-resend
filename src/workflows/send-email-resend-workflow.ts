import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import { sendEmailResendStep } from "./steps/send-email-resend-step";
import { WorkflowInput } from "../types/types";

/**
 * Workflow for sending an email using the Resend plugin.
 * Delegates logic to a single reusable step.
 */
function workflowFunction(payload: WorkflowInput) {
  sendEmailResendStep(payload);

  return new WorkflowResponse(true);
}

const sendEmailResendWorkflow = createWorkflow(
  "send-email-resend-workflow",
  workflowFunction
);

export default sendEmailResendWorkflow;
