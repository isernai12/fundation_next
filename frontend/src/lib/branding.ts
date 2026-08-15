import { unstable_cache } from "next/cache";
import { settingsApi } from "./api/settings";

export const getBrandingSettings = unstable_cache(
  async () => {
    try {
      const settings: Record<string, string> = await settingsApi.getSystemSettings().catch(() => ({}));
      
      const defaultBranding = {
        foundationName: "Foundation ERP",
        shortName: "ERP",
        logo: null as string | null,
        favicon: null as string | null,
        loginLogo: null as string | null,
        sidebarLogo: null as string | null,
        headerLogo: null as string | null,
        timezone: "Asia/Dhaka",
        dateFormat: "DD MMM YYYY"
      };

      const result = { ...defaultBranding };
      if (settings["BRANDING_FOUNDATION_NAME"]) result.foundationName = settings["BRANDING_FOUNDATION_NAME"];
      if (settings["BRANDING_SHORT_NAME"]) result.shortName = settings["BRANDING_SHORT_NAME"];
      if (settings["BRANDING_LOGO"]) result.logo = settings["BRANDING_LOGO"];
      if (settings["BRANDING_FAVICON"]) result.favicon = settings["BRANDING_FAVICON"];
      if (settings["BRANDING_LOGIN_LOGO"]) result.loginLogo = settings["BRANDING_LOGIN_LOGO"];
      if (settings["BRANDING_SIDEBAR_LOGO"]) result.sidebarLogo = settings["BRANDING_SIDEBAR_LOGO"];
      if (settings["BRANDING_HEADER_LOGO"]) result.headerLogo = settings["BRANDING_HEADER_LOGO"];
      if (settings["APP_TIMEZONE"]) result.timezone = settings["APP_TIMEZONE"];
      if (settings["APP_DATE_FORMAT"]) result.dateFormat = settings["APP_DATE_FORMAT"];

      return result;
    } catch (e) {
      console.error("Failed to load branding:", e);
      return {
        foundationName: "Foundation ERP",
        shortName: "ERP",
        logo: null,
        favicon: null,
        loginLogo: null,
        sidebarLogo: null,
        headerLogo: null,
        timezone: "Asia/Dhaka",
        dateFormat: "DD MMM YYYY"
      };
    }
  },
  ["branding-settings"],
  { tags: ["branding"] }
);
