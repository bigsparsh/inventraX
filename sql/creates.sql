BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Alter tables to add image attributes
ALTER TABLE Users ADD COLUMN image VARCHAR(255);
ALTER TABLE Products ADD COLUMN image VARCHAR(255);

-- Dashboard views
CREATE VIEW total_products AS SELECT COUNT(*) AS total FROM Products;

CREATE VIEW total_users AS SELECT COUNT(*) AS total FROM Users;

CREATE VIEW total_categories AS SELECT COUNT(*) AS total FROM Categories;

CREATE VIEW low_stock_alert AS SELECT * FROM Products WHERE quantity < 10;

CREATE VIEW product_categories_pie_chart AS 
SELECT c.name AS category_name, COUNT(p.product_id) AS product_count 
FROM Categories c 
LEFT JOIN Products p ON c.category_id = p.category_id 
GROUP BY c.category_id, c.name;

-- Stored procedures for staff management
CREATE OR REPLACE PROCEDURE promote_user(p_user_id UUID, p_new_role Roles)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE RoleMapping SET role = p_new_role WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE PROCEDURE fire_user(p_user_id UUID)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM RoleMapping WHERE user_id = p_user_id;
    DELETE FROM Users WHERE user_id = p_user_id;
END;
$$;

-- Stored procedures for inventory check in/out
CREATE OR REPLACE PROCEDURE check_in(p_product_id UUID, p_user_id UUID)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Transactions (check_in_time, current_status, user_id, product_id) 
    VALUES (NOW(), 'IN', p_user_id, p_product_id);
    
    UPDATE Products SET quantity = quantity + 1 WHERE product_id = p_product_id;
END;
$$;

CREATE OR REPLACE PROCEDURE check_out(p_product_id UUID, p_user_id UUID)
LANGUAGE plpgsql
AS $$
DECLARE
    trans_id UUID;
BEGIN
    SELECT transaction_id INTO trans_id 
    FROM Transactions 
    WHERE product_id = p_product_id AND user_id = p_user_id AND current_status = 'IN' 
    ORDER BY check_in_time DESC 
    LIMIT 1;
    
    IF trans_id IS NOT NULL THEN
        UPDATE Transactions 
        SET check_out_time = NOW(), current_status = 'OUT' 
        WHERE transaction_id = trans_id;
        
        UPDATE Products SET quantity = quantity - 1 WHERE product_id = p_product_id;
    END IF;
END;
$$;

-- Triggers for inventory management
CREATE OR REPLACE FUNCTION update_inventory_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    old_qty INT;
    new_qty INT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.current_status = 'IN' THEN
            SELECT quantity INTO old_qty FROM Products WHERE product_id = NEW.product_id;
            new_qty := old_qty + 1;
            UPDATE Products SET quantity = new_qty WHERE product_id = NEW.product_id;
            INSERT INTO InventoryLogs (product_id, old_quantity, new_quantity, changed_by) 
            VALUES (NEW.product_id, old_qty, new_qty, NEW.user_id);
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.current_status = 'IN' AND NEW.current_status = 'OUT' THEN
            SELECT quantity INTO old_qty FROM Products WHERE product_id = NEW.product_id;
            new_qty := old_qty - 1;
            UPDATE Products SET quantity = new_qty WHERE product_id = NEW.product_id;
            INSERT INTO InventoryLogs (product_id, old_quantity, new_quantity, changed_by) 
            VALUES (NEW.product_id, old_qty, new_qty, NEW.user_id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_inventory
AFTER INSERT OR UPDATE ON Transactions
FOR EACH ROW EXECUTE FUNCTION update_inventory_on_transaction();

COMMIT;
