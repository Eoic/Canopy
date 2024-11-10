from fastapi import APIRouter
from .http import index_router, users_router, posts_router
from .websocket import events_router

router = APIRouter()
router.include_router(index_router)
router.include_router(users_router)
router.include_router(posts_router)
router.include_router(events_router)
