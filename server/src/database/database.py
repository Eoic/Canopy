from typing import Annotated
from fastapi import Depends
from sqlalchemy.engine import Engine
from sqlmodel import Session, create_engine, SQLModel

database_filename = "canopy.db"
database_url = f"sqlite:///{database_filename}"
database_args = {"check_same_thread": False}


class Database:
    engine: Engine

    @classmethod
    def init(cls):
        cls.__create_engine()
        cls.__create_tables()

    @classmethod
    def __create_engine(cls):
        cls.engine = create_engine(
            url=database_url, connect_args=database_args)

    @classmethod
    def __create_tables(cls):
        SQLModel.metadata.create_all(cls.engine)

    @classmethod
    def get_session(cls):
        with Session(cls.engine) as session:
            yield session


SessionDep = Annotated[Session, Depends(Database.get_session)]
