from fastapi import FastAPI
from routes.websocket import events_router
from routes.http import index_router, users_router, messages_router

app = FastAPI()
app.include_router(index_router)
app.include_router(messages_router)
app.include_router(users_router)
app.include_router(events_router)
