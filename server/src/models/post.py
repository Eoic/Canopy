from sqlmodel import Field, SQLModel


class PostBase(SQLModel):
    content: str = Field(nullable=False, max_length=200)


class Post(PostBase, table=True):
    id: int | None = Field(default=None, primary_key=True)


class PostGet(PostBase):
    id: int


class PostCreate(PostBase):
    content: str


class PostUpdate(PostBase):
    content: str
