import nextPlugin from "eslint-config-next";
import tailwindcss from "eslint-plugin-tailwindcss";

export default [
  {
    ignores: ["node_modules/", ".next/", "dist/", "pnpm-lock.yaml"],
  },
  ...nextPlugin(),
  {
    name: "tailwindcss",
    files: ["**/*.{ts,tsx}"],
    plugins: {
      tailwindcss,
    },
    rules: {
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-custom-classname": "off",
    },
  },
];
