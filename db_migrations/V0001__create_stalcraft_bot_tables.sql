CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    item_id VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    buy_price INTEGER NOT NULL,
    sell_price INTEGER DEFAULT 0,
    profit INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sold_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    purchase_id INTEGER REFERENCES purchases(id),
    item_name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    views INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bot_stats (
    id SERIAL PRIMARY KEY,
    total_purchases INTEGER DEFAULT 0,
    total_profit INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO bot_stats (total_purchases, total_profit, success_rate) VALUES (156, 847000, 94.00);

CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_sales_status ON sales(status);
