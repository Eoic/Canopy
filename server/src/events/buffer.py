from collections import OrderedDict
from dataclasses import dataclass
from operator import itemgetter
from typing import Any


@dataclass
class BufferedEvent:
    """A buffered event with a timestamp and data.

    Attributes:
        name (str): The name of the event.
        timestamp (int): The client-side timestamp of the event.
        is_transient (bool): Whether the event is removed from the queue if
                             it's timestamp is not within queue buffer window.
        data (dict[str, Any]): The data associated with the event.
    """

    name: str
    event_id: str
    timestamp: int
    is_transient: bool
    data: dict[str, Any]


class EventsBuffer:
    def __init__(self, window_size_ms: int):
        self.window_size_ms = window_size_ms
        self._events = OrderedDict()
        self._max_ts: int | None = None

    def push(self, event: BufferedEvent):
        if self._max_ts and event.timestamp < self._max_ts:
            print(f"Event rejected because it lags behind by {self._max_ts - event.timestamp} ms.")
            return

        self._events[event.event_id] = event

        if not self._max_ts or event.timestamp > self._max_ts:
            self._max_ts = event.timestamp

        self._evict_expired()

    def pop(self, event_id: str):
        return self._events.pop(event_id, None)

    def drain(self):
        """Drains all events from the buffer and returns them as a list."""
        events = list(self._events.values())
        self._events.clear()
        return events

    def get_all_with_name(self, event_name: str):
        return [self._events[event.event_id] for event in self._events.values() if event.name == event_name]

    def _evict_expired(self):
        if not self._events or not self._max_ts:
            return

        threshold = self._max_ts - self.window_size_ms

        for id in list(self._events):
            timestamp, is_transient = itemgetter("timestamp", "is_transient")(self._events[id])

            if not is_transient:
                continue

            if timestamp >= threshold:
                break

            self.pop(id)

    def items(self):
        yield from self._events.values()

    def __len__(self):
        return len(self._events)
