import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  role: "Admin" | "Moderator";
  status: "Pending" | "Approved" | "Suspended";
  points: number;
  profilePicture?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Moderator"], default: "Moderator" },
    status: { type: String, enum: ["Pending", "Approved", "Suspended"], default: "Pending" },
    points: { type: Number, default: 0 },
    profilePicture: { type: String, default: "" },
    adminNotes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
