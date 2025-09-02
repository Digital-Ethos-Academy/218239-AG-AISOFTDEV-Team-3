-- USERS
INSERT INTO users (username, password_hash, full_name, email, role) VALUES ('sarah.w', 'hash1', 'Sarah Williams', 'sarah.w@example.com', 'warehouse_worker');
INSERT INTO users (username, password_hash, full_name, email, role) VALUES ('michael.h', 'hash2', 'Michael Harris', 'michael.h@example.com', 'inventory_manager');
INSERT INTO users (username, password_hash, full_name, email, role) VALUES ('john.p', 'hash3', 'John Peterson', 'john.p@example.com', 'procurement_officer');
INSERT INTO users (username, password_hash, full_name, email, role) VALUES ('emily.t', 'hash4', 'Emily Tran', 'emily.t@example.com', 'warehouse_worker');
INSERT INTO users (username, password_hash, full_name, email, role) VALUES ('david.k', 'hash5', 'David Kim', 'david.k@example.com', 'inventory_manager');
INSERT INTO users (username, password_hash, full_name, email, role) VALUES ('laura.m', 'hash6', 'Laura Martinez', 'laura.m@example.com', 'procurement_officer');
INSERT INTO users (username, password_hash, full_name, email, role) VALUES ('kevin.b', 'hash7', 'Kevin Brown', 'kevin.b@example.com', 'warehouse_worker');
INSERT INTO users (username, password_hash, full_name, email, role) VALUES ('olivia.s', 'hash8', 'Olivia Smith', 'olivia.s@example.com', 'inventory_manager');
INSERT INTO users (username, password_hash, full_name, email, role) VALUES ('daniel.c', 'hash9', 'Daniel Chen', 'daniel.c@example.com', 'procurement_officer');
INSERT INTO users (username, password_hash, full_name, email, role) VALUES ('rachel.j', 'hash10', 'Rachel Jones', 'rachel.j@example.com', 'warehouse_worker');

-- WAREHOUSES
INSERT INTO warehouses (name, address, phone) VALUES ('Central Warehouse', '123 Main St, Springfield', '555-0100');
INSERT INTO warehouses (name, address, phone) VALUES ('North Distribution Center', '456 North Ave, Springfield', '555-0101');
INSERT INTO warehouses (name, address, phone) VALUES ('South Fulfillment Hub', '789 South Rd, Springfield', '555-0102');
INSERT INTO warehouses (name, address, phone) VALUES ('East Storage', '321 East Blvd, Springfield', '555-0103');
INSERT INTO warehouses (name, address, phone) VALUES ('West Logistics Point', '654 West Dr, Springfield', '555-0104');
INSERT INTO warehouses (name, address, phone) VALUES ('Downtown Depot', '100 Center Plaza, Springfield', '555-0105');
INSERT INTO warehouses (name, address, phone) VALUES ('Airport Hub', '1 Aviation Way, Springfield', '555-0106');
INSERT INTO warehouses (name, address, phone) VALUES ('Tech Park Warehouse', '8700 Innovation Pkwy, Springfield', '555-0107');
INSERT INTO warehouses (name, address, phone) VALUES ('Riverside Storage', '202 River Rd, Springfield', '555-0108');
INSERT INTO warehouses (name, address, phone) VALUES ('Suburban Fulfillment', '800 Suburb Ln, Springfield', '555-0109');

-- SUPPLIERS
INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES ('Acme Industrial', 'Helen Grant', '555-1001', 'helen.grant@acmeind.com', '100 Acme Ave, Springfield');
INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES ('Global Parts Co', 'Mike Lee', '555-1002', 'mike.lee@globalparts.com', '2500 Global Dr, Springfield');
INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES ('Prime Logistics', 'Samantha Clark', '555-1003', 's.clark@primelogistics.com', '480 Prime Way, Springfield');
INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES ('Alpha Manufacturing', 'Carlos Rivera', '555-1004', 'c.rivera@alphamfg.com', '700 Alpha Rd, Springfield');
INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES ('Supply Solutions', 'Nina Patel', '555-1005', 'nina.patel@supplysol.com', '900 Solution St, Springfield');
INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES ('Brightline Electronics', 'George Liu', '555-1006', 'g.liu@brightline.com', '300 Circuit Ln, Springfield');
INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES ('Midwest Packaging', 'Lisa Kim', '555-1007', 'lisa.kim@midwestpack.com', '150 Midwest Blvd, Springfield');
INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES ('Optima Paper Goods', 'Paul Turner', '555-1008', 'p.turner@optimapaper.com', '42 Paper Ave, Springfield');
INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES ('Greenfield Plastics', 'Anna Bailey', '555-1009', 'a.bailey@greenfieldplastics.com', '650 Plastic Pkwy, Springfield');
INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES ('Metro Fasteners', 'David Sanders', '555-1010', 'd.sanders@metrofasteners.com', '75 Metro St, Springfield');

-- PRODUCTS
INSERT INTO products (sku, name, description, barcode, supplier_id, reorder_point, reorder_quantity, lead_time_days) VALUES ('SKU1001', 'Standard Shipping Box', 'Cardboard box, 18x18x24 in.', '1234567890123', 7, 100, 500, 7);
INSERT INTO products (sku, name, description, barcode, supplier_id, reorder_point, reorder_quantity, lead_time_days) VALUES ('SKU1002', 'Packing Tape', 'Clear adhesive tape, 2 in. x 110 yds.', '1234567890124', 7, 50, 200, 5);
INSERT INTO products (sku, name, description, barcode, supplier_id, reorder_point, reorder_quantity, lead_time_days) VALUES ('SKU1003', 'Bubble Wrap', 'Protective bubble wrap, 500 ft roll', '1234567890125', 5, 30, 100, 4);
INSERT INTO products (sku, name, description, barcode, supplier_id, reorder_point, reorder_quantity, lead_time_days) VALUES ('SKU1004', 'Industrial Gloves', 'Nitrile gloves, Large, 100 pack', '1234567890126', 1, 20, 50, 10);
INSERT INTO products (sku, name, description, barcode, supplier_id, reorder_point, reorder_quantity, lead_time_days) VALUES ('SKU1005', 'Barcode Scanner', 'Wireless barcode scanner, USB', '1234567890127', 6, 5, 10, 14);
INSERT INTO products (sku, name, description, barcode, supplier_id, reorder_point, reorder_quantity, lead_time_days) VALUES ('SKU1006', 'Pallet Jack', 'Heavy duty pallet jack, 5500 lb', '1234567890128', 4, 2, 5, 21);
INSERT INTO products (sku, name, description, barcode, supplier_id, reorder_point, reorder_quantity, lead_time_days) VALUES ('SKU1007', 'Thermal Printer', 'Label printer, 4x6 in.', '1234567890129', 6, 3, 6, 12);
INSERT INTO products (sku, name, description, barcode, supplier_id, reorder_point, reorder_quantity, lead_time_days) VALUES ('SKU1008', 'Industrial Shelving', 'Steel shelving unit, 72x48x24 in.', '1234567890130', 2, 10, 20, 15);
INSERT INTO products (sku, name, description, barcode, supplier_id, reorder_point, reorder_quantity, lead_time_days) VALUES ('SKU1009', 'Packing Slip Paper', 'Laser paper, 8.5x11 in., 500 sheets', '1234567890131', 8, 25, 100, 6);
INSERT INTO products (sku, name, description, barcode, supplier_id, reorder_point, reorder_quantity, lead_time_days) VALUES ('SKU1010', 'Plastic Pallet', 'Reusable plastic pallet, 48x40 in.', '1234567890132', 9, 12, 30, 18);

-- INVENTORY_LEVELS
INSERT INTO inventory_levels (product_id, warehouse_id, quantity) VALUES (1, 1, 1200);
INSERT INTO inventory_levels (product_id, warehouse_id, quantity) VALUES (2, 1, 350);
INSERT INTO inventory_levels (product_id, warehouse_id, quantity) VALUES (3, 2, 90);
INSERT INTO inventory_levels (product_id, warehouse_id, quantity) VALUES (4, 2, 40);
INSERT INTO inventory_levels (product_id, warehouse_id, quantity) VALUES (5, 3, 7);
INSERT INTO inventory_levels (product_id, warehouse_id, quantity) VALUES (6, 3, 2);
INSERT INTO inventory_levels (product_id, warehouse_id, quantity) VALUES (7, 4, 4);
INSERT INTO inventory_levels (product_id, warehouse_id, quantity) VALUES (8, 5, 15);
INSERT INTO inventory_levels (product_id, warehouse_id, quantity) VALUES (9, 5, 300);
INSERT INTO inventory_levels (product_id, warehouse_id, quantity) VALUES (10, 1, 25);

-- STOCK_MOVEMENTS
INSERT INTO stock_movements (product_id, warehouse_id, user_id, movement_type, quantity, reason, reference_number) VALUES (1, 1, 1, 'inbound', 600, 'receiving', 'PO-1001');
INSERT INTO stock_movements (product_id, warehouse_id, user_id, movement_type, quantity, reason, reference_number) VALUES (2, 1, 4, 'inbound', 200, 'receiving', 'PO-1002');
INSERT INTO stock_movements (product_id, warehouse_id, user_id, movement_type, quantity, reason, reference_number) VALUES (3, 2, 7, 'inbound', 100, 'receiving', 'PO-1003');
INSERT INTO stock_movements (product_id, warehouse_id, user_id, movement_type, quantity, reason, reference_number) VALUES (4, 2, 10, 'inbound', 50, 'receiving', 'PO-1004');
INSERT INTO stock_movements (product_id, warehouse_id, user_id, movement_type, quantity, reason, reference_number) VALUES (1, 1, 1, 'outbound', 100, 'shipment', 'SO-2001');
INSERT INTO stock_movements (product_id, warehouse_id, user_id, movement_type, quantity, reason, reference_number) VALUES (2, 1, 4, 'outbound', 50, 'shipment', 'SO-2002');
INSERT INTO stock_movements (product_id, warehouse_id, user_id, movement_type, quantity, reason, reference_number) VALUES (4, 2, 10, 'damage', 10, 'damaged', 'DMG-3001');
INSERT INTO stock_movements (product_id, warehouse_id, user_id, movement_type, quantity, reason, reference_number) VALUES (6, 3, 1, 'inbound', 2, 'receiving', 'PO-1005');
INSERT INTO stock_movements (product_id, warehouse_id, user_id, movement_type, quantity, reason, reference_number) VALUES (8, 5, 7, 'adjustment', 3, 'cycle count adjustment', 'CC-4001');
INSERT INTO stock_movements (product_id, warehouse_id, user_id, movement_type, quantity, reason, reference_number) VALUES (9, 5, 4, 'inbound', 300, 'receiving', 'PO-1007');

-- REORDER_ALERTS
INSERT INTO reorder_alerts (product_id, warehouse_id, triggered_at, suggested_quantity) VALUES (5, 3, '2025-07-31 09:30:00', 10);
INSERT INTO reorder_alerts (product_id, warehouse_id, triggered_at, suggested_quantity) VALUES (6, 3, '2025-07-31 10:00:00', 5);
INSERT INTO reorder_alerts (product_id, warehouse_id, triggered_at, suggested_quantity) VALUES (7, 4, '2025-07-31 11:15:00', 6);
INSERT INTO reorder_alerts (product_id, warehouse_id, triggered_at, suggested_quantity) VALUES (8, 5, '2025-07-31 12:45:00', 20);
INSERT INTO reorder_alerts (product_id, warehouse_id, triggered_at, suggested_quantity) VALUES (3, 2, '2025-07-30 14:20:00', 100);
INSERT INTO reorder_alerts (product_id, warehouse_id, triggered_at, suggested_quantity) VALUES (4, 2, '2025-07-30 15:10:00', 50);
INSERT INTO reorder_alerts (product_id, warehouse_id, triggered_at, suggested_quantity) VALUES (10, 1, '2025-07-29 11:05:00', 30);
INSERT INTO reorder_alerts (product_id, warehouse_id, triggered_at, suggested_quantity) VALUES (2, 1, '2025-07-28 13:00:00', 200);
INSERT INTO reorder_alerts (product_id, warehouse_id, triggered_at, suggested_quantity) VALUES (1, 1, '2025-07-27 09:00:00', 500);
INSERT INTO reorder_alerts (product_id, warehouse_id, triggered_at, suggested_quantity) VALUES (9, 5, '2025-07-26 16:25:00', 100);