from fastapi import APIRouter

router = APIRouter()


@router.get("/messages")
async def index():
    return {"location": "MESSAGES"}
