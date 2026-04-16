import os
from typing import List, Dict, Any


class PostgresClient:
    def __init__(self):
        import psycopg2
        self.connection = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST", "localhost"),
            port=int(os.getenv("POSTGRES_PORT", 5432)),
            user=os.getenv("POSTGRES_USER", "postgres"),
            password=os.getenv("POSTGRES_PASSWORD", "password"),
            database=os.getenv("POSTGRES_DB", "querydoctor"),
        )
        self.connection.autocommit = True

    def explain_query(self, query: str) -> List[Dict[str, Any]]:
        with self.connection.cursor() as cursor:
            cursor.execute(f"EXPLAIN (FORMAT JSON) {query}")
            result = cursor.fetchone()
            return result[0] if result else {}

    def get_indexes(self, table: str) -> List[Dict[str, Any]]:
        with self.connection.cursor() as cursor:
            cursor.execute("""
                SELECT indexname, indexdef 
                FROM pg_indexes 
                WHERE tablename = %s
            """, (table,))
            return [{"indexname": row[0], "indexdef": row[1]} for row in cursor.fetchall()]

    def close(self):
        self.connection.close()
