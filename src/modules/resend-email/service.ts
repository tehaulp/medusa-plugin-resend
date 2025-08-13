import { logger } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import {
  ResendModuleOptions,
  ServiceInjectedDependencies,
  StoredTemplate,
} from "../../types/types";

/**
 * Service that manages email templates rendered using Handlebars.
 */
class ResendEmailModuleService {
  protected templatesRegistry_: Map<string, StoredTemplate>;
  protected options_: ResendModuleOptions;

  constructor({ templatesRegistry, options }: ServiceInjectedDependencies) {
    this.templatesRegistry_ = templatesRegistry ?? new Map();
    this.options_ = options ?? { events: [] };

    if (!this.options_.events) {
      this.options_.events = [];
    }

    if (!this.options_.sendInvoiceOnOrder) {
      this.options_.sendInvoiceOnOrder = false;
    }
  }

  /**
   * Checks if an event is declared in the plugin configuration.
   */
  public async isEventSet(event: string): Promise<boolean> {
    return (
      typeof event === "string" && this.options_.events!.includes(event.trim())
    );
  }

  public async useDocumentsPlugin(): Promise<boolean> {
    return this.options_.sendInvoiceOnOrder!;
  }

  /**
   * Retrieves a stored template by its key.
   * Throws an error if not found.
   */
  public async getTemplate(key: string): Promise<StoredTemplate> {
    if (!key || !this.templatesRegistry_.has(key)) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `[RESEND PLUGIN] No template found with key: "${key}"`
      );
    }

    return this.templatesRegistry_.get(key)!;
  }

  /**
   * Renders a template by key with the provided variables.
   */
  public async renderTemplate(
    key: string,
    vars: Record<string, any>
  ): Promise<string> {
    const tpl = await this.getTemplate(key);
    return tpl.render(vars);
  }

  /**
   * Logs all registered templates and their metadata.
   */
  public async logTemplates(): Promise<void> {
    if (this.templatesRegistry_.size === 0) {
      logger.info("[RESEND PLUGIN] No templates registered.");
      return;
    }

    logger.info("[RESEND PLUGIN] Registered templates:");
    for (const [key, { metadata }] of this.templatesRegistry_.entries()) {
      logger.info(`  - ${key}: ${JSON.stringify(metadata, null, 2)}`);
    }
  }
}

export default ResendEmailModuleService;
