export type Dataset = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly data: readonly Record<string, unknown>[];
};

export interface DatasetManager {
  createDataset(dataset: Dataset): Promise<void>;
  getDataset(id: string): Promise<Dataset | undefined>;
  listDatasets(): Promise<readonly Dataset[]>;
  deleteDataset(id: string): Promise<void>;
}

export interface DatasetsEngine {
  registerManager(name: string, manager: DatasetManager): void;
  getManager(name: string): DatasetManager | undefined;
  createDataset(dataset: Dataset): Promise<void>;
}

export function createDatasetsEngine(): DatasetsEngine {
  const managers = new Map<string, DatasetManager>();

  return {
    registerManager: (name, manager) => managers.set(name, manager),
    getManager: name => managers.get(name),
    createDataset: async () => {},
  };
}
