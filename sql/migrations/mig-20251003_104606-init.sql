BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE Roles AS ENUM('ADMIN', 'MANAGER', 'STAFF');
CREATE TYPE TransactionCurrentStatus AS ENUM ('IN', 'OUT');

CREATE TABLE Users ( 
	user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(100) NOT NULL,
	dob DATE NOT NULL,
	email VARCHAR(100) NOT NULL
);

CREATE TABLE RoleMapping (
	role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID REFERENCES Users(user_id),
	role Roles
);

CREATE TABLE Categories (
	category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(100) UNIQUE NOT NULL,
	description TEXT,
	created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Products (
	product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(100) NOT NULL,
	description TEXT,
	category_id UUID REFERENCES Categories(category_id),
	quantity INT DEFAULT 0
);

CREATE TABLE Transactions (
	transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	check_in_time TIMESTAMP NOT NULL,
	check_out_time TIMESTAMP,
	current_status TransactionCurrentStatus,
	user_id UUID REFERENCES Users(user_id),
	product_id UUID REFERENCES Products(product_id)
);

CREATE TABLE InventoryLogs (
	log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	product_id UUID REFERENCES Products(product_id),
	old_quantity INT,
	new_quantity INT,
	changed_by UUID REFERENCES Users(user_id)
);


COMMIT;
