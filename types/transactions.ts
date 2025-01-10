type SaleItem = {
    itemId: string;
    cost: number;  // in pennies
    taxRate: number;
  };
  
  type SaleEvent = {
    eventType: "SALES";
    date: string;  // ISO date string
    invoiceId: string;
    items: SaleItem[];
  };
  
  type TaxPaymentEvent = {
    eventType: "TAX_PAYMENT";
    date: string;  // ISO date string
    amount: number; // in pennies
  };
  
  type TransactionData = SaleEvent | TaxPaymentEvent;
  