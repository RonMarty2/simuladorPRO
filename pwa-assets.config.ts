import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    // Fondo oscuro para mantener consistencia con el logo
    apple: {
      ...minimal2023Preset.apple,
      padding: 0.3,
      resizeOptions: { background: "#0f172a", fit: "contain" },
    },
    maskable: {
      ...minimal2023Preset.maskable,
      padding: 0.3,
      resizeOptions: { background: "#0f172a", fit: "contain" },
    },
  },
  images: ["public/logo-source.svg"],
});
