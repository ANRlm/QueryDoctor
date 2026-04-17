import os
from typing import List, Dict, Any


class PostgresClient:
    def __init__(self, db_config: Dict[str, Any] = None):
        import psycopg2
        cfg = db_config or {}
        self.connection = psycopg2.connect(
            host=cfg.get("host") or os.getenv("POSTGRES_HOST", "localhost"),
            port=int(cfg.get("port") or os.getenv("POSTGRES_PORT", 5432)),
            user=cfg.get("user") or os.getenv("POSTGRES_USER", "postgres"),
            password=cfg.get("password") or os.getenv("POSTGRES_PASSWORD", "password"),
            database=cfg.get("database") or os.getenv("POSTGRES_DB", "querydoctor"),
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
