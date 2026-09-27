export type StudioConfig = {
  readonly theme: string;
  readonly layout: string;
  readonly providers: readonly string[];
};

export interface Studio {
  configure(config: StudioConfig): void;
  render(): Promise<string>;
}

export interface StudioEngine {
  registerStudio(name: string, studio: Studio): void;
  getStudio(name: string): Studio | undefined;
}

export function createStudioEngine(): StudioEngine {
  const studios = new Map<string, Studio>();

  return {
    registerStudio: (name, studio) => studios.set(name, studio),
    getStudio: name => studios.get(name),
  };
}
