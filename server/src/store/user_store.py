import asyncio
from typing import Dict, Union
from utils import WebSocketManager
from dataclasses import dataclass, field, asdict


@dataclass
class UserData:
    id: str
    position: Dict[str, float] = field(default_factory=lambda: {"x": 0.0, "y": 0.0})
    positions_buffer: list[Dict[str, float]] = field(default_factory=list)

    def as_dict(self):
        return asdict(self)

    def pop_position(self) -> Union[Dict[str, float], None]:
        try:
            return self.positions_buffer.pop(0)
        except IndexError:
            return None


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
                self.users[id].positions_buffer.append(position)
                # Update after sending.
                # self.users[id].position = position

    async def get_all_users(self) -> Dict[id, UserData]:
        return self.users

    async def remove_user(self, id: str):
        async with self._lock:
            if id in self.users:
                del self.users[id]
