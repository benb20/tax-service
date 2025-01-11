import { NextRequest, NextResponse } from "next/server";
import SaleEvent from "@/models/saleEvent";
import TaxPaymentEvent from "@/models/taxPaymentEvent";
import connectToDatabase from "@/lib/mongodb";  // Import the connect function

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date");

  if (!dateParam) {
    return NextResponse.json({ message: "Date query parameter is required" }, { status: 400 });
  }

  const date = new Date(dateParam);

  // Connect to MongoDB using the centralized connection logic
  await connectToDatabase();

  try {
    // Get all sale events and tax payments
    const sales = await SaleEvent.find({ date: { $lte: date } });
    const taxPayments = await TaxPaymentEvent.find({ date: { $lte: date } });

    let totalSalesTax = 0;

    // Calculate total tax from sales
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        totalSalesTax += item.cost * item.taxRate; // cost * taxRate
      });
    });

    let totalTaxPayments = 0;

    // Calculate total tax payments
    taxPayments.forEach((payment) => {
      totalTaxPayments += payment.amount;
    });

    // Calculate tax position: Sales Tax - Tax Payments
    const taxPosition = totalSalesTax - totalTaxPayments;

    return NextResponse.json(
      {
        date: date.toISOString(),
        taxPosition,
      },
      { status: 200 }
    );
  } catch (error) {
    // Type guard to handle the error as an Error object
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    // If the error is not an instance of Error, return a generic error message
    return NextResponse.json({ message: "An unknown error occurred" }, { status: 500 });
  }
}
