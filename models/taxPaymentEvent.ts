import mongoose from 'mongoose';

const taxPaymentEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['TAX_PAYMENT'], // Only "TAX_PAYMENT" is valid for this schema
  },
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const TaxPaymentEvent = mongoose.model('TaxPaymentEvent', taxPaymentEventSchema);
export default TaxPaymentEvent;
