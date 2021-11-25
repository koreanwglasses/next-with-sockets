async function parseResponse(response: Response) {
  if (!response.ok)
    throw Object.assign(new Error(response.statusText), {
      code: response.status,
    });

  try {
    return await response.clone().json();
  } catch (e) {
    if (e instanceof SyntaxError) {
      return await response.text();
    }
    throw e;
  }
}

export async function post(url: string, body?: any) {
  const response = await fetch(url, {
    method: "post",
    ...(body
      ? {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      : {}),
  });
  return parseResponse(response);
}

export async function get(url: string, body?: Record<string, unknown>) {
  const response = await fetch(
    `${url}${
      body
        ? `?${Object.entries(body)
            .map(([key, value]) => `${key}=${value}`)
            .join("&")}`
        : ""
    }`
  );
  return parseResponse(response);
}
