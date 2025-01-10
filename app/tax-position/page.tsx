"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type TaxPositionResponse = {
  date: string;
  taxPosition: number;
};

// Fetch function to retrieve tax position data
async function fetchTaxPosition(date: string): Promise<TaxPositionResponse> {
  const response = await fetch(`/api/tax-position?date=${date}`);
  if (!response.ok) {
    throw new Error("Failed to fetch tax position");
  }
  return response.json();
}

export default function QueryTaxPosition() {
  const [date, setDate] = useState<string>("");

  // UseQuery with proper type annotations
  const { data, error, isLoading } = useQuery<TaxPositionResponse, Error>({
    queryKey: ["taxPosition", date],
    queryFn: () => fetchTaxPosition(date),
    enabled: !!date, // Only run query if date is provided
  });

  return (
    <div>
      <h1>Query Tax Position</h1>
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <p>
          Tax Position as of {data.date}: £{(data.taxPosition / 100).toFixed(2)}
        </p>
      )}
    </div>
  );
}
