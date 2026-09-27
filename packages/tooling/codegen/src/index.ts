export type CodegenConfig = {
  readonly template: string;
  readonly language: string;
  readonly outputDir: string;
};

export interface CodeGenerator {
  generate(config: CodegenConfig): Promise<string>;
}

export interface CodegenEngine {
  registerGenerator(name: string, generator: CodeGenerator): void;
  getGenerator(name: string): CodeGenerator | undefined;
}

export function createCodegenEngine(): CodegenEngine {
  const generators = new Map<string, CodeGenerator>();

  return {
    registerGenerator: (name, generator) => generators.set(name, generator),
    getGenerator: name => generators.get(name),
  };
}
