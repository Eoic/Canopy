import asyncio
from store.user_store import UserStore, UserData
from utils.websocket import WebSocketManager
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/events")
user_store = UserStore()


@router.websocket("/")
async def websocket(websocket: WebSocket):
    await WebSocketManager.connect(websocket)
    id = WebSocketManager.id(websocket)
    await user_store.add_user(id, UserData(id=id, position={"x": 0, "y": 0}))
    await WebSocketManager.send(websocket, "CONNECT", {"id": id, "isAuthor": True})

    await WebSocketManager.send(
        websocket,
        "USERS",
        {
            "users": list(
                map(
                    lambda id: {"id": id, "position": {"x": 0, "y": 0}},
                    WebSocketManager.get_connection_ids(websocket, True),
                )
            ),
        },
    )

    await WebSocketManager.broadcast(
        websocket,
        "CONNECT",
        {
            "id": id,
            "isAuthor": False,
        },
        True,
    )

    try:
        while True:
            data = await websocket.receive_json()

            if data["type"] == "POINTER_POSITION":
                id = data["message"]["id"]
                await user_store.record_user_position(id, data["message"]["position"])
    except WebSocketDisconnect:
        id = WebSocketManager.id(websocket)
        WebSocketManager.disconnect(websocket)
        await WebSocketManager.broadcast(id, "DISCONNECT", {"id": id}, True)
        await user_store.remove_user(id)
