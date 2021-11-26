import mongoose, { Model } from "mongoose";

// Expose the session database as a model
// so that it can be accessed by Socket.IO

interface Session {
  _id: string;
  expires: Date;
  session: {
    socketIds: string[];
    socketIndices: Record<string, number>;
  };
}

const schema = new mongoose.Schema<Session>({
  expires: Date,
  session: {
    socketIds: [String],
    socketIndices: {},
  },
});

export const Session: Model<Session> =
  mongoose.models.Session || mongoose.model("Session", schema, "sessions");
