// pages/api/sale.ts
import { NextRequest, NextResponse } from "next/server";
import SaleEvent from "@/models/saleEvent";
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
    // Find the sale event with the given invoiceId and itemId
    const saleEvent = await SaleEvent.findOne({ invoiceId });

    if (!saleEvent) {
      return NextResponse.json({ message: "Sale event not found" }, { status: 404 });
    }

    const item = saleEvent.items.find((i) => i.itemId === itemId);

    if (!item) {
      return NextResponse.json({ message: "Item not found in the sale" }, { status: 404 });
    }

    // Update the item's cost and tax rate
    item.cost = cost;
    item.taxRate = taxRate;

    // Save the updated sale event
    await saleEvent.save();

    return NextResponse.json({}, { status: 202 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
