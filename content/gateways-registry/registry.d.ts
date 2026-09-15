export interface Gateway {
  slug: string;
  name: string;
  developer: string;
  description: string;
  packageName: string;
  featured?: boolean;
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
export declare const gateways: Gateway[];
//# sourceMappingURL=registry.d.ts.map
