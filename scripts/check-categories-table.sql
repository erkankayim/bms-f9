-- Check if categories table exists and its structure
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'categories'
ORDER BY ordinal_position;

-- Check if table has any data
SELECT COUNT(*) as total_categories FROM categories;

-- Show first few records if any exist
SELECT * FROM categories LIMIT 10;

-- Check specifically if id column exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'categories' 
    AND column_name = 'id'
) as has_id_column;
