import { NextRequest, NextResponse } from 'next/server';
import SaleEvent from '@/models/SaleEvent';
import TaxPaymentEvent from '@/models/TaxPaymentEvent';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const data = await req.json();

  console.log('Request data:', data);

  // Connect to MongoDB
  if (!mongoose.connection.readyState) {
    await mongoose.connect(process.env.MONGO_URI || '');
  }

  try {
    switch (data.eventType) {
      case 'SALES': {
        // Validate sale event data
        if (!data.invoiceId || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
          return NextResponse.json({ message: 'Invalid Sale Event data' }, { status: 400 });
        }

        // Create and save SaleEvent
        const saleEvent = new SaleEvent(data);
        await saleEvent.save();
        break;
      }

      case 'TAX_PAYMENT': {
        // Validate tax payment data
        if (!data.amount) {
          return NextResponse.json({ message: 'Invalid Tax Payment Event data' }, { status: 400 });
        }

        // Create and save TaxPaymentEvent
        const taxPaymentEvent = new TaxPaymentEvent(data);
        await taxPaymentEvent.save();
        break;
      }

      default:
        return NextResponse.json({ message: 'Invalid event type' }, { status: 400 });
    }

    // Successful response
    return NextResponse.json({}, { status: 202 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
