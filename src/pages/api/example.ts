import type { NextApiRequest, NextApiResponse } from "next";
import { Example } from "../../backend/models/example";
import { notify, subscribable } from "../../lib/subscriptions";

export default subscribable({
  async handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
      const data = await Example.find().lean().exec();
      return res.json(data);
    }
    if (req.method === "POST") {
      const example = new Example({
        data: req.body.data,
        created: new Date(Date.now()),
      });
      await example.save();
      notify(req, "/api/example");

      setTimeout(async () => {
        await Example.findByIdAndDelete(example._id).exec();
        notify(req, "/api/example");
      }, 1000 * 10);

      return res.status(200).send("OK");
    }
    return res.status(501).send("Not Implemented");
  },
});
