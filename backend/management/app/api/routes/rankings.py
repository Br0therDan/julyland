# app/api/routes/rankings.py
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import FileResponse
from pymongo import ASCENDING, DESCENDING
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import os

from beanie import PydanticObjectId
from app.models.ranking import ItemSnapshot, RankingSnapshot
from app.schemas.ranking import ItemSnapshotPublic, RankingPublic, RankingSnapshotPublic
from app.services.scraping_service import update_db_from_scraped_data
from app.services.excel_service import export_ranking_to_excel

router = APIRouter()

@router.get("/", response_model=List[RankingPublic])
async def list_rankings(
    category: Optional[str] = Query(None, regex="^(total|beauty|fashion|food)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0),
    sort_by: str = Query("created_at", regex="^(created_at|updated_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
):
    direction = ASCENDING if sort_order == "asc" else DESCENDING
    query = {"category": category} if category else {}
    rankings = await RankingSnapshot.find(query, sort=[(sort_by, direction)]).skip(skip).limit(limit).to_list()
    return [RankingPublic(**ranking.model_dump(by_alias=True), counts=len(ranking.items)) for ranking in rankings]


@router.get("/{ranking_id}", response_model=RankingSnapshotPublic)
async def read_ranking_snapshot(ranking_id: PydanticObjectId)-> RankingSnapshotPublic:
    
    ranking = await RankingSnapshot.get(ranking_id, fetch_links=True)
    if not ranking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="랭킹 정보를 찾을 수 없습니다.")
    return RankingSnapshotPublic(**ranking.model_dump(by_alias=True))


@router.get("/today/{category}", response_model=List[RankingSnapshotPublic])
async def get_today_rankings(
    category: str,
    skip: int = 0,
    limit: int = 100,
) -> List[RankingSnapshotPublic]:

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today_start + timedelta(days=1)
    query = {"category": category, "timestamp": {"$gte": today_start, "$lt": tomorrow}}
    rankings = await RankingSnapshot.find_many(query).skip(skip).limit(limit).to_list()
    if not rankings:
        # 오늘 데이터 없으면 스크래핑 후 재조회
        await update_db_from_scraped_data(category)
        rankings = await RankingSnapshot.find_many(query).skip(skip).limit(limit).to_list()
        if not rankings:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="스크래핑 실패: 관리자에게 문의하세요.")
    for ranking in rankings:
        await ranking.fetch_all_links()
    return [RankingSnapshotPublic(**r.model_dump(by_alias=True)) for r in rankings]



@router.delete("/{ranking_id}")
async def delete_ranking(ranking_id: PydanticObjectId):
    # 랭킹 정보 삭제
    ranking = await RankingSnapshot.get(ranking_id)
    if not ranking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="랭킹 정보를 찾을 수 없습니다.")
    await ranking.delete()
    return {"message": "랭킹 정보가 삭제되었습니다."}



@router.post("/scrape/{category}", response_model=RankingSnapshotPublic)
async def scrape_and_return(category: str):
    snapshot = await update_db_from_scraped_data(category)
    return RankingSnapshotPublic(**snapshot.model_dump(by_alias=True))


@router.get("/download/{ranking_id}", summary="랭킹정보 Excel 파일 다운로드", response_class=FileResponse)
async def download_ranking(
    ranking_id: str
):
    # ID 검증
    try:
        rid = PydanticObjectId(ranking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="유효하지 않은 ID 형식입니다.")
    # 파일 생성 경로
    temp_dir = "results"
    os.makedirs(temp_dir, exist_ok=True)
    file_name = f"qoo10_ranking_{datetime.now(timezone.utc).strftime('%Y-%m-%d_%H-%M')}.xlsx"
    output_path = os.path.join(temp_dir, file_name)

    # 엑셀 생성
    await export_ranking_to_excel(rid, output_path)

    # 다운로드 응답
    return FileResponse(
        path=output_path,
        filename=file_name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
