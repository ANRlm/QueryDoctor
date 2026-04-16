import os
from typing import List, Dict, Any


class MySQLClient:
    def __init__(self):
        import pymysql
        self.connection = pymysql.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            port=int(os.getenv("MYSQL_PORT", 3306)),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", "password"),
            database=os.getenv("MYSQL_DATABASE", "querydoctor"),
            cursorclass=pymysql.cursors.DictCursor,
        )

    def explain_query(self, query: str) -> List[Dict[str, Any]]:
        with self.connection.cursor() as cursor:
            cursor.execute(f"EXPLAIN {query}")
            return cursor.fetchall()

    def get_indexes(self, table: str) -> List[Dict[str, Any]]:
        with self.connection.cursor() as cursor:
            cursor.execute(f"SHOW INDEX FROM `{table}`")
            return cursor.fetchall()

    def close(self):
        self.connection.close()
