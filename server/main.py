import uuid
from typing import Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.connection_ids: Dict[WebSocket, uuid.UUID] = {}

    def id(self, websocket: WebSocket) -> str:
        return str(self.connection_ids.get(websocket))

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.connection_ids[websocket] = str(uuid.uuid4())

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        self.connection_ids.pop(websocket)

    async def send(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: object):
        for connection in self.active_connections:
            await connection.send_json(message)


app = FastAPI()
manager = ConnectionManager()


@app.get("/")
def index():
    return {"status": "OK"}


@app.websocket("/events")
async def websocket(websocket: WebSocket):
    await manager.connect(websocket)
    id = manager.id(websocket)
    await manager.broadcast({"type": "CONNECT", "message": f"Client {id} connected."})

    try:
        while True:
            data = await websocket.receive_json()
            del data["type"]
            await websocket.send_json({"type": "PONG", **data})
    except WebSocketDisconnect:
        id = manager.id(websocket)
        manager.disconnect(websocket)

        await manager.broadcast(
            {"type": "DISCONNECT", "message": f"Client {id} disconnected."}
        )
