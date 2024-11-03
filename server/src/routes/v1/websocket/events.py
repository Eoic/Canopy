from utils.websocket import WebSocketManager
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/events")


@router.websocket("/")
async def websocket(websocket: WebSocket):
    await WebSocketManager.connect(websocket)
    id = WebSocketManager.id(websocket)
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
            await websocket.receive_json()
    except WebSocketDisconnect:
        id = WebSocketManager.id(websocket)
        WebSocketManager.disconnect(websocket)
        await WebSocketManager.broadcast(id, "DISCONNECT", {"id": id}, True)
