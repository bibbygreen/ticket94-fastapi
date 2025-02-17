from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from src.database import get_db_session
from src.event.schemas import CreateEventRequest
from src.event.service import create_event


router = APIRouter()


@router.post(
    "/events",
    status_code=status.HTTP_201_CREATED,
    tags=["event"],
)
def create_event_api(
    event: Annotated[CreateEventRequest, Body()],
    session: Annotated[Session, Depends(get_db_session)],
):
    try:
        create_event(event, session)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED, content={"message": "新增活動成功"}
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
