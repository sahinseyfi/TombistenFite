import removeRadialProgressAtRule from "./postcss/removeRadialProgress.mjs";

const config = {
  plugins: ["@tailwindcss/postcss", removeRadialProgressAtRule],
};

export default config;
