// Global type declarations for non-TypeScript assets
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
