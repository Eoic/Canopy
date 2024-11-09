from fastapi import APIRouter
from store.user_store import UserStore

router = APIRouter()


@router.get("/users")
async def index():
    store = UserStore()
    return (await store.get_all_users()).items()
