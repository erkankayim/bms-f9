-- Add currency column to sales table
ALTER TABLE sales ADD COLUMN sale_currency VARCHAR(3) NOT NULL DEFAULT 'TRY';

-- Add a comment for clarity
COMMENT ON COLUMN sales.sale_currency IS 'The currency code (e.g., TRY, USD, EUR) for the amounts in this sale.';

-- Optional: If you want to update existing sales, you might run something like this.
-- For now, we'll just default them to TRY.
-- UPDATE sales SET sale_currency = 'TRY' WHERE sale_currency IS NULL;
