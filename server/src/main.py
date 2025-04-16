import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from database.database import Database
from routes.v1 import router as router_v1
from store.user_store import UserStore
from utils.websocket import WebSocketManager


async def update_users_state(user_store: UserStore):
    while True:
        await asyncio.sleep(0.1)

        users = []
        connections = WebSocketManager.connection_ids

        for user in (await user_store.get_all_users()).values():
            position = user.pop_position()

            if not position:
                continue

            users.append({"id": user.id, "position": position})

        if users:
            for websocket, _conn_id in connections.items():
                await WebSocketManager.send(
                    websocket,
                    "POINTER_POSITIONS",
                    {"positions": users},
                )


@asynccontextmanager
async def lifespan(app: FastAPI):
    Database.init()
    user_store = UserStore()
    asyncio.create_task(update_users_state(user_store))
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(router_v1, prefix="/v1")
