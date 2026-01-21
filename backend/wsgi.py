"""
WSGI entry point for production deployment (Gunicorn/Render).
This file is used by Gunicorn to run the Flask application.
"""
import os
import logging
from app import create_app, db
from sqlalchemy import text, inspect

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = create_app(os.getenv('FLASK_ENV', 'production'))


def run_migrations():
    """Run database migrations to add missing columns"""
    with app.app_context():
        try:
            logger.info("Checking database schema...")

            with db.engine.connect() as connection:
                inspector = inspect(connection)
                tables = inspector.get_table_names()

                if 'articles' not in tables:
                    logger.info("Creating all tables...")
                    db.create_all()
                    logger.info("All tables created successfully!")
                    return

                # Get existing columns
                columns = inspector.get_columns('articles')
                existing_columns = [col['name'] for col in columns]
                logger.info(f"Existing columns: {existing_columns}")

                # Define columns to add (PostgreSQL types)
                columns_to_add = [
                    ('sentiment', 'VARCHAR(20)', None),
                    ('needs_response', 'BOOLEAN', 'FALSE'),
                    ('risk_level', 'VARCHAR(20)', "'green'"),
                    ('risk_score', 'INTEGER', '0'),
                    ('status', 'VARCHAR(20)', "'pending'"),
                    ('assignee_id', 'INTEGER', None),
                    ('ai_summary', 'TEXT', None),
                    ('ai_risk_analysis', 'TEXT', None),
                    ('action_items', 'JSONB', None),
                    ('similar_cases', 'JSONB', None),
                    ('resolved_at', 'TIMESTAMP', None),
                    ('resolved_by_id', 'INTEGER', None),
                ]

                added_count = 0
                for col_name, col_type, default in columns_to_add:
                    if col_name not in existing_columns:
                        try:
                            default_clause = f" DEFAULT {default}" if default else ""
                            sql = f"ALTER TABLE articles ADD COLUMN {col_name} {col_type}{default_clause}"
                            connection.execute(text(sql))
                            logger.info(f"Added column: {col_name}")
                            added_count += 1
                        except Exception as col_error:
                            logger.warning(f"Could not add column {col_name}: {col_error}")

                if added_count > 0:
                    connection.commit()
                    logger.info(f"Migration completed: {added_count} columns added")
                else:
                    logger.info("Database schema is up to date")

        except Exception as e:
            logger.error(f"Migration error: {e}")
            import traceback
            logger.error(traceback.format_exc())


# Run migrations on startup
run_migrations()

# This is used by Gunicorn
application = app
