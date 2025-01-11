// pages/api/sale.ts
import { NextRequest, NextResponse } from "next/server";
import SaleEvent from "@/models/saleEvent";
import SaleAmendmentEvent from "@/models/saleAmendmentEvent";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const data = await req.json();
  const { date, invoiceId, itemId, cost, taxRate } = data;

  // Connect to MongoDB
  if (!mongoose.connection.readyState) {
    await mongoose.connect(process.env.MONGO_URI || "");
  }

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
      return NextResponse.json(
        { message: "Amendment saved. Sale does not exist yet." },
        { status: 202 }
      );
    }

    // Find the item within the sale event
    let item = saleEvent.items.find((i) => i.itemId === itemId);

    if (!item) {
      // If the item doesn't exist, add it to the sale
      item = {
        itemId,
        cost,
        taxRate,
      };
      saleEvent.items.push(item);
    } else {
      // If the item exists, update its cost and tax rate
      item.cost = cost;
      item.taxRate = taxRate;
    }

    // Save the updated sale event
    await saleEvent.save();

    return NextResponse.json({ message: "Sale updated and amendment logged." }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
