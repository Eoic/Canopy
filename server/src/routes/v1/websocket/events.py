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
        name="CONNECT",
        message={
            "id": id,
            "isLocal": False,
        },
        exclude_self=True,
    )

    try:
        while True:
            is_transient = False
            data = await websocket.receive_json()

            if data["name"] == "POINTER_POSITION":
                is_transient = True
            elif data["name"] == "POINTER_OUT":
                is_transient = False

            # Structure:
            # {
            #   name
            #   message
            #     data
            #     timestamp
            # }

            await user_store.record_user_action(id, data["name"], data["message"], is_transient)
    except WebSocketDisconnect:
        id = WebSocketManager.id(websocket)
        WebSocketManager.disconnect(websocket)
        await WebSocketManager.broadcast(websocket, "DISCONNECT", {"id": id}, True)
        await user_store.remove_user(id)
