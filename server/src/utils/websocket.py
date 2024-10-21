import uuid

from typing import Dict
from fastapi import WebSocket


class WebSocketManager:
    active_connections: list[WebSocket] = []
    connection_ids: Dict[WebSocket, uuid.UUID] = {}

    @classmethod
    def id(self, websocket: WebSocket) -> str:
        return str(self.connection_ids.get(websocket))

    @classmethod
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.connection_ids[websocket] = str(uuid.uuid4())

    @classmethod
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        self.connection_ids.pop(websocket)

    @classmethod
    async def send(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    @classmethod
    async def broadcast(self, message: object):
        for connection in self.active_connections:
            await connection.send_json(message)
