import datetime

from sqlalchemy import JSON, Boolean, Float, ForeignKey, String, false, func, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass