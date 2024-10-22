from sqlmodel import select
from database import SessionDep
from fastapi import APIRouter, HTTPException
from models.post import PostGet, Post, PostCreate, PostUpdate

router = APIRouter(prefix="/posts")


@router.get("/", response_model=list[PostGet])
async def get_posts(session: SessionDep):
    posts = session.exec(select(Post)).all()
    return posts


@router.post("/", response_model=PostGet)
async def create_post(post: PostCreate, session: SessionDep):
    new_post = Post.model_validate(post)

    session.add(new_post)
    session.commit()
    session.refresh(new_post)

    return new_post


@router.get("/{post_id}/", response_model=PostGet)
async def get_post_by_id(post_id: int, session: SessionDep):
    post = session.get(Post, post_id)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    return post


@router.patch("/{post_id}/", response_model=PostGet)
async def update_post(post_id: int, post_update: PostUpdate, session: SessionDep):
    post = session.get(Post, post_id)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    post_data = post_update.model_dump(exclude_unset=True)
    post.sqlmodel_update(post_data)
    session.add(post)
    session.commit()
    session.refresh(post)

    return post


@router.delete("/{post_id}/")
async def delete_post(post_id: int, session: SessionDep):
    post = session.get(Post, post_id)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    session.delete(post)
    session.commit()

    return {"ok": True}
