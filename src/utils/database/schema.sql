-- Test if we can create tables and basic operations
-- This is just for testing, we'll expand this later

-- Create a simple test table to verify everything works
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    author VARCHAR(100) NOT NULL,
    published_date DATE NOT NULL,
    image TEXT,
    summary TEXT,
    content TEXT,
    tags TEXT[], -- PostgreSQL array type
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_date);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author);

-- Insert a test record to verify everything works
INSERT INTO articles (title, category, subcategory, author, published_date, summary, tags) 
VALUES (
    'Database Connection Test Article',
    'technology',
    'database',
    'System Admin',
    CURRENT_DATE,
    'This is a test article to verify database connectivity.',
    ARRAY['test', 'database', 'connection']
) ON CONFLICT DO NOTHING;