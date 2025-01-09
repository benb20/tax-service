import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  cost: { type: Number, required: true }, // in pennies
  taxRate: { type: Number, required: true },
});

const saleEventSchema = new mongoose.Schema({
  eventType: { type: String, enum: ['SALES'], required: true },
  date: { type: Date, required: true },
  invoiceId: { type: String, required: true },
  items: [itemSchema],
});

const SaleEvent = mongoose.models.SaleEvent || mongoose.model('SaleEvent', saleEventSchema);

export default SaleEvent;
