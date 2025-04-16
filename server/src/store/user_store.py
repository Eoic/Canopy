import asyncio
from collections import deque
from dataclasses import dataclass, field
from typing import Union


@dataclass
class UserData:
    id: str
    position: dict[str, float] = field(default_factory=lambda: {"x": 0.0, "y": 0.0})
    positions_buffer: deque = field(default_factory=lambda: deque(maxlen=10))

    def pop_position(self) -> Union[dict[str, float], None]:
        try:
            position = self.positions_buffer.pop()
            self.position = position
            return position
        except IndexError:
            return None

    def push_position(self, position: dict[str, float]):
        self.positions_buffer.appendleft(position)


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

    async def record_user_position(self, id: str, position: dict[str, float]):
        async with self._lock:
            if id in self._users:
                self._users[id].push_position(position)

    async def get_all_users(self, *attrs: str) -> dict[str, UserData]:
        return self._users

    async def remove_user(self, id: str):
        async with self._lock:
            if id in self._users:
                del self._users[id]
