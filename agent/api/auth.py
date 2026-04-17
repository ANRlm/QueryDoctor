from datetime import datetime, timedelta
from typing import Optional
import os

import bcrypt
import jwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from db.users import get_user_by_username, create_user

jwt_secret = os.getenv("JWT_SECRET", "querydoctor-default-secret-change-in-production")
algorithm = "HS256"
access_token_expire_minutes = 30

security = HTTPBearer()


class User(BaseModel):
    user_id: str
    username: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=access_token_expire_minutes))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, jwt_secret, algorithm=algorithm)


def decode_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=[algorithm])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return TokenData(username=username)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TokenData:
    return decode_token(credentials.credentials)


def register_user(username: str, password: str) -> User:
    if get_user_by_username(username):
        raise HTTPException(status_code=400, detail="Username already exists")

    user_id = f"user_{username}"
    row = create_user(user_id, username, hash_password(password))
    if row is None:
        raise HTTPException(status_code=400, detail="Username already exists")

    return User(user_id=user_id, username=username)


def authenticate_user(username: str, password: str) -> Optional[User]:
    row = get_user_by_username(username)
    if not row:
        return None
    if not verify_password(password, row["password_hash"]):
        return None
    return User(user_id=row["user_id"], username=row["username"])


def login(username: str, password: str) -> Token:
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.username, "user_id": user.user_id})
    return Token(access_token=access_token, token_type="bearer")
