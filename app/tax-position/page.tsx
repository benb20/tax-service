"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button"; // ShadCN Button
import { CalendarIcon } from "lucide-react"; // Calendar Icon for selecting date
import { Calendar } from "@/components/ui/calendar"; // ShadCN Calendar
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // ShadCN Popover
import Swal from "sweetalert2"; // SweetAlert for success/error messages
import { format } from "date-fns"; // for formatting dates
import { Loader2 } from "lucide-react"; // Loader spinner for the button

// Type for the response from the /tax-position API
type TaxPositionResponse = {
  date: string;
  taxPosition: number;
};

// Fetch function to get the tax position for a given date
async function fetchTaxPosition(date: string): Promise<TaxPositionResponse> {
  const response = await fetch(`/api/tax-position?date=${date}`);
  if (!response.ok) {
    throw new Error("Failed to fetch tax position");
  }
  return response.json();
}

export default function QueryTaxPosition() {
  const [date, setDate] = useState<string>("");

  // UseQuery hook for fetching tax position data
  const { data, error, isLoading, refetch } = useQuery<TaxPositionResponse, Error>({
    queryKey: ["taxPosition", date],
    queryFn: () => fetchTaxPosition(date),
    enabled: false, // Disable automatic query triggering
  });

  // Handle error when the API request fails
  const handleError = (error: Error) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Failed to fetch tax position.",
    });
  };

  // Handle button click to trigger the API call
  const handleFetchTaxPosition = () => {
    if (date) {
      refetch(); // Trigger the fetch when the button is clicked
    }
  };

  // Render the component
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Query Tax Position</h1>

      {/* Date picker with Calendar popover */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Select Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full text-left mt-2">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(new Date(date), "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={date ? new Date(date) : undefined}
              onSelect={(selectedDate) => setDate(selectedDate?.toISOString() || "")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Fetch button */}
      <Button
        onClick={handleFetchTaxPosition}
        disabled={!date || isLoading}
        className="w-full py-2 px-4 bg-blue-600 text-white flex justify-center items-center"
      >
        {isLoading ? (
          <Loader2 className="animate-spin h-5 w-5 text-white" />
        ) : (
          "Get Tax Position"
        )}
      </Button>

      {/* Displaying the results */}
      {error && (
        <div className="mt-4 text-red-500">
          <p>Error: {error.message}</p>
        </div>
      )}

      {data && (
        <div className="mt-4 text-lg">
          <p>
            Tax Position as of {data.date}: £{(data.taxPosition / 100).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
