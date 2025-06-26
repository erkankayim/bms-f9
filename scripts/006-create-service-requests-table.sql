-- Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
    id SERIAL PRIMARY KEY,
    customer_mid VARCHAR(50),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    product_stock_code VARCHAR(100),
    product_name VARCHAR(255) NOT NULL,
    product_brand VARCHAR(100),
    product_model VARCHAR(100),
    fault_description TEXT NOT NULL,
    service_status VARCHAR(20) DEFAULT 'pending' CHECK (service_status IN ('pending', 'in_progress', 'completed', 'delivered', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    technician_name VARCHAR(255),
    service_notes TEXT,
    received_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_date DATE,
    delivery_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_mid ON service_requests(customer_mid);
CREATE INDEX IF NOT EXISTS idx_service_requests_product_stock_code ON service_requests(product_stock_code);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(service_status);
CREATE INDEX IF NOT EXISTS idx_service_requests_priority ON service_requests(priority);
CREATE INDEX IF NOT EXISTS idx_service_requests_received_date ON service_requests(received_date);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at);

-- Add foreign key constraints if tables exist
DO $$
BEGIN
    -- Check if customers table exists and add foreign key
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers') THEN
        ALTER TABLE service_requests 
        ADD CONSTRAINT fk_service_requests_customer 
        FOREIGN KEY (customer_mid) REFERENCES customers(mid) ON DELETE SET NULL;
    END IF;
    
    -- Check if products table exists and add foreign key
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        ALTER TABLE service_requests 
        ADD CONSTRAINT fk_service_requests_product 
        FOREIGN KEY (product_stock_code) REFERENCES products(stock_code) ON DELETE SET NULL;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Foreign key already exists, ignore
        NULL;
END $$;

-- Insert some sample data for testing
INSERT INTO service_requests (
    customer_name, 
    customer_phone, 
    product_name, 
    fault_description, 
    service_status, 
    priority,
    received_date
) VALUES 
(
    'Test Müşteri', 
    '0555 123 4567', 
    'Test Ürün', 
    'Açılmıyor, güç sorunu var', 
    'pending', 
    'normal',
    CURRENT_DATE
) ON CONFLICT DO NOTHING;
