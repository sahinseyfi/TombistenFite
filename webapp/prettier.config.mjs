/** @type {import('prettier').Config} */
const config = {
  arrowParens: 'always',
  semi: true,
  singleQuote: false,
  trailingComma: 'all',
  tabWidth: 2,
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
