import mongoose, { Schema, Document } from "mongoose";

export interface IAnalyticsDocument extends Document {
  metric: string;
  source: string;
  data: Record<string, unknown>;
  createdAt: Date;
}

const AnalyticsEventSchema: Schema = new Schema(
  {
    metric: { type: String, required: true, index: true },
    source: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const AnalyticsEvent =
  mongoose.models.AnalyticsEvent ||
  mongoose.model<IAnalyticsDocument>("AnalyticsEvent", AnalyticsEventSchema);
