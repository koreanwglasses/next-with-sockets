import useSWR, { useSWRConfig } from "swr";
import { get } from "./fetchers";
import { useSocket } from "./use-socket";

export function useSubscription<T = any>(
  pathname: string,
  query?: Record<string, any>
) {
  const { mutate } = useSWRConfig();

  const result = useSWR<T & { dataKey: string }>(pathname, (pathname: string) =>
    get(pathname, {
      ...(query ?? {}),
      subscribe: true,
    })
  );

  useSocket(
    () => ({
      "subscription:update": (key: string) => {
        if (key === result.data?.dataKey) mutate(pathname);
      },
    }),
    [mutate, pathname, result.data?.dataKey]
  );

  return result;
}
