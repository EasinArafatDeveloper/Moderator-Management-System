import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  moderatorId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  alternativePhone?: string;
  address: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  deliveryCharge: number;
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Delivered" | "Cancelled";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema<IOrder> = new Schema(
  {
    moderatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    alternativePhone: { type: String, default: "" },
    address: { type: String, required: true },
    productName: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Confirmed", "Delivered", "Cancelled"], default: "Pending" },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
