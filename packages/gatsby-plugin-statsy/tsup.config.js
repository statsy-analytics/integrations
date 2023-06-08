import { defineConfig } from "tsup";

const cfg = {
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: false,
  dts: true,
  format: ["esm", "cjs"],
  target: "node14",
};

export default defineConfig([
  {
    ...cfg,
    entry: {
      // index: "src/index.tsx",
      "gatsby-ssr": "src/gatsby-ssr.tsx",
      "gatsby-node": "src/gatsby-node.ts",
    },
    external: ["react", "gatsby"],
    outDir: "dist",
  },
]);
