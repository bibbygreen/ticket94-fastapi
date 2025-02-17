from pydantic import BaseModel


class CreateEventRequest(BaseModel):
    event_name: str
    description: str
    date: str
    time: str
    location: str
    address: str
    organizer: str
    sale_time: str
    on_sale: bool
    price: str
    pic: str | None
    category: str
