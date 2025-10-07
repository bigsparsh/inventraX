import os

import psycopg
from utils.fcns import query_classifier
from dotenv import load_dotenv

"""
Test script that adds sample data to the database and tests the visualize function
"""


load_dotenv()

# Database connection
conn = psycopg.connect(os.getenv("DATABASE_URL_NORMAL"))

try:
    with conn.cursor() as cur:
        # Add sample categories
        print("Adding sample categories...")
        cur.execute("""
            INSERT INTO categories (name, description) VALUES
            ('Electronics', 'Electronic devices and accessories'),
            ('Furniture', 'Home and office furniture'),
            ('Clothing', 'Apparel and fashion items'),
            ('Books', 'Books and publications')
            ON CONFLICT (name) DO NOTHING;
        """)

        # Get category IDs
        cur.execute("SELECT category_id, name FROM categories")
        categories = {row[1]: row[0] for row in cur.fetchall()}

        # Add sample products
        print("Adding sample products...")
        products_data = [
            ("Laptop", "High performance laptop", categories["Electronics"], 15),
            ("Mouse", "Wireless mouse", categories["Electronics"], 50),
            ("Keyboard", "Mechanical keyboard", categories["Electronics"], 30),
            ("Monitor", "27 inch monitor", categories["Electronics"], 20),
            ("Desk", "Standing desk", categories["Furniture"], 10),
            ("Chair", "Ergonomic office chair", categories["Furniture"], 25),
            ("T-Shirt", "Cotton t-shirt", categories["Clothing"], 100),
            ("Jeans", "Denim jeans", categories["Clothing"], 75),
            ("Novel", "Fiction novel", categories["Books"], 40),
            ("Textbook", "Computer science textbook", categories["Books"], 20),
        ]

        for name, desc, cat_id, qty in products_data:
            cur.execute(
                """
                INSERT INTO products (name, description, category_id, quantity)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """,
                (name, desc, cat_id, qty),
            )

        conn.commit()
        print("Sample data added successfully!\n")

except Exception as e:
    print(f"Error adding data: {e}")
    conn.rollback()

finally:
    conn.close()

# Now test the functions
print("=" * 80)
print("Testing VISUALIZE function with data:")
print("=" * 80)
result = query_classifier("Show me the count of products by category")
print(f"\n\nFinal Result Type: {type(result)}")
print(f"\nChart Type: {result.chart_type}")
print(f"Title: {result.title}")
print(f"Description: {result.description}")
print("\nData:")
for item in result.data:
    print(f"  {item}")

print("\n\n")
print("=" * 80)
print("Testing another visualization:")
print("=" * 80)
result2 = query_classifier("Visualize the total quantity of products by category")
print(f"\n\nFinal Result Type: {type(result2)}")
print(f"Chart Type: {result2.chart_type}")
print(f"Title: {result2.title}")
print(f"Description: {result2.description}")
print("\nData:")
for item in result2.data:
    print(f"  {item}")
