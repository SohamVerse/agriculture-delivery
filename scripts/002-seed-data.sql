-- Insert sample categories
INSERT INTO categories (name, name_hi, description) VALUES
('Seeds', 'बीज', 'High quality agricultural seeds'),
('Fertilizers', 'उर्वरक', 'Organic and chemical fertilizers'),
('Tools', 'उपकरण', 'Farming tools and equipment'),
('Pesticides', 'कीटनाशक', 'Plant protection products');

-- Insert sample products
INSERT INTO products (name, name_hi, description, description_hi, price, stock_quantity, category_id, image_url) VALUES
('Organic Tomato Seeds', 'जैविक टमाटर के बीज', 'Premium quality organic tomato seeds', 'प्रीमियम गुणवत्ता के जैविक टमाटर के बीज', 299.00, 100, 1, '/placeholder.svg?height=300&width=300'),
('NPK Fertilizer', 'एनपीके उर्वरक', 'Balanced NPK fertilizer for all crops', 'सभी फसलों के लिए संतुलित एनपीके उर्वरक', 450.00, 50, 2, '/placeholder.svg?height=300&width=300'),
('Garden Spade', 'बगीचे की कुदाल', 'Heavy duty garden spade', 'भारी शुल्क बगीचे की कुदाल', 850.00, 25, 3, '/placeholder.svg?height=300&width=300'),
('Organic Pesticide', 'जैविक कीटनाशक', 'Eco-friendly organic pesticide', 'पर्यावरण अनुकूल जैविक कीटनाशक', 320.00, 75, 4, '/placeholder.svg?height=300&width=300'),
('Wheat Seeds', 'गेहूं के बीज', 'High yield wheat seeds', 'उच्च उत्पादन गेहूं के बीज', 180.00, 200, 1, '/placeholder.svg?height=300&width=300'),
('Compost Fertilizer', 'कंपोस्ट उर्वरक', 'Organic compost fertilizer', 'जैविक कंपोस्ट उर्वरक', 250.00, 80, 2, '/placeholder.svg?height=300&width=300');

-- Insert admin user (password: admin123)
INSERT INTO users (email, password, name, role, phone, address) VALUES
('admin@agridelivery.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', 'Admin User', 'admin', '+91-9876543210', 'Admin Office, Agriculture Hub');

-- Insert sample customer (password: customer123)
INSERT INTO users (email, password, name, role, phone, address) VALUES
('customer@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', 'John Farmer', 'customer', '+91-9876543211', 'Village Farm, District Agriculture');
