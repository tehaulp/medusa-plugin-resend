import type { Logger } from "@medusajs/types";

/**
 * Type representing a compiled Handlebars template function.
 */
export type TemplateFn = (vars: Record<string, any>) => string;

/**
 * Configuration options for the Resend plugin.
 */
export interface ResendModuleOptions {
  templatesDir: string;
  events: string[];
}

/**
 * Template structure used when registering templates.
 */
export interface Template {
  key: string;
  render: TemplateFn;
  metadata: Record<string, any>;
}

/**
 * Internal template structure stored in the registry.
 */
export interface StoredTemplate {
  render: TemplateFn;
  metadata: Record<string, any>;
}

/**
 * Dependencies injected into the ResendEmailModuleService.
 */
export interface ServiceInjectedDependencies {
  templatesRegistry: Map<string, StoredTemplate>;
  options: ResendModuleOptions;
}

/**
 * Dependencies injected into the email provider (e.g., Resend API).
 */
export interface ProviderInjectedDependencies {
  logger: Logger;
}

/**
 * Options for configuring the Resend provider.
 */
export interface ResendOptions {
  api_key: string;
  from: string;
  events?: string[];
}

/**
 * Input structure passed to the email workflow runner.
 */
export interface WorkflowInput {
  templateKey: string;
  data: Record<string, any>;
}

/**
 * Input structure passed to the email workflow step.
 */
export interface StepInput {
  templateKey: string;
  data: Record<string, any>;
}
