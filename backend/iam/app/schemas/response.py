from typing import Optional, List, Generic, TypeVar
from pydantic import BaseModel

# ✅ 제네릭 타입 정의
T = TypeVar("T")


class ErrorDetail(BaseModel):
    loc: str
    msg: str
    type: str


# ✅ Generic[T] 추가
class ResponseSchema(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None
    error_code: Optional[str] = None


ResponseSchema.model_rebuild()


class ValidationErrorResponseSchema(ResponseSchema[List[ErrorDetail]]):
    data: List[ErrorDetail]
