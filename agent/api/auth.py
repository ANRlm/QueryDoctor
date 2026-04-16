from datetime import datetime, timedelta
from typing import Optional
import hashlib
import os

import jwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel


jwt_secret = os.getenv("JWT_SECRET", "querydoctor-default-secret-change-in-production")
algorithm = "HS256"
access_token_expire_minutes = 30

users_db = {}


class User(BaseModel):
    user_id: str
    username: str
    password_hash: str
    email: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, jwt_secret, algorithm=algorithm)
    return encoded_jwt


def decode_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=[algorithm])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return TokenData(username=username)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
    return decode_token(credentials.credentials)


def register_user(username: str, password: str, email: Optional[str] = None) -> User:
    if username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")

    user_id = f"user_{username}"
    user = User(
        user_id=user_id,
        username=username,
        password_hash=hash_password(password),
        email=email
    )
    users_db[username] = user
    return user


def authenticate_user(username: str, password: str) -> Optional[User]:
    user = users_db.get(username)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def login(username: str, password: str) -> Token:
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.user_id}
    )
    return Token(access_token=access_token, token_type="bearer")
