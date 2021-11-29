import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";
import { joinQuery } from "./fetchers";
import { getSocket } from "./validate-socket-ids";

export function dataKeyFromURL(
  url: string,
  query?: Record<string, string | number | boolean | undefined>
) {
  const urlObj = new URL(joinQuery(url, query), "http://example.com");
  urlObj.searchParams.delete("subscribe");
  urlObj.searchParams.delete("socketIdx");
  const searchParams = [...urlObj.searchParams.entries()].sort();
  return joinQuery(urlObj.pathname, Object.fromEntries(searchParams));
}

export function subscribable<T>({
  dataKey,
  handler,
}: {
  dataKey?: string | ((req: NextApiRequest, res: NextApiResponse) => string);
  handler: NextApiHandler<T>;
}): NextApiHandler {
  return (req: NextApiRequest, res: NextApiResponse) => {
    if (JSON.parse((req.query.subscribe ?? "false") as string)) {
      const dataKey_ =
        typeof dataKey === "string"
          ? dataKey
          : typeof dataKey === "function"
          ? dataKey(req, res)
          : dataKeyFromURL(req.url!);

      const send = (data: T) => {
        subscribe(req, dataKey_);
        res.json({ data, dataKey: dataKey_ });
      };

      const res_ = Object.create(res);
      res_.send = send;
      res_.json = send;
      return handler(req, res_);
    } else {
      return handler(req, res);
    }
  };
}

export function subscribe(req: NextApiRequest, dataKey: string) {
  const room = `subscribers:${dataKey}`;
  const socket = getSocket(req);
  socket.join(room);
}

export function notify(
  req_io: NextApiRequest | Server,
  dataKey: string,
  data?: unknown
) {
  const io = (req_io as NextApiRequest).io ?? req_io;
  const room = `subscribers:${dataKey}`;
  io.to(room).emit(`subscription:${dataKey}:mutate`, data);
}
