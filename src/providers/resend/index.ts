import { ModuleProviderExports } from "@medusajs/types";
import { ResendNotificationProviderService } from "./service";

const services = [ResendNotificationProviderService];

const providerExport: ModuleProviderExports = {
  services,
};

export default providerExport;
