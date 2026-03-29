-- Grant replication privilege so Debezium can open a logical replication slot
ALTER ROLE cdcuser REPLICATION LOGIN;

-- Source table the demo will watch via CDC
CREATE TABLE IF NOT EXISTS products (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    category   VARCHAR(100) NOT NULL,
    price      NUMERIC(10, 2) NOT NULL,
    stock      INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- REPLICA IDENTITY FULL means the WAL includes the full BEFORE image on
-- UPDATE and DELETE, so Debezium can emit the "before" field in change events.
ALTER TABLE products REPLICA IDENTITY FULL;

-- Seed data so the UI is not empty on first load
INSERT INTO products (name, category, price, stock) VALUES
    ('Mechanical Keyboard', 'Electronics', 149.99, 25),
    ('Standing Desk',       'Furniture',   599.00,  8),
    ('USB-C Hub',           'Electronics',  49.95, 100);
