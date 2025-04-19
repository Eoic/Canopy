import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from store.user_store import UserData, UserStore
from utils.websocket import WebSocketManager

router = APIRouter(prefix="/ws")
user_store = UserStore()


@router.websocket("/")
async def websocket(websocket: WebSocket):
    await WebSocketManager.connect(websocket)
    id = WebSocketManager.id(websocket)
    await user_store.add_user(id, UserData(id=id))
    await WebSocketManager.send(websocket, "CONNECT", {"id": id, "isLocal": True})

    await WebSocketManager.broadcast(
        sender=websocket,
        type="CONNECT",
        message={
            "id": id,
            "isLocal": False,
        },
        exclude_self=True,
    )

    try:
        while True:
            data = await websocket.receive_json()

            if data["type"] == "POINTER_POSITION":
                id = data["message"]["id"]
                await user_store.record_user_position(id, data["message"]["position"], data["message"]["timestamp"])
    except WebSocketDisconnect:
        id = WebSocketManager.id(websocket)
        WebSocketManager.disconnect(websocket)
        await WebSocketManager.broadcast(websocket, "DISCONNECT", {"id": id}, True)
        await user_store.remove_user(id)
