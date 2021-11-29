export class FetchError extends Error {
  code: number;
  name: string;
  constructor(response: Response, message: string) {
    super(message);
    this.code = response.status;
    this.name = response.statusText;
  }
}

async function parseResponse(response: Response) {
  if (!response.ok) throw new FetchError(response, await response.text());

  try {
    return await response.clone().json();
  } catch (e) {
    if (e instanceof SyntaxError) {
      return await response.text();
    }
    throw e;
  }
}

export function joinQuery(
  url: string,
  query?: Record<string, string | number | boolean | undefined>
) {
  const queryEntries =
    query &&
    Object.entries(query).filter(
      ([key, value]) =>
        typeof key !== "undefined" && typeof value !== "undefined"
    );
  return `${url}${
    queryEntries?.length
      ? `${
          url.includes("?") ? (url.endsWith("&") ? "" : "&") : "?"
        }${queryEntries
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`
          )
          .join("&")}`
      : ""
  }`;
}

async function fetch2(
  url: string,
  method: string,
  body?: any,
  query?: Record<string, string | number | boolean | undefined>
) {
  const response = await fetch(
    joinQuery(url, query),
    method !== "get"
      ? {
          method,
          ...(body
            ? {
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
              }
            : {}),
        }
      : undefined
  );
  return parseResponse(response);
}

export async function post(
  url: string,
  body?: any,
  query?: Record<string, string | number | boolean | undefined>
) {
  return fetch2(url, "post", body, query);
}

export async function get(
  url: string,
  query?: Record<string, string | number | boolean | undefined>
) {
  return fetch2(url, "get", undefined, query);
}
