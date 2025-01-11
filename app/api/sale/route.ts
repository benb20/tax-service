import { NextRequest, NextResponse } from "next/server";
import SaleEvent from "@/models/saleEvent";
import SaleAmendmentEvent from "@/models/saleAmendmentEvent";
import connectToDatabase from "@/lib/mongodb"; // Import the connect function
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const data = await req.json();
  const { date, invoiceId, itemId, cost, taxRate } = data;

  // Connect to MongoDB using the centralized connection logic
  await connectToDatabase();

  try {
    // Log the amendment to the sale_amendment_events collection
    const amendment = new SaleAmendmentEvent({
      date: date || new Date(),
      invoiceId,
      itemId,
      cost,
      taxRate,
    });
    await amendment.save();

    // Find the sale event with the given invoiceId
    const saleEvent = await SaleEvent.findOne({ invoiceId });

    if (!saleEvent) {
      // If the sale does not exist, return 202 (amendment saved but no sale to update)
      return new NextResponse(null, { status: 202 });
    }

    // Find the item within the sale event
    let item = saleEvent.items.find((i) => i.itemId === itemId);

    if (!item) {
      // If the item doesn't exist, create a new item object and push it to the saleEvent
      saleEvent.items.push({
        itemId,
        cost,
        taxRate,
      });
    } else {
      // If the item exists, update its cost and tax rate
      item.cost = cost;
      item.taxRate = taxRate;
    }

    // Save the updated sale event
    await saleEvent.save();

    // Return status code 202 with no body
    return new NextResponse(null, { status: 202 });
  } catch (error) {
    console.log(error);

    // Type guard to handle the error as an Error object
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    // If the error is not an instance of Error, return a generic error message
    return NextResponse.json({ message: "An unknown error occurred" }, { status: 500 });
  }
}
