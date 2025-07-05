-- Add supplier_id column to inventory_movements table
ALTER TABLE inventory_movements 
ADD COLUMN supplier_id UUID REFERENCES suppliers(id);

-- Add index for better performance when filtering by supplier
CREATE INDEX idx_inventory_movements_supplier_id ON inventory_movements(supplier_id);

-- Add comment to document the purpose
COMMENT ON COLUMN inventory_movements.supplier_id IS 'Optional reference to supplier for stock adjustments and other movements';
