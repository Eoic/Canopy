import asyncio
from dataclasses import dataclass, field
from typing import Any, Union

from events.buffer import BufferedEvent, EventsBuffer

BUFFER_SIZE_MS = 250


@dataclass
class UserData:
    id: str
    events_buffer: EventsBuffer = field(default_factory=lambda: EventsBuffer(BUFFER_SIZE_MS))


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

    async def record_user_action(self, id: str, name: str, payload: dict[str, Any], is_transient: bool):
        async with self._lock:
            if id in self._users:
                user = self._users[id]

                user.events_buffer.push(
                    BufferedEvent(
                        name=name,
                        event_id=f"{name}-{payload['timestamp']}",
                        timestamp=payload["timestamp"],
                        is_transient=is_transient,
                        data=payload.get("data") or {},
                    )
                )

    async def consume_latest_events(self, id: str):
        async with self._lock:
            if id in self._users:
                user = self._users[id]
                return user.events_buffer.drain()

            return []

    async def get_users(self, *attrs: str) -> dict[str, UserData]:
        return self._users

    async def remove_user(self, id: str):
        async with self._lock:
            if id in self._users:
                del self._users[id]
