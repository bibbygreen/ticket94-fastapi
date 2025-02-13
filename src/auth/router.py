from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status, Path
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from src.config import settings
from src.database import get_db_session
from src.auth.schemas import (
    CreateUserRequest,
    Token,
    UserUpdatePassword,
    UserUpdatePhone,
)
from src.auth.service import (
    authenticate_user,
    check_new_user,
    create_access_token,
    create_user,
    update_user_password,
    update_user_phone,
)
from src.auth.dependencies import get_current_user
from src.models import User


router = APIRouter()


@router.post(
    "/users",
    status_code=status.HTTP_201_CREATED,
    tags=["user"],
)
def create_user_api(
    user: Annotated[CreateUserRequest, Body()],
    session: Annotated[Session, Depends(get_db_session)],
):
    try:
        check_new_user(user, session)

        new_user = create_user(user, session)

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        access_token = create_access_token(
            data={"sub": new_user.account}, expires_delta=access_token_expires
        )

        return Token(access_token=access_token)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put(
    "/user/{user_id}/phone",
    status_code=status.HTTP_200_OK,
    tags=["user"],
)
async def update_phone(
    user_id: Annotated[int, Path()],
    phone_update: Annotated[UserUpdatePhone, Body()],
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_db_session)],
):
    try:
        update_user_phone(current_user, phone_update.phone, session)
        return JSONResponse(
            status_code=status.HTTP_200_OK, content={"message": "手機號碼更新成功"}
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put(
    "/user/{user_id}/password",
    status_code=status.HTTP_200_OK,
    tags=["user"],
)
async def update_password(
    user_id: Annotated[int, Path()],
    password_update: Annotated[UserUpdatePassword, Body()],
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_db_session)],
):
    try:
        update_user_password(
            current_user,
            password_update.current_password,
            password_update.new_password,
            session,
        )
        return JSONResponse(
            status_code=status.HTTP_200_OK, content={"message": "密碼更新成功"}
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/auth/signin",
    status_code=status.HTTP_200_OK,
    tags=["user"],
)
def signin(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_db_session),
):
    try:
        user = authenticate_user(form_data.username, form_data.password, session)

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        access_token = create_access_token(
            data={"sub": user.account}, expires_delta=access_token_expires
        )

        return Token(access_token=access_token)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
