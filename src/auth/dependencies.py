from typing import Annotated

from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from src.auth.service import get_user_by_account
from src.auth.utils import oauth2_scheme
from src.config import settings
from src.database import get_db_session
from src.models import User


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[Session, Depends(get_db_session)],
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        account: str = payload.get("sub")
        if account is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user_by_account(session, account)
    if user is None:
        raise credentials_exception

    return user
