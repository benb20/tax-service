// pages/api/transactions.ts
import { NextRequest, NextResponse } from "next/server";
import SaleEvent from "@/models/saleEvent";
import TaxPaymentEvent from "@/models/taxPaymentEvent";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const data = await req.json();

  // Connect to MongoDB
  if (!mongoose.connection.readyState) {
    await mongoose.connect(process.env.MONGO_URI || "");
  }

  try {
    if (data.eventType === "SALES") {
      const saleEvent = new SaleEvent(data);
      await saleEvent.save();
    } else if (data.eventType === "TAX_PAYMENT") {
      const taxPaymentEvent = new TaxPaymentEvent(data);
      await taxPaymentEvent.save();
    } else {
      return NextResponse.json({ message: "Invalid event type" }, { status: 400 });
    }

    return NextResponse.json({}, { status: 202 });
  } catch (error: unknown) {
    // Type assertion to `Error` here
    const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
