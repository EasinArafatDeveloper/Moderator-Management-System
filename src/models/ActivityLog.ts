import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}

const ActivityLogSchema: Schema<IActivityLog> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    details: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const ActivityLog: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
export default ActivityLog;
