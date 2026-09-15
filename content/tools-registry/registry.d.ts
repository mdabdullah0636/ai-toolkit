export interface Tool {
  slug: string;
  name: string;
  description: string;
  packageName: string;
  tags?: string[];
  apiKeyEnvName?: string;
  installCommand: {
    pnpm: string;
    npm: string;
    yarn: string;
    bun: string;
  };
  codeExample: string;
  docsUrl?: string;
  apiKeyUrl?: string;
  websiteUrl?: string;
  npmUrl?: string;
}
export declare const tools: Tool[];
//# sourceMappingURL=registry.d.ts.map
