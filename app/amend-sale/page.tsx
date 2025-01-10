"use client";

import { useMutation } from "@tanstack/react-query";

async function amendSale(data: any) {
  const response = await fetch("/api/sale", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to amend sale");
  }
}

export default function AmendSale() {
  const mutation = useMutation(amendSale);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      date: e.target.date.value,
      invoiceId: e.target.invoiceId.value,
      itemId: e.target.itemId.value,
      cost: e.target.cost.value,
      taxRate: e.target.taxRate.value,
    };
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="datetime-local" name="date" required />
      <input type="text" name="invoiceId" placeholder="Invoice ID" required />
      <input type="text" name="itemId" placeholder="Item ID" required />
      <input type="number" name="cost" placeholder="Cost (in pennies)" required />
      <input type="number" name="taxRate" placeholder="Tax Rate" step="0.01" required />
      <button type="submit" disabled={mutation.isLoading}>
        Amend Sale
      </button>
    </form>
  );
}
