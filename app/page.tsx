import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li>
            Navigate to:
            <ul className="list-disc pl-5">
              <li>
                <Link href="/transactions">Add Transactions</Link>
              </li>
              <li>
                <Link href="/tax-position">Query Tax Position</Link>
              </li>
              <li>
                <Link href="/amend-sale">Amend Sale</Link>
              </li>
            </ul>
          </li>
        </ol>
      </main>
    </div>
  );
}
