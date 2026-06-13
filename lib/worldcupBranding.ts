// Official FIFA World Cup 2026 logo + shared World Cup branding.
// If the URL ever gets truncated (contains "…"), HAS_WC_LOGO turns false and
// banners fall back to the mascot so nothing breaks.
export const WC_LOGO_URL =
  "https://digitalhub.fifa.com/transform/157d23bf-7e13-4d7b-949e-5d27d340987e/WC26_Logo?&io=transform:fill&quality=75";

export const HAS_WC_LOGO = !WC_LOGO_URL.includes("…");

export const WC_HOST_TAGLINE = "WORLD CUP 2026 · CANADA · MEXICO · USA";
