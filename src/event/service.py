from sqlalchemy import insert, select, update
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from src.schemas import ListDataResponse
from src.event.schemas import (
    CreateEventRequest,
    GetEventByIdResponse,
    GetEventListResponse,
)
from src.models import Event


def create_event(event: CreateEventRequest, session: Session):
    try:
        session.execute(
            insert(Event)
            .values(
                {
                    "event_name": event.event_name,
                    "description": event.description,
                    "date": event.date,
                    "time": event.time,
                    "location": event.location,
                    "address": event.address,
                    "organizer": event.organizer,
                    "sale_time": event.sale_time,
                    "on_sale": event.on_sale,
                    "price": event.price,
                    "pic": event.pic,
                    "category": event.category,
                }
            )
            .returning(Event)
        )
        session.commit()

    except Exception as e:
        session.rollback()
        raise e


def get_event_by_id(event_id: int, session: Session) -> GetEventByIdResponse:
    try:
        event = session.execute(
            select(Event).where(Event.event_id == event_id)
        ).scalar_one_or_none()

        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event with ID {event_id} not found",
            )

        return event

    except SQLAlchemyError as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        ) from e


def delete_event_by_id(event_id: int, session: Session):
    try:
        stmt = update(Event).where(Event.event_id == event_id).values(is_deleted=True)

        result = session.execute(stmt)

        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event with ID {event_id} not found",
            )

        session.commit()

    except SQLAlchemyError as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        ) from e


def get_event_list(session: Session) -> ListDataResponse[GetEventListResponse]:
    try:
        stmt = select(
            Event.event_id,
            Event.event_name,
            Event.date,
            Event.time,
            Event.location,
            Event.pic,
        ).where(not Event.is_deleted)

        result = session.execute(stmt).all()

        event_list = [
            GetEventListResponse(
                event_id=event.event_id,
                event_name=event.event_name,
                date=event.date,
                time=event.time,
                location=event.location,
                pic=event.pic,
            )
            for event in result
        ]

        return ListDataResponse[GetEventListResponse](data=event_list)

    except SQLAlchemyError as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        ) from e
