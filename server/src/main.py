import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from database.database import Database
from routes.v1 import router as router_v1
from store.user_store import UserStore
from utils.websocket import WebSocketManager


async def broadcast_state(user_store: UserStore):
    while True:
        await asyncio.sleep(0.1)

        users = []
        connections = WebSocketManager.connection_ids

        for user in (await user_store.get_users()).values():
            events = await user_store.consume_latest_events(user.id)

            if not events:
                continue

            users.append({"id": user.id, "events": events})

        if not users:
            continue

        for websocket, websocket_id in connections.items():
            relevant_users = list(filter(lambda user: user["id"] != websocket_id, users))

            if not relevant_users:
                continue

            await WebSocketManager.send(websocket, "STATE", {"entities": relevant_users})


@asynccontextmanager
async def lifespan(app: FastAPI):
    Database.init()
    user_store = UserStore()
    asyncio.create_task(broadcast_state(user_store))
    yield


app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_v1, prefix="/v1")
