import { resolve } from "node:path";
import { defineConfig } from "vite";
import { minifyTemplateLiterals } from "rollup-plugin-minify-template-literals";
import pkg from "./package.json";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/index.ts"),
      name: "WalineComment",
      // the proper extensions will be added
      fileName: "waline-comment",
    },
    minify: "terser",
  },
  define: {
    VERSION: JSON.stringify(pkg.version),
  },
  plugins: [minifyTemplateLiterals()],
});
