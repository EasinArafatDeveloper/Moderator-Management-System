import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvoice extends Document {
  orderId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  pdfUrl?: string;
  createdAt: Date;
}

const InvoiceSchema: Schema<IInvoice> = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    pdfUrl: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);
export default Invoice;
