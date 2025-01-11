import mongoose from 'mongoose';

const taxPaymentEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['TAX_PAYMENT'], 
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
