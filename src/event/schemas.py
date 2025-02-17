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

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "event_name": "test",
                    "description": "test",
                    "date": "2023-01-01",
                    "time": "12:00",
                    "location": "test",
                    "address": "test",
                    "organizer": "test",
                    "sale_time": "2023-01-01",
                    "on_sale": True,
                    "price": "test",
                    "pic": "test",
                    "category": "test",
                }
            ]
        }
    }


class GetEventByIdRequest(BaseModel):
    event_id: int


class GetEventByIdResponse(BaseModel):
    event_id: int
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

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "event_id": 1,
                    "event_name": "test",
                    "description": "test",
                    "date": "2023-01-01",
                    "time": "12:00",
                    "location": "test",
                    "address": "test",
                    "organizer": "test",
                    "sale_time": "2023-01-01",
                    "on_sale": True,
                    "price": "test",
                    "pic": "test",
                    "category": "test",
                }
            ]
        }
    }


class GetEventListResponse(BaseModel):
    event_id: int
    event_name: str
    date: str
    time: str
    location: str
    pic: str | None
