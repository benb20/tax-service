"use client";
import { useState } from "react";

const TaxPosition = () => {
  const [date, setDate] = useState("");
  const [taxPosition, setTaxPosition] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      setError("Please provide a date.");
      return;
    }

    setError(null); // Clear any previous error

    try {
      const response = await fetch(`/api/tax-position?date=${date}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tax position.");
      }

      const data = await response.json();
      setTaxPosition(data.taxPosition);
    } catch (err) {
      setError("Error fetching tax position: " + err.message);
    }
  };

  return (
    <div>
      <h1>Query Tax Position</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Date (ISO 8601):
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <button type="submit">Query Tax Position</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {taxPosition !== null && (
        <p>Tax Position on {date}: £{(taxPosition / 100).toFixed(2)}</p>
      )}
    </div>
  );
};

export default TaxPosition;
