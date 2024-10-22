from utils.websocket import WebSocketManager
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/events")


@router.websocket("/")
async def websocket(websocket: WebSocket):
    await WebSocketManager.connect(websocket)
    id = WebSocketManager.id(websocket)
    await WebSocketManager.broadcast(
        {"type": "CONNECT", "message": f"Client {id} connected."}
    )

    try:
        while True:
            await websocket.send_json(
                {
                    **(await websocket.receive_json()),
                    "type": "PONG",
                }
            )
    except WebSocketDisconnect:
        id = WebSocketManager.id(websocket)
        WebSocketManager.disconnect(websocket)

        await WebSocketManager.broadcast(
            {"type": "DISCONNECT", "message": f"Client {id} disconnected."}
        )
