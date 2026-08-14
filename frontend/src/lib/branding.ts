import { prisma } from "./prisma";
import { unstable_cache } from "next/cache";

export const getBrandingSettings = unstable_cache(
  async () => {
    try {
      const settings = await prisma.systemSettings.findMany({
        where: {
          OR: [
            { key: { startsWith: "BRANDING_" } },
            { key: { in: ["APP_TIMEZONE", "APP_DATE_FORMAT"] } }
          ]
        }
      });
      
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

      const result = settings.reduce((acc, curr) => {
        if (curr.key === "BRANDING_FOUNDATION_NAME") acc.foundationName = curr.value;
        if (curr.key === "BRANDING_SHORT_NAME") acc.shortName = curr.value;
        if (curr.key === "BRANDING_LOGO") acc.logo = curr.value;
        if (curr.key === "BRANDING_FAVICON") acc.favicon = curr.value;
        if (curr.key === "BRANDING_LOGIN_LOGO") acc.loginLogo = curr.value;
        if (curr.key === "BRANDING_SIDEBAR_LOGO") acc.sidebarLogo = curr.value;
        if (curr.key === "BRANDING_HEADER_LOGO") acc.headerLogo = curr.value;
        if (curr.key === "APP_TIMEZONE") acc.timezone = curr.value;
        if (curr.key === "APP_DATE_FORMAT") acc.dateFormat = curr.value;
        return acc;
      }, defaultBranding);

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
