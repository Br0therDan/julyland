from datetime import datetime, timezone

from beanie import Document, Insert, Replace, Save, before_event
from pydantic import Field


class BaseDocument(Document):
    """
    모든 Beanie 문서 모델에서 상속할 기본 클래스
    """

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    @before_event(Insert)
    def set_created_at(self):
        now = datetime.now(timezone.utc)
        self.created_at = now  # ✅ insert 시 created_at 설정
        self.updated_at = now

    @before_event([Save, Replace])
    def set_updated_at(self):
        self.updated_at = datetime.now(timezone.utc)

    class Settings:
        abstract = True
