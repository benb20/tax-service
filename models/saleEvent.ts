import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  taxRate: {
    type: Number,
    required: true,
  },
});

const saleEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['SALES'], // Only "SALES" is valid for this schema
  },
  date: {
    type: Date,
    required: true,
  },
  invoiceId: {
    type: String,
    required: true,
  },
  items: {
    type: [saleItemSchema],
    required: true,
  },
});

const SaleEvent = mongoose.model('SaleEvent', saleEventSchema);
export default SaleEvent;
