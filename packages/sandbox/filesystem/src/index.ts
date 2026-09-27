export type VirtualFile = {
  readonly path: string;
  readonly content: string;
  readonly permissions: string;
};

export interface VirtualFileSystem {
  readFile(path: string): Promise<string | undefined>;
  writeFile(path: string, content: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  listFiles(prefix: string): Promise<readonly VirtualFile[]>;
}

export interface SandboxFS {
  mount(root: string): VirtualFileSystem;
  unmount(root: string): void;
  getFS(root: string): VirtualFileSystem | undefined;
}

export function createSandboxFS(): SandboxFS {
  const mounts = new Map<string, VirtualFileSystem>();

  return {
    mount: root => {
      const fs: VirtualFileSystem = {
        readFile: async () => undefined,
        writeFile: async () => {},
        deleteFile: async () => {},
        listFiles: async () => [],
      };
      mounts.set(root, fs);
      return fs;
    },
    unmount: root => mounts.delete(root),
    getFS: root => mounts.get(root),
  };
}
