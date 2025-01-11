import { NextRequest, NextResponse } from 'next/server';
import SaleEvent from '@/models/saleEvent';
import TaxPaymentEvent from '@/models/taxPaymentEvent';
import SaleAmendmentEvent from '@/models/saleAmendmentEvent';
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
        if (
          data.invoiceId === null ||
          data.items === null ||
          !Array.isArray(data.items) ||
          data.items.length === 0
        ) {
          return NextResponse.json({ message: 'Invalid Sale Event data' }, { status: 400 });
        }

        // Create and save SaleEvent
        const saleEvent = new SaleEvent(data);
        await saleEvent.save();

        // Check for any amendments associated with this invoiceId
        const latestAmendment = await SaleAmendmentEvent.findOne({ invoiceId: data.invoiceId })
          .sort({ date: -1 }); // Get the latest amendment by date

        if (latestAmendment) {
          // Apply amendments to the newly created sale
          for (const amendment of [latestAmendment]) {
            const existingItem = saleEvent.items.find(
              (item) => item.itemId === amendment.itemId
            );

            if (existingItem) {
              // Update the existing item
              existingItem.cost = amendment.cost;
              existingItem.taxRate = amendment.taxRate;
            } else {
              // Add the amendment as a new item if it doesn't already exist
              saleEvent.items.push({
                itemId: amendment.itemId,
                cost: amendment.cost,
                taxRate: amendment.taxRate,
              });
            }
          }

          // Save the updated sale event
          await saleEvent.save();
        }

        break;
      }

      case 'TAX_PAYMENT': {
        // Validate tax payment data
        if (data.amount === null) {
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
  } catch (error) {
    // Type guard to handle the error as an Error object
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    // If the error is not an instance of Error, return a generic error message
    return NextResponse.json({ message: "An unknown error occurred" }, { status: 500 });
  }
}
