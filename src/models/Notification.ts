import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId; // Null means broadcast/Admin general notification
  type: "NEW_MODERATOR" | "NEW_ORDER" | "STATUS_UPDATE";
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    type: { type: String, required: true, enum: ["NEW_MODERATOR", "NEW_ORDER", "STATUS_UPDATE"] },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
