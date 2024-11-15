import asyncio
from collections import deque
from dataclasses import asdict, dataclass, field
from typing import Dict, Union

from utils import WebSocketManager


@dataclass
class UserData:
    id: str
    position: Dict[str, float] = field(default_factory=lambda: {"x": 0.0, "y": 0.0})
    positions_buffer: deque = field(default_factory=lambda: deque(maxlen=10))

    def as_dict(self):
        return {"id": self.id, "position": self.position}

    def pop_position(self) -> Union[Dict[str, float], None]:
        try:
            position = self.positions_buffer.pop()
            self.position = position
            return position
        except IndexError:
            return None

    def push_position(self, position: Dict[str, float]):
        self.positions_buffer.appendleft(position)


class UserStore:
    _instance = None
    _lock = asyncio.Lock()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(UserStore, cls).__new__(cls)
            cls._instance.users = dict()

        return cls._instance

    async def add_user(self, id: str, data: UserData):
        async with self._lock:
            self.users[id] = data

    async def get_user(self, id: str) -> Union[UserData, None]:
        async with self._lock:
            return self.users.get(id)

    async def record_user_position(self, id: str, position: Dict[str, float]):
        async with self._lock:
            if id in self.users:
                self.users[id].push_position(position)

    async def get_all_users(self) -> Dict[id, UserData]:
        return self.users

    async def remove_user(self, id: str):
        async with self._lock:
            if id in self.users:
                del self.users[id]
