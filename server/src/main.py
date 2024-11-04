import asyncio
from fastapi import FastAPI
from store.user_store import UserStore
from contextlib import asynccontextmanager
from utils.websocket import WebSocketManager
from database.database import Database
from routes.v1 import router as router_v1


async def update_positions(user_store: UserStore):
    while True:
        await asyncio.sleep(0.05)

        connections = WebSocketManager.connection_ids

        for websocket, conn_id in connections.items():
            positions = []

            for id, user_data in (await user_store.get_all_users()).items():
                if id == conn_id:
                    continue

                # TODO: Should include 'id' and 'position' attributes only.
                positions.append(user_data.as_dict())

            await WebSocketManager.send(
                websocket,
                "POINTER_POSITIONS",
                {"positions": positions},
            )


@asynccontextmanager
async def lifespan(app: FastAPI):
    Database.init()
    user_store = UserStore()
    asyncio.create_task(update_positions(user_store))
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(router_v1, prefix="/v1")
