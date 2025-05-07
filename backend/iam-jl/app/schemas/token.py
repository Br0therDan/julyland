from typing import List, Optional
from pydantic import BaseModel, Field


class Message(BaseModel):
    message: str


class TokenPayload(BaseModel):
    sub: str
    exp: int
    type: str = "access"
    email: Optional[str] = None
    name: Optional[str] = None
    apps: Optional[List[str]] = []


class NewPassword(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str]
    token_type: str
