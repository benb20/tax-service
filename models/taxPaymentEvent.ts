import mongoose from 'mongoose';

const taxPaymentEventSchema = new mongoose.Schema({
  eventType: { type: String, enum: ['TAX_PAYMENT'], required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true }, // in pennies
});

const TaxPaymentEvent =
  mongoose.models.TaxPaymentEvent || mongoose.model('TaxPaymentEvent', taxPaymentEventSchema);

export default TaxPaymentEvent;
