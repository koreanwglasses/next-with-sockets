import mongoose from "mongoose";
import config from "./config";

export const uri = `mongodb://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`;

export async function dbConnect() {
  const opts = {
    bufferCommands: false,
  };

  return await mongoose.connect(uri, opts);
}
