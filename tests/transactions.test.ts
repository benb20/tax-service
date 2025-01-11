import mongoose from 'mongoose';
import connectToDatabase from '../lib/mongodb';  // Using your existing database connection function
import SaleEvent from '../models/saleEvent';
import TaxPaymentEvent from '../models/taxPaymentEvent';  // Assuming you've created this model

beforeAll(async () => {
  await connectToDatabase();
});

afterAll(async () => {
    // Ensure the connection is open
    if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
      const db = mongoose.connection.db;
      if (db) {
        await db.dropDatabase();  // Safely access db and drop the database
      } else {
        console.log("Database connection object is not available.");
      }
    } else {
      console.log("Mongoose connection is not open, skipping database drop.");
    }
    await mongoose.disconnect();
  });

describe('Ingest Sale and Tax Payment Events', () => {
  it('should save a valid sale event', async () => {
    const saleEvent = {
      eventType: 'SALES',
      date: '2024-02-22T17:29:39Z',
      invoiceId: '3419027d-960f-4e8f-b8b7-f7b2b4791824',
      items: [
        {
          itemId: '02db47b6-fe68-4005-a827-24c6e962f3df',
          cost: 1099, // £10.99
          taxRate: 0.2,
        },
      ],
    };

    const savedSaleEvent = await SaleEvent.create(saleEvent);

    expect(savedSaleEvent.invoiceId).toBe(saleEvent.invoiceId);
    expect(savedSaleEvent.items[0].cost).toBe(1099);
    expect(savedSaleEvent.items[0].taxRate).toBe(0.2);
  });

  it('should save a valid tax payment event', async () => {
    const taxPaymentEvent = {
      eventType: 'TAX_PAYMENT',
      date: '2024-02-22T17:29:39Z',
      amount: 74901, // £749.01
    };

    const savedTaxPayment = await TaxPaymentEvent.create(taxPaymentEvent);

    expect(savedTaxPayment.amount).toBe(taxPaymentEvent.amount);
  });

  it('should reject invalid sale event without invoiceId', async () => {
    const invalidSaleEvent = {
      eventType: 'SALES',
      date: '2024-02-22T17:29:39Z',
      items: [
        {
          itemId: '02db47b6-fe68-4005-a827-24c6e962f3df',
          cost: 1099, // £10.99
          taxRate: 0.2,
        },
      ],
    };

    await expect(SaleEvent.create(invalidSaleEvent)).rejects.toThrowError('invoiceId');
  });
});
