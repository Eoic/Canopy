from fastapi import FastAPI
from contextlib import asynccontextmanager
from database.database import Database
from routes.websocket import events_router
from routes.http import index_router, users_router, posts_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    Database.init()
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(index_router)
app.include_router(posts_router)
app.include_router(users_router)
app.include_router(events_router)
