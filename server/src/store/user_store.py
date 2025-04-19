import asyncio
from collections import deque
from dataclasses import dataclass, field
from typing import TypedDict, Union

BUFFER_LENGTH_MS = 250


class BufferedPosition(TypedDict):
    x: float
    y: float
    timestamp: int


@dataclass
class UserData:
    id: str
    positions_buffer: deque[BufferedPosition] = field(default_factory=deque)

    def pop_position(self) -> BufferedPosition | None:
        if not self.positions_buffer:
            return None

        return self.positions_buffer.pop()

    def push_position(self, position: BufferedPosition):
        self.positions_buffer.append(position)
        cutoff = position["timestamp"] - BUFFER_LENGTH_MS

        while self.positions_buffer and self.positions_buffer[0]["timestamp"] < cutoff:
            self.positions_buffer.popleft()


class UserStore:
    _instance = None
    _lock = asyncio.Lock()
    _users: dict[str, UserData]

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._users = {}

        return cls._instance

    async def add_user(self, id: str, data: UserData):
        async with self._lock:
            self._users[id] = data

    async def get_user(self, id: str) -> Union[UserData, None]:
        async with self._lock:
            return self._users.get(id)

    async def record_user_position(self, id: str, position: dict[str, float], timestamp: int):
        async with self._lock:
            if id in self._users:
                self._users[id].push_position({"x": position["x"], "y": position["y"], "timestamp": timestamp})

    async def get_all_users(self, *attrs: str) -> dict[str, UserData]:
        return self._users

    async def remove_user(self, id: str):
        async with self._lock:
            if id in self._users:
                del self._users[id]
