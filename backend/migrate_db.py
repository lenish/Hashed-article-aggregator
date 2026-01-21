"""
Database migration script to add missing columns to the articles table.
Run this script to update the production database schema.
"""
import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from sqlalchemy import text, inspect

app = create_app(os.getenv('FLASK_ENV', 'production'))

def get_existing_columns(inspector, table_name):
    """Get list of existing column names for a table"""
    columns = inspector.get_columns(table_name)
    return [col['name'] for col in columns]

def add_column_if_not_exists(connection, table_name, column_name, column_type, default=None):
    """Add a column to a table if it doesn't exist"""
    inspector = inspect(connection)
    existing_columns = get_existing_columns(inspector, table_name)

    if column_name not in existing_columns:
        default_clause = f" DEFAULT {default}" if default is not None else ""
        sql = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}{default_clause}"
        connection.execute(text(sql))
        print(f"  Added column: {column_name}")
        return True
    else:
        print(f"  Column already exists: {column_name}")
        return False

def migrate():
    """Run the migration"""
    with app.app_context():
        print("Starting database migration...")
        print(f"Database URI: {app.config.get('SQLALCHEMY_DATABASE_URI', 'Not set')[:50]}...")

        with db.engine.connect() as connection:
            # Check if articles table exists
            inspector = inspect(connection)
            tables = inspector.get_table_names()

            if 'articles' not in tables:
                print("Creating all tables...")
                db.create_all()
                print("All tables created successfully!")
                return

            print("\nAdding missing columns to 'articles' table...")

            # Add sentiment column
            add_column_if_not_exists(connection, 'articles', 'sentiment', 'VARCHAR(20)')

            # Add needs_response column
            add_column_if_not_exists(connection, 'articles', 'needs_response', 'BOOLEAN', 'FALSE')

            # Add risk_level column
            add_column_if_not_exists(connection, 'articles', 'risk_level', "VARCHAR(20)", "'green'")

            # Add risk_score column
            add_column_if_not_exists(connection, 'articles', 'risk_score', 'INTEGER', '0')

            # Add status column
            add_column_if_not_exists(connection, 'articles', 'status', "VARCHAR(20)", "'pending'")

            # Add assignee_id column
            add_column_if_not_exists(connection, 'articles', 'assignee_id', 'INTEGER')

            # Add ai_summary column
            add_column_if_not_exists(connection, 'articles', 'ai_summary', 'TEXT')

            # Add ai_risk_analysis column
            add_column_if_not_exists(connection, 'articles', 'ai_risk_analysis', 'TEXT')

            # Add action_items column (JSON type)
            add_column_if_not_exists(connection, 'articles', 'action_items', 'JSONB')

            # Add similar_cases column (JSON type)
            add_column_if_not_exists(connection, 'articles', 'similar_cases', 'JSONB')

            # Add resolved_at column
            add_column_if_not_exists(connection, 'articles', 'resolved_at', 'TIMESTAMP')

            # Add resolved_by_id column
            add_column_if_not_exists(connection, 'articles', 'resolved_by_id', 'INTEGER')

            # Commit the changes
            connection.commit()

            print("\nMigration completed successfully!")

if __name__ == '__main__':
    migrate()
