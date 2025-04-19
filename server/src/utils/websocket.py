import uuid

from fastapi import WebSocket


class WebSocketManager:
    active_connections: list[WebSocket] = []
    connection_ids: dict[WebSocket, str] = {}

    @classmethod
    def id(cls, websocket: WebSocket) -> str:
        return str(cls.connection_ids.get(websocket))

    @classmethod
    def get_connection_ids(cls, websocket: WebSocket, exclude_self: bool = False) -> list[str]:
        ids = list(cls.connection_ids.values())

        if exclude_self:
            ids = list(filter(lambda id: id != cls.id(websocket), ids))

        return ids

    @classmethod
    async def connect(cls, websocket: WebSocket):
        await websocket.accept()
        cls.active_connections.append(websocket)
        cls.connection_ids[websocket] = str(uuid.uuid4())

    @classmethod
    def disconnect(cls, websocket: WebSocket):
        cls.active_connections.remove(websocket)
        cls.connection_ids.pop(websocket)

    @classmethod
    async def send(cls, websocket: WebSocket, type: str, message: object):
        await websocket.send_json({"type": type, "message": message})

    @classmethod
    async def broadcast(cls, sender: WebSocket, type: str, message: object, exclude_self: bool = False):
        for connection in cls.active_connections:
            if exclude_self and sender == connection:
                continue

            try:
                await connection.send_json({"type": type, "message": message})
            except Exception as error:
                print("Failed to send:", error)
