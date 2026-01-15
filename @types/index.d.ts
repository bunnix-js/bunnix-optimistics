export interface OptimisticState<T> {
  base: { get(): T; set(v: T): void; subscribe(cb: (v: T) => void): () => void };
  optimistic: { get(): T; set(v: T): void; subscribe(cb: (v: T) => void): () => void };
  status: { get(): string; set(v: string): void; subscribe(cb: (v: string) => void): () => void };
  state: { get(): T; set(v: T): void; subscribe(cb: (v: T) => void): () => void };
  transaction<R>(
    fn: (tx: {
      apply(patch: (value: T) => T): void;
      commit(): void;
      rollback(): void;
      flush(): void;
      status: { get(): string; set(v: string): void; subscribe(cb: (v: string) => void): () => void };
    }) => Promise<R> | R
  ): Promise<R>;
}

type ReduxMiddleware<T> = (
  event: string,
  args: any,
  nextState: T,
  next?: () => any
) => any;

export function useOptimistics<T>(
  initial: T,
  reducersOrMiddleware:
    | Record<string, (state: T, args: any) => T>
    | {
        reducerMap: Record<string, (state: T, args: any) => T>;
        middleware: (event: string, args: any, nextState: T) => any;
      }
): OptimisticState<T> & Record<string, (args: any) => T>;

export function applyMiddlewareOptimistics<T>(
  ...middlewares: Array<ReduxMiddleware<T>>
): (reducers: Record<string, (state: T, args: any) => T>) => {
  reducerMap: Record<string, (state: T, args: any) => T>;
  middleware: (event: string, args: any, nextState: T) => any;
};
