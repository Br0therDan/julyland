def generate_sku(category_name: str, brand_name: str, product_name: str, options: List[VariantOption]) -> str:
    def sanitize(text: str) -> str:
        return ''.join(filter(str.isalnum, text.upper()))[:4]  # 알파벳 숫자만 최대 4자

    cat_code = sanitize(category_name)
    brand_code = sanitize(brand_name)
    product_code = sanitize(product_name)

    option_parts = []
    for opt in options:
        val = f"{opt.value}{opt.unit or ''}"
        option_parts.append(str(val).replace(" ", "").upper())

    option_str = "-".join(option_parts)

    return f"{cat_code}-{brand_code}-{product_code}-{option_str}"
