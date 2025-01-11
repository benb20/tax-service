"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2"; // SweetAlert2 for alerts
import { Button } from "@/components/ui/button"; // ShadCN Button
import { Input } from "@/components/ui/input"; // ShadCN Input
import { CalendarIcon } from "lucide-react"; // Calendar Icon
import { Calendar } from "@/components/ui/calendar"; // ShadCN Calendar
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // ShadCN Popover
import { format } from "date-fns"; // date formatting
import { cn } from "@/lib/utils"; // Utility for conditional class names
import * as z from "zod";

// Validation schema for sale amendment
const SaleAmendmentSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  invoiceId: z.string().min(1, "Invoice ID is required"),
  itemId: z.string().min(1, "Item ID is required"),
  cost: z.number().nonnegative("Cost must be zero or greater"),
  taxRate: z.number()
    .min(0, "Tax rate cannot be negative")
    .max(1, "Tax rate must be between 0 and 1"),
});

type SaleAmendmentData = z.infer<typeof SaleAmendmentSchema>;

async function amendSale(data: SaleAmendmentData): Promise<void> {
  const response = await fetch("/api/sale", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to amend sale");
  }

  await response.json();
}

export default function AmendSale() {
  const [date, setDate] = useState<Date | null>(null); // Date picker state
  const [invoiceId, setInvoiceId] = useState<string>(""); // Invoice ID
  const [itemId, setItemId] = useState<string>(""); // Item ID
  const [cost, setCost] = useState<number>(0); // Cost
  const [taxRate, setTaxRate] = useState<number>(0); // Tax rate
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // Validation errors

  const mutation = useMutation<void, Error, SaleAmendmentData>({
    mutationFn: amendSale,
    onSuccess: () => {
      setErrors({});
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Sale amended successfully!",
      });
    },
    onError: (error: Error) => {
      console.error("Error amending sale:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to amend sale.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const saleData: SaleAmendmentData = {
      date: date ? date.toISOString() : "",
      invoiceId,
      itemId,
      cost,
      taxRate,
    };

    try {
      SaleAmendmentSchema.parse(saleData); // Validate input
      mutation.mutate(saleData); // Submit data
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Date:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Invoice ID:</label>
        <Input
          type="text"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
          placeholder="Invoice ID"
          className={`mt-2 w-full ${errors.invoiceId ? "border-red-500" : ""}`}
        />
        {errors.invoiceId && <p className="text-red-500 text-sm mt-1">{errors.invoiceId}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Item ID:</label>
        <Input
          type="text"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          placeholder="Item ID"
          className={`mt-2 w-full ${errors.itemId ? "border-red-500" : ""}`}
        />
        {errors.itemId && <p className="text-red-500 text-sm mt-1">{errors.itemId}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cost (p):</label>
        <Input
          type="number"
          value={cost}
          onChange={(e) => setCost(Number(e.target.value))}
          placeholder="Cost"
          className={`mt-2 w-full ${errors.cost ? "border-red-500" : ""}`}
        />
        {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tax Rate (0-1):</label>
        <Input
          type="number"
          step="0.01"
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
          placeholder="Tax Rate"
          className={`mt-2 w-full ${errors.taxRate ? "border-red-500" : ""}`}
        />
        {errors.taxRate && <p className="text-red-500 text-sm mt-1">{errors.taxRate}</p>}
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-blue-600 text-white">
          Amend Sale
        </Button>
      </div>
    </form>
  );
}
