from fastapi import FastAPI
from contextlib import asynccontextmanager
from database.database import Database
from routes.v1 import router as router_v1


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    Database.init()
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(router_v1, prefix="/v1")
