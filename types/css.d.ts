// Lets TypeScript accept side-effect style imports such as `import "./globals.css"`.
// (Newer TypeScript versions check these; Next.js only declares `*.module.css`.)
declare module "*.css";
