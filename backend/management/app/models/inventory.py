# Path: app/models/inventory.py
from typing import Literal
from beanie import Link
from app.models.base import BaseDocument
from app.models.product import Variant

class Inventory(BaseDocument):
    variant: Link[Variant]
    change_type: Literal["in", "out", "adjust"]
    quantity: int

    class Settings:
        name = "inventory"