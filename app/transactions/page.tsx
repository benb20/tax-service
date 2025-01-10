"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button"; // Import Button from ShadCN
import { Input } from "@/components/ui/input"; // Import Input from ShadCN
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select from ShadCN
import * as z from "zod";

// Define Zod validation schema for the transaction data
const ItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  cost: z.number().nonnegative("Cost must be zero or greater"),
  taxRate: z.number().min(0, "Tax rate cannot be negative"),
});

const TransactionDataSchema = z.object({
  eventType: z.enum(["SALES", "TAX_PAYMENT"]),
  amount: z.number().nonnegative("Amount must be greater than or equal to 0"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  items: z.array(ItemSchema).optional(), // Items are optional for TAX_PAYMENT
});

type TransactionData = z.infer<typeof TransactionDataSchema>;

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
  const [eventType, setEventType] = useState<"SALES" | "TAX_PAYMENT">("SALES");
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>("");
  const [items, setItems] = useState<{ itemId: string; cost: number; taxRate: number }[]>([]);

  // State to store error messages
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const mutation = useMutation<void, Error, TransactionData>({
    mutationFn: postTransaction,
    onSuccess: () => {
      setErrors({});
    },
    onError: (error: Error) => {
      console.error("Error submitting transaction:", error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod before submitting
    try {
      const transactionData: TransactionData = { eventType, amount, date, items };
      TransactionDataSchema.parse(transactionData); // This will throw an error if validation fails

      // Call mutate with transaction data
      mutation.mutate(transactionData);
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
        <Select
          value={eventType}
          onValueChange={setEventType}
          className={`mt-2 w-full p-2 border rounded-md ${errors.eventType ? 'border-red-500' : ''}`}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Event Types</SelectLabel>
              <SelectItem value="SALES">Sales</SelectItem>
              <SelectItem value="TAX_PAYMENT">Tax Payment</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.eventType && (
          <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Amount:</label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className={`mt-2 w-full p-2 border rounded-md ${errors.amount ? 'border-red-500' : ''}`}
        />
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date:</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`mt-2 w-full p-2 border rounded-md ${errors.date ? 'border-red-500' : ''}`}
        />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date}</p>
        )}
      </div>

      {/* Conditionally render items input for SALES event type */}
      {eventType === "SALES" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Items:</label>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <Input
                    type="text"
                    value={item.itemId}
                    onChange={(e) => {
                      const updatedItems = [...items];
                      updatedItems[index].itemId = e.target.value;
                      setItems(updatedItems);
                    }}
                    placeholder="Item ID"
                    className={`p-2 border rounded-md ${errors.items ? 'border-red-500' : ''}`}
                  />
                  <Input
                    type="number"
                    value={item.cost}
                    onChange={(e) => {
                      const updatedItems = [...items];
                      updatedItems[index].cost = Number(e.target.value);
                      setItems(updatedItems);
                    }}
                    placeholder="Cost"
                    className={`p-2 border rounded-md ${errors.items ? 'border-red-500' : ''}`}
                  />
                  <Input
                    type="number"
                    value={item.taxRate}
                    onChange={(e) => {
                      const updatedItems = [...items];
                      updatedItems[index].taxRate = Number(e.target.value);
                      setItems(updatedItems);
                    }}
                    placeholder="Tax Rate"
                    className={`p-2 border rounded-md ${errors.items ? 'border-red-500' : ''}`}
                  />
                </div>

                {/* "X" button to remove item */}
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
            onClick={() => setItems([...items, { itemId: "", cost: 0, taxRate: 0 }])}
            className="mt-2 bg-green-600 text-white py-2 px-4 rounded-md"
          >
            Add Item
          </Button>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={mutation.isLoading}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          {mutation.isLoading ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}
