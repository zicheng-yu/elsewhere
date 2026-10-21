import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss(), cloudflare()],
	// MapLibre (about 1 MB) is a lazy chunk loaded only when a map is on screen; the Worker bundle carries the demo world.
	build: { chunkSizeWarningLimit: 1600 },
});
