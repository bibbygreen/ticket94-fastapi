from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from jose import jwt
from sqlalchemy import insert, select
from sqlalchemy.orm import Session

from src.auth.schemas import CreateUserRequest
from src.auth.utils import (
    get_password_hash,
    verify_password,
)
from src.config import settings
from src.models import User


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=120)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def get_user_by_account(session: Session, account: str) -> User:
    query = select(User).where(User.account == account)
    user = session.execute(query).scalar()

    return user


def get_user_by_id(session: Session, user_id: int) -> User:
    query = select(User).where(User.id == user_id)
    user = session.execute(query).scalar()

    return user


def create_user(user: CreateUserRequest, session: Session):
    try:
        hashed_password = get_password_hash(user.password)
        db_user = session.execute(
            insert(User)
            .values(
                {
                    "account": user.account,
                    "password": hashed_password,
                    "name": user.name,
                    "phone": user.phone,
                }
            )
            .returning(User)
        ).scalar()
        session.commit()

        return db_user

    except Exception as e:
        session.rollback()
        raise e


def check_new_user(user: CreateUserRequest, session: Session) -> User:
    db_user = get_user_by_account(session, user.account)

    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="此 email 帳號已註冊"
        )


def authenticate_user(account: str, password: str, session: Session) -> User:
    db_user = get_user_by_account(session, account)

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="帳號或密碼錯誤"
        )

    if not verify_password(password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="帳號或密碼錯誤"
        )

    return db_user


def update_user_phone(user: User, new_phone: str, session: Session) -> User:
    try:
        user.phone = new_phone
        session.commit()
        session.refresh(user)
        return user
    except Exception:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="更新手機號碼失敗"
        )


def update_user_password(
    user: User, current_password: str, new_password: str, session: Session
) -> User:
    if not verify_password(current_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="目前密碼錯誤"
        )

    try:
        hashed_password = get_password_hash(new_password)
        user.password = hashed_password
        session.commit()
        session.refresh(user)
        return user
    except Exception:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="更新密碼失敗"
        )
