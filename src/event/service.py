
from sqlalchemy import insert
from sqlalchemy.orm import Session

from src.event.schemas import CreateEventRequest

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
