import mongoose, { Schema, Document } from "mongoose";

interface SaleAmendmentEventDocument extends Document {
  date: Date;
  invoiceId: string;
  itemId: string;
  cost: number;
  taxRate: number;
}

const SaleAmendmentEventSchema = new Schema<SaleAmendmentEventDocument>({
  date: { type: Date, required: true },
  invoiceId: { type: String, required: true },
  itemId: { type: String, required: true },
  cost: { type: Number, required: true },
  taxRate: { type: Number, required: true },
});

export default mongoose.models.SaleAmendmentEvent ||
  mongoose.model<SaleAmendmentEventDocument>("SaleAmendmentEvent", SaleAmendmentEventSchema);
