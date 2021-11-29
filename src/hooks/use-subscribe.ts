import useSWR from "swr";
import { get, joinQuery } from "../lib/fetchers";
import { useSocket, useSocketIdx } from "./use-socket";

export function useSubscribe<T = any>(
  url: string,
  query: Record<string, any> = {}
) {
  const socketIdx = useSocketIdx();

  const fullUrl = joinQuery(url, query);
  const result = useSWR<{ data: T; dataKey: string }>(
    socketIdx ? fullUrl : null,
    (fullUrl) =>
      get(fullUrl, {
        subscribe: true,
        socketIdx,
      })
  );

  if (
    result.data &&
    (!("data" in result.data) || typeof result.data.dataKey !== "string")
  ) {
    throw new Error(
      `Expected a response with body of type { data: T, dataKey: string } from server. Got: ${JSON.stringify(
        result.data,
        null,
        2
      )}`
    );
  }

  const { data, dataKey } = result.data ?? {};

  useSocket(
    () =>
      dataKey
        ? {
            [`subscription:${dataKey}:mutate`]: (data?: T) => {
              result.mutate(
                typeof data === "undefined" ? undefined : { data, dataKey }
              );
            },
          }
        : {},
    [dataKey, result]
  );

  return { ...result, data };
}
