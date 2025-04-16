from fastapi import APIRouter

from store.user_store import UserStore

router = APIRouter()


@router.get("/users")
async def index():
    store = UserStore()
    users = []
    attrs = ["id", "position"]

    for user in (await store.get_all_users()).values():
        user_dict = {}

        for attr in attrs:
            if not hasattr(user, attr):
                continue

            user_dict[attr] = getattr(user, attr)

        users.append(user_dict)

    return {"users": users}
