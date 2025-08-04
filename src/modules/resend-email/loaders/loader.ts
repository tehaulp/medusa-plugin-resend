import { LoaderOptions } from "@medusajs/framework/types";
import { readdir, stat, readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import {
  ResendModuleOptions,
  StoredTemplate,
  Template,
  TemplateFn,
} from "../../../types/types";
import { MedusaError } from "@medusajs/framework/utils";
import { asValue } from "awilix";
import Handlebars from "handlebars";
import { logger } from "@medusajs/framework";

// In-memory registry for email templates
const templateRegistry: Map<string, StoredTemplate> = new Map();

/**
 * Loads and registers email templates using Handlebars.
 * Also injects plugin options and template registry into the container.
 */
async function loader({
  container,
  options,
}: LoaderOptions<ResendModuleOptions>) {
  logger.info("[RESEND PLUGIN] Loading plugin...");

  if (!options) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "[RESEND PLUGIN] Plugin configuration options are missing."
    );
  }

  // Set templates directory (custom or default)
  const templatesDir = join(
    process.cwd(),
    options.templatesDir || "src/templates/emails"
  );

  // Set default events array if not provided
  if (!Array.isArray(options.events)) {
    logger.warn(
      "[RESEND PLUGIN] 'events' not defined in config or invalid. Defaulting to []."
    );
    options.events = [];
  }

  // Check if directory exists and is valid
  if (!existsSync(templatesDir) || !(await stat(templatesDir)).isDirectory()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `[RESEND PLUGIN] '${templatesDir}' is not a valid template directory.`
    );
  }

  // Everything seems good, start registering templates
  logger.info(
    `[RESEND PLUGIN] Registering templates from '${templatesDir}'...`
  );

  try {
    const files = await readdir(templatesDir);
    const hbsFiles = files.filter((f) => f.endsWith(".hbs"));

    for (const file of hbsFiles) {
      const baseName = toKebabCase(file.replace(/\.hbs$/, ""));
      const hbsPath = join(templatesDir, file);
      const jsonPath = join(templatesDir, `${baseName}.json`);

      // Compile Handlebars template
      const hbsContent = await readFile(hbsPath, "utf-8");
      const templateFn: TemplateFn = Handlebars.compile(hbsContent);

      // Load optional metadata from adjacent .json file
      let metadata = {};
      if (existsSync(jsonPath)) {
        try {
          metadata = JSON.parse(await readFile(jsonPath, "utf-8"));
        } catch (err) {
          logger.warn(`[RESEND PLUGIN] Invalid JSON in '${jsonPath}': ${err}`);
        }
      }

      // Register the template
      registerTemplate(templateRegistry, {
        key: baseName,
        render: templateFn,
        metadata,
      });
    }

    // Inject the options and template registry into the container
    container.register("options", asValue(options));
    container.register("templatesRegistry", asValue(templateRegistry));

    logger.info(
      `[RESEND PLUGIN] Registered ${hbsFiles.length} email template(s).`
    );
  } catch (error) {
    logger.error("[RESEND PLUGIN] Failed to load templates:", error);
  }
}

export default loader;

/**
 * Converts a string to kebab-case.
 * Example: "MyTemplate_Name" → "my-template-name"
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+|_+/g, "-")
    .toLowerCase();
}

/**
 * Registers a single template in the registry.
 * Warns if the key is already taken.
 */
function registerTemplate(
  registry: Map<string, StoredTemplate>,
  { key, render, metadata }: Template
): boolean {
  if (!key || typeof key !== "string" || !key.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_ARGUMENT,
      `[RESEND PLUGIN] Invalid template key: "${key}"`
    );
  }

  if (registry.has(key)) {
    logger.warn(`[RESEND PLUGIN] Template with key "${key}" already exists.`);
    return false;
  }

  registry.set(key, { render, metadata });
  return true;
}
