import os
from typing import Optional, Dict, Any

import psycopg2
import psycopg2.extras
import psycopg2.errors


def _get_conn():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "postgres"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        user=os.getenv("POSTGRES_USER", "postgres"),
        password=os.getenv("POSTGRES_PASSWORD", "password"),
        dbname=os.getenv("POSTGRES_DB", "querydoctor"),
    )


def init_users_table() -> None:
    with _get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id          SERIAL PRIMARY KEY,
                    user_id     VARCHAR(255) UNIQUE NOT NULL,
                    username    VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at  TIMESTAMP DEFAULT NOW()
                )
                """
            )
        conn.commit()


def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    try:
        with _get_conn() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute("SELECT * FROM users WHERE username = %s", (username,))
                row = cur.fetchone()
                return dict(row) if row else None
    except Exception:
        return None


def create_user(user_id: str, username: str, password_hash: str) -> Optional[Dict[str, Any]]:
    try:
        with _get_conn() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(
                    """
                    INSERT INTO users (user_id, username, password_hash)
                    VALUES (%s, %s, %s)
                    RETURNING id, user_id, username, created_at
                    """,
                    (user_id, username, password_hash),
                )
                row = cur.fetchone()
                conn.commit()
                return dict(row) if row else None
    except psycopg2.errors.UniqueViolation:
        return None
    except Exception:
        return None


def delete_all_users() -> int:
    try:
        with _get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM users")
                count = cur.rowcount
            conn.commit()
            return count
    except Exception:
        return 0
