from fastapi import APIRouter

from store.user_store import UserStore

router = APIRouter(prefix="/api/users")


@router.get("/")
async def get_users(localUserId: str):
    users = []
    attrs = ["id"]
    store = UserStore()

    for user in (await store.get_users()).values():
        user_dict = {}

        for attr in attrs:
            if not hasattr(user, attr):
                print(f"User object has no attribute '{attr}'")
                continue

            user_dict[attr] = getattr(user, attr)

        user_dict["isLocal"] = localUserId == user_dict["id"]
        users.append(user_dict)

    return {"users": users}
