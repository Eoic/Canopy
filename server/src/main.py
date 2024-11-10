import asyncio
from fastapi import FastAPI
from store.user_store import UserStore
from contextlib import asynccontextmanager
from utils.websocket import WebSocketManager
from database.database import Database
from routes.v1 import router as router_v1


async def update_users_state(user_store: UserStore):
    while True:
        await asyncio.sleep(0.1)

        connections = WebSocketManager.connection_ids

        for websocket, conn_id in connections.items():
            users = []

            for id, user_data in (await user_store.get_all_users()).items():
                if id == conn_id:
                    continue

                users.append(user_data.as_dict())

            if len(users) > 0:
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
