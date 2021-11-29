import mongoose from "mongoose";

export type Example = {
  _id: string;
  data: string;
  created: Date;
};

const schema = new mongoose.Schema<Example>({
  data: String,
  created: Date,
});

export const Example: mongoose.Model<Example> =
  mongoose.models.Example || mongoose.model("Example", schema);
