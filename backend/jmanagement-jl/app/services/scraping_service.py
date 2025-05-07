# app/services/scraping_service.py

import asyncio
from datetime import datetime, timedelta, timezone
from app.models.ranking import Item, RankingSnapshot, ItemSnapshot
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

from app.schemas.ranking import ScrapeItem

def scrape_category(url: str, category_name: str) -> list[ScrapeItem]:
    """
    지정한 URL과 카테고리명을 기준으로 스크래핑을 수행합니다.
    각 아이템의 고유 아이디, 썸네일 URL, 순위 등 필요한 정보를 추출하여 딕셔너리 리스트로 반환합니다.
    """
    print(f"[INFO] '{category_name}' 카테고리 스크래핑 시작...")
    options = Options()
    options.add_argument("--headless")
    driver = webdriver.Chrome(options=options)
    driver.get(url)
    time.sleep(3)

    elements = driver.find_elements(By.CSS_SELECTOR, "ol.col4 > li")[:100]
    data: list[ScrapeItem] = []


    for idx, el in enumerate(elements):
        try:
            item_id = el.get_attribute("id")  # 예: "g_1088366333"
            ship_info = el.find_element(By.CLASS_NAME, "ship_area").find_element(By.TAG_NAME, "dfn").text.strip()
            if "Oversea Shipping" not in ship_info and "海外配送" not in ship_info:
                continue
            print(f"  - [{idx+1}/{len(elements)}] 항목 처리 중...")
            rank = int(el.find_element(By.CLASS_NAME, "rank").text)
            name_el = el.find_element(By.CLASS_NAME, "tt")
            name = name_el.text.replace("\n", " ")
            link = name_el.get_attribute("href")

            try:
                img_tag = el.find_element(By.CLASS_NAME, "thmb").find_element(By.TAG_NAME, "img")
                image_url = img_tag.get_attribute("gd_src") or img_tag.get_attribute("src")
            except Exception:
                image_url = ""

            brand_elements = el.find_elements(By.CLASS_NAME, "txt_brand")
            if brand_elements:
                brand_tag = brand_elements[0]
                brand_name = brand_tag.get_attribute("title")
                brand_link = brand_tag.get_attribute("href")
                is_official = True if brand_tag.find_elements(By.CLASS_NAME, "official") else False

            else:
                brand_name = ""
                brand_link = ""

            try:
                sold = int(el.find_element(By.CLASS_NAME, "sold").text.replace(" 個販売", "").replace(",", ""))
            except:
                sold = None
            try:
                original_price = int(el.find_element(By.TAG_NAME, "del").text.replace("円", "").replace(",", ""))
            except:
                original_price = None
            try:
                sale_price = int(el.find_element(By.TAG_NAME, "strong").text.replace("円", "").replace(",", ""))
            except:
                sale_price = None
            try:
                mega_price_text = el.find_element(By.CLASS_NAME, "sale_coupon").text
                mega_price = int(mega_price_text.split("円")[0].replace(",", "").strip())
            except:
                mega_price = None
            try:
                review_count = int(el.find_element(By.CLASS_NAME, "review_total_count").text.strip("()").replace(",", ""))
            except:
                review_count = None

            discount_rate = round((1 - sale_price / original_price) * 100, 1) if original_price and sale_price else None
            mega_discount_rate = round((1 - mega_price / original_price) * 100, 1) if original_price and mega_price else None

            items = ScrapeItem(
                item_id=item_id,
                ship_info=ship_info,
                item_name=name,
                link=link,
                brand_name=brand_name,
                brand_link=brand_link,
                thumbnail=image_url,
                is_official=is_official,
                rank=rank,
                sold=sold,
                original_price=original_price,
                sale_price=sale_price,
                discount_rate=discount_rate,
                mega_price=mega_price,
                mega_discount_rate=mega_discount_rate,
                review_count=review_count
            )
       
            data.append(items)
        except Exception as e:
            print(f"[ERROR] 항목 처리 중 오류 발생: {e}")
            continue
    driver.quit()
    print(f"[INFO] '{category_name}' 카테고리 스크래핑 완료.")
    return data
    


async def update_db_from_scraped_data(category: str) -> RankingSnapshot:
    urls = {
        "total": "https://www.qoo10.jp/gmkt.inc/BestSellers/",
        "fashion": "https://www.qoo10.jp/gmkt.inc/Bestsellers/?g=1",
        "beauty": "https://www.qoo10.jp/gmkt.inc/Bestsellers/?g=2",
        "men_sports": "https://www.qoo10.jp/gmkt.inc/Bestsellers/?g=3", # 남성스포츠
        "appliance": "https://www.qoo10.jp/gmkt.inc/Bestsellers/?g=4", # 가전.PC.게임
        "smart_phone": "https://www.qoo10.jp/gmkt.inc/Bestsellers/?g=5", # 스마트폰,이어폰
        "food": "https://www.qoo10.jp/gmkt.inc/Bestsellers/?g=6", # 식품/건강
        "pet": "https://www.qoo10.jp/gmkt.inc/Bestsellers/?g=15", # 반려동물
        "kids": "https://www.qoo10.jp/gmkt.inc/Bestsellers/?g=13", # 유아동
        "k-pop": "https://www.qoo10.jp/gmkt.inc/Bestsellers/?g=10", # K-POP
    }
    if category not in urls:
        raise ValueError("지원하지 않는 카테고리입니다.")
    scraped_items = await asyncio.to_thread(scrape_category, urls[category], category)


    new_snapshot = await RankingSnapshot(category=category).insert()

    for scraped_item in scraped_items:
        item = await Item.find_one(Item.item_id == scraped_item.item_id)
        if not item:
            # 1) Item이 존재하지 않는 경우, 새로 생성
            item = await Item(
                item_id       = scraped_item.item_id,
                item_name     = scraped_item.item_name,
                link          = scraped_item.link,
                brand_name    = scraped_item.brand_name,
                brand_link    = scraped_item.brand_link,
                thumbnail     = scraped_item.thumbnail,
                ship_info     = scraped_item.ship_info,
                is_official   = scraped_item.is_official,
            ).insert()
        else:
            # 3) Item이 존재하는 경우, 업데이트
            item.item_name     = scraped_item.item_name
            item.link          = scraped_item.link
            item.brand_name    = scraped_item.brand_name
            item.brand_link    = scraped_item.brand_link
            item.thumbnail     = scraped_item.thumbnail
            item.ship_info     = scraped_item.ship_info
            item.is_official     = scraped_item.is_official
            await item.save()
        
        # 2) 오늘자 동일 ItemSnapshot 조회
        item_snapshot = await ItemSnapshot.find_one({
            "item": item, 
            "ranking_snapshot": new_snapshot,  # 혹은 {"$exists": False} 로 확인도 가능
        })
        item_snapshot = await ItemSnapshot(
            item              = item, # Link로 정적 Item 문서
            category          = category,
            rank              = scraped_item.rank,
            sold              = scraped_item.sold,
            original_price    = scraped_item.original_price,
            sale_price        = scraped_item.sale_price,
            discount_rate     = scraped_item.discount_rate,
            mega_price        = scraped_item.mega_price,
            mega_discount_rate= scraped_item.mega_discount_rate,
            review_count      = scraped_item.review_count,
            timestamp         = new_snapshot.timestamp,
        ).insert()


        # 4) RankingSnapshot에 링크 연결
        new_snapshot.items.append(item_snapshot)

    # 5) 최종 RankingSnapshot 저장 (items 배열 포함)
    await new_snapshot.save()
    return new_snapshot