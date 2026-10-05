import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The concept sites under public/demos are standalone, hand written and
    // partly vendored (three.min.js). Linting them buries real findings under
    // thousands of complaints about minified third party code.
    "public/**",
  ]),
]);

export default eslintConfig;
