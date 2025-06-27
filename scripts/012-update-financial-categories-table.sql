-- Add is_active column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_categories' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE financial_categories ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_categories' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE financial_categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Update existing records to be active
UPDATE financial_categories SET is_active = true WHERE is_active IS NULL;

-- Make sure we have the unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'financial_categories' 
        AND constraint_name = 'financial_categories_name_type_key'
    ) THEN
        ALTER TABLE financial_categories ADD CONSTRAINT financial_categories_name_type_key UNIQUE(name, type);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN
        -- Constraint already exists, ignore
        NULL;
END $$;
