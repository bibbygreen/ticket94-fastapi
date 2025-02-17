from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status, Path
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from src.database import get_db_session
from src.event.schemas import CreateEventRequest
from src.event.service import (
    create_event,
    get_event_by_id,
    delete_event_by_id,
)


router = APIRouter()


@router.post(
    "/events",
    status_code=status.HTTP_201_CREATED,
    tags=["event"],
)
def _create_event(
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


@router.get(
    "/events/{event_id}",
    status_code=status.HTTP_200_OK,
    tags=["event"],
)
def _get_event_by_id(
    event_id: Annotated[int, Path()],
    session: Annotated[Session, Depends(get_db_session)],
):
    try:
        event = get_event_by_id(event_id, session)
        return event
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete(
    "/events/{event_id}",
    status_code=status.HTTP_200_OK,
    tags=["event"],
)
def _delete_event_by_id(
    event_id: Annotated[int, Path()],
    session: Annotated[Session, Depends(get_db_session)],
):
    try:
        delete_event_by_id(event_id, session)
        return JSONResponse(
            status_code=status.HTTP_200_OK, content={"message": "刪除活動成功"}
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
