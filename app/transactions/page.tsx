"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2"; // Import SweetAlert2
import { Button } from "@/components/ui/button"; // Import Button from ShadCN
import { Input } from "@/components/ui/input"; // Import Input from ShadCN
import { CalendarIcon } from "lucide-react"; // Import Calendar Icon
import { Calendar } from "@/components/ui/calendar"; // Import Calendar from ShadCN
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Import Popover
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select from ShadCN
import { EventType } from "@/types/eventTypes"; // Import Enum
import { format } from "date-fns"; // Import date formatting utility
import { cn } from "@/lib/utils"; // Utility for conditional class names
import * as z from "zod";

// Define Zod validation schema for the transaction data
const ItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  cost: z.number().nonnegative("Cost must be zero or greater"),
  taxRate: z.number().min(0, "Tax rate cannot be negative").max(1, "Tax rate must be between 0 and 1"), // Ensure tax rate is between 0 and 1
});

const TransactionDataSchema = z
  .object({
    eventType: z.enum([EventType.SALES, EventType.TAX_PAYMENT]),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    invoiceId: z.string().optional(),
    items: z
      .array(
        z.object({
          itemId: z.string().min(1, "Item ID is required"),
          cost: z.number().nonnegative("Cost must be zero or greater"),
          taxRate: z
            .number()
            .min(0, "Tax rate cannot be negative")
            .max(1, "Tax rate must be between 0 and 1"),
        })
      )
      .optional(), // Items are optional for TAX_PAYMENT
    amount: z.number().optional(), // Amount is optional but should be used for TAX_PAYMENT
  })
  .refine(
    (data) => {
      if (data.eventType === EventType.SALES) {
        return data.items && data.items.length > 0; // Ensure at least one item is added for SALES
      }
      return true; // No additional validation for TAX_PAYMENT
    },
    {
      message: "At least one item must be added for sales events",
      path: ["items"], // This sets the error under the 'items' field
    }
  )
  .refine(
    (data) => {
      if (data.eventType === EventType.SALES && !data.invoiceId) {
        return false;
      }
      return true;
    },
    {
      message: "Invoice ID is required for sales events",
      path: ["invoiceId"],
    }
  );


type TransactionData = z.infer<typeof TransactionDataSchema>;

// Dropdown event types, with display names for the UI
const eventTypeLabels: { [key in EventType]: string } = {
  [EventType.SALES]: "Sales",
  [EventType.TAX_PAYMENT]: "Tax Payment",
};

async function postTransaction(data: TransactionData): Promise<void> {
  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to save transaction");
  }

  await response.json();
}

export default function AddTransaction() {
  const [eventType, setEventType] = useState<EventType>(EventType.SALES);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<Date | null>(null); 
  const [items, setItems] = useState<{ itemId: string; cost: number; taxRate: number }[]>([]);
  const [invoiceId, setInvoiceId] = useState<string>(""); 
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const mutation = useMutation<void, Error, TransactionData>({
    mutationFn: postTransaction,
    onSuccess: () => {
      // Clear errors and show success alert
      setErrors({});
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Transaction submitted successfully!",
      });
    },
    onError: (error: Error) => {
      console.error("Error submitting transaction:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to submit transaction.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    // Prepare the transaction data based on event type
    const transactionData: TransactionData = {
      eventType,
      date: date ? date.toISOString() : "",
      invoiceId: eventType === EventType.SALES ? invoiceId : undefined, // Include invoiceId only for SALES
      amount: eventType === EventType.TAX_PAYMENT ? amount : undefined, // Include amount only for TAX_PAYMENT
      items: eventType === EventType.SALES ? items : undefined, // Include items only for SALES
    };
  
    try {
      // Validate transaction data with Zod schema
      TransactionDataSchema.parse(transactionData); // This will throw an error if validation fails
      mutation.mutate(transactionData); // Submit data if valid
      setErrors({}); // Clear any existing errors on success
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
  
        // Populate error messages for the fields
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
  
        setErrors(newErrors); // Set error state for showing validation errors
      }
    }
  };

  const removeItem = (index: number) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Event Type:</label>
        <Select value={eventType} onValueChange={(value) => setEventType(value as EventType)}>
          <SelectTrigger className={`mt-2 w-full p-2 border rounded-md ${errors.eventType ? "border-red-500" : ""}`}>
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Event Types</SelectLabel>
              <SelectItem value={EventType.SALES}>
                {eventTypeLabels[EventType.SALES]} 
              </SelectItem>
              <SelectItem value={EventType.TAX_PAYMENT}>
                {eventTypeLabels[EventType.TAX_PAYMENT]} 
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.eventType && <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>}
      </div>

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
            selected={date ?? undefined} // Ensure date is either a Date or undefined, not null
            onSelect={(newDate) => {
              setDate(newDate ?? null);  // If newDate is undefined, set it to null
            }}
            initialFocus
          />
          </PopoverContent>
        </Popover>
        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
      </div>
      
      {eventType === EventType.SALES && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice ID:</label>
          <Input
            type="text"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            className={`mt-2 w-full p-2 border rounded-md ${errors.invoiceId ? "border-red-500" : ""}`}
          />
          {errors.invoiceId && <p className="text-red-500 text-sm mt-1">{errors.invoiceId}</p>}
        </div>
      )}

      {eventType === EventType.TAX_PAYMENT && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount:</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className={`mt-2 w-full p-2 border rounded-md ${errors.amount ? "border-red-500" : ""}`}
          />
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
        </div>
      )}

      {eventType === EventType.SALES && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Items:</label>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Item ID</label>
                    <Input
                      type="text"
                      value={item.itemId}
                      onChange={(e) => {
                        const updatedItems = [...items];
                        updatedItems[index].itemId = e.target.value;
                        setItems(updatedItems);
                      }}
                      placeholder="Item ID"
                      className={`p-2 border rounded-md ${errors.items ? "border-red-500" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Cost</label>
                    <Input
                      type="number"
                      value={item.cost}
                      onChange={(e) => {
                        const updatedItems = [...items];
                        updatedItems[index].cost = Number(e.target.value);
                        setItems(updatedItems);
                      }}
                      placeholder="Cost"
                      className={`p-2 border rounded-md ${errors.items ? "border-red-500" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Tax Rate (0-1)</label>
                    <Input
                      type="number"
                      value={item.taxRate}
                      onChange={(e) => {
                        const updatedItems = [...items];
                        updatedItems[index].taxRate = Math.min(
                          1,
                          Math.max(0, Number(e.target.value))
                        ); // Ensure tax rate is between 0 and 1
                        setItems(updatedItems);
                      }}
                      placeholder="Tax Rate"
                      className={`p-2 border rounded-md ${errors.items ? "border-red-500" : ""}`}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center p-0"
                >
                  <span className="text-xs font-bold">X</span>
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            onClick={() =>
              setItems([...items, { itemId: "", cost: 0, taxRate: 0 }])
            }
            className={`mt-4 ${errors.items ? "bg-red-600" : "bg-green-600"} text-white`}
          >
            {errors.items ? "Add Item (Required)" : "Add Item"}
          </Button>
          {errors.items && (
            <p className="text-red-500 text-sm mt-1">{errors.items}</p>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" className="w-full sm:w-auto mt-4">Submit</Button>
      </div>
    </form>
  );
}
