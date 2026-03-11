export interface StateStorage<T extends Record<string, unknown> = Record<string, unknown>> {
  get(userId: string): Promise<T | undefined>;
  set(userId: string, state: T): Promise<void>;
  delete(userId: string): Promise<void>;
  has(userId: string): Promise<boolean>;
  keys?(): Promise<string[]>;
  clear?(): Promise<void>;
}
