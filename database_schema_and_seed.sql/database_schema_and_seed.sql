CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE categories (
    category_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    badge VARCHAR(100),
    image_url TEXT,
    flow_type VARCHAR(30) NOT NULL
);

CREATE TABLE merchants (
    merchant_id SERIAL PRIMARY KEY,
    business_name VARCHAR(150) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(category_id),
    esign_hash TEXT NOT NULL,
    approval_status VARCHAR(20) DEFAULT 'pending',
    location GEOMETRY(Point, 4326)
);

CREATE TABLE brand_products (
    product_id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) REFERENCES categories(category_id),
    sub_category_brand VARCHAR(150) NOT NULL,
    shop_name VARCHAR(150) NOT NULL,
    distance_km DECIMAL(5,2) NOT NULL,
    image_url TEXT,
    approval_status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    rejection_comment TEXT
);

CREATE TABLE product_measurement_variants (
    variant_id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES brand_products(product_id) ON DELETE CASCADE,
    measurement_label VARCHAR(60) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    weight_grams INT NOT NULL
);

CREATE TABLE event_escrow_bookings (
    booking_id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    total_agreed_price DECIMAL(10,2) NOT NULL,
    advance_percentage INT CHECK (advance_percentage IN (35, 85)),
    advance_paid_amount DECIMAL(10,2) NOT NULL,
    remaining_15_or_65_due_5hrs_prior DECIMAL(10,2) NOT NULL,
    status VARCHAR(40) DEFAULT 'ADVANCE_LOCKED_IN_ESCROW'
);

INSERT INTO categories VALUES
('daily_needs', 'Daily Home Needs', '10-20 Min Express', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300', 'instant_goods'),
('construction', 'Construction & Hardware', 'Heavy / Auto Dispatch', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300', 'heavy_goods'),
('medicines', 'Medicines & Pharmacy', 'Priority Rx Delivery', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300', 'instant_goods'),
('decorations', 'Decoration & Events', 'Escrow & Live Bidding', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300', 'event_decor');