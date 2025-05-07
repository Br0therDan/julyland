# app/services/excel_service.py
import os
import io
import requests
import pandas as pd
from beanie import PydanticObjectId
from datetime import datetime
from app.models.ranking import RankingSnapshot

async def export_ranking_to_excel(ranking_id: PydanticObjectId, output_path: str):
    ranking = await RankingSnapshot.get(ranking_id)
    if not ranking:
        raise ValueError("해당 Ranking 데이터가 존재하지 않습니다.")

    items = ranking.items
    display_str = ranking.display_time.strftime("%Y-%m-%d %H:%M")

    with pd.ExcelWriter(output_path, engine="xlsxwriter") as writer:
        workbook = writer.book
        currency_format = workbook.add_format({
            'num_format': '#,##0"円"', 'valign': 'vcenter', 'align': 'right', 'border': 1})
        ranking_format = workbook.add_format({
            'num_format': '#,##0', 'valign': 'vcenter', 'align': 'center', 'border': 1})
        number_format = workbook.add_format({
            'num_format': '#,##0', 'valign': 'vcenter', 'align': 'right', 'border': 1})
        text_format = workbook.add_format({
            'valign': 'vcenter', 'align': 'center', 'border': 1})
        link_format = workbook.add_format({
            'font_color': 'blue', 'underline': 1, 'text_wrap': True,
            'valign': 'vcenter', 'align': 'left', 'border': 1})
        brand_link_format = workbook.add_format({
            'font_color': 'blue', 'underline': 1, 'valign': 'vcenter', 'align': 'left', 'border': 1})
        left_text_format = workbook.add_format({
            'valign': 'vcenter', 'align': 'left', 'border': 1})
        title_format = workbook.add_format({'bold': True, 'font_size': 14})
        header_format = workbook.add_format({
            'bold': True, 'valign': 'vcenter', 'align': 'center', 'border': 1, 'bg_color': '#D9E1F2'})
        official_format = workbook.add_format({
            'valign': 'vcenter', 'align': 'center', 'border': 1, 'bg_color': '#C6EFCE'})
        unofficial_format = workbook.add_format({
            'valign': 'vcenter', 'align': 'center', 'border': 1, 'bg_color': '#F8CBAD'})
        percent_format = workbook.add_format({
            'num_format': '0.0%', 'valign': 'vcenter', 'align': 'center', 'border': 1})

        worksheet = workbook.add_worksheet("Ranking")
        worksheet.write("A1", f"Qoo10 {ranking.category} 랭킹 리포트 (기준 시각: {display_str})", title_format)
        worksheet.set_column("B:B", 13.57)
        worksheet.set_column("C:C", 45)
        worksheet.set_column("D:D", 25)
        worksheet.set_column("E:K", 15)

        headers = ["순위", "썸네일", "아이템명", "브랜드명", "유형", "판매수량",
                   "정상가", "할인가", "할인율", "메가포가", "메가할인율", "리뷰수"]
        for col_num, header in enumerate(headers):
            worksheet.write(2, col_num, header, header_format)

        for idx, snap in enumerate(items):
            row = idx + 3
            worksheet.set_row(row, 73)

            rank_val = snap.overall_ranking if ranking.category == "total" else snap.category_rank
            worksheet.write_number(row, 0, rank_val or 0, ranking_format)

            worksheet.write_blank(row, 1, None, text_format)
            if snap.thumbnail:
                try:
                    resp = requests.get(snap.thumbnail)
                    if resp.status_code == 200:
                        img = io.BytesIO(resp.content)
                        worksheet.insert_image(row, 1, 'img.jpg', {'image_data': img})
                except:
                    pass

            worksheet.write_url(row, 2, snap.link, link_format, snap.item_name)
            if snap.brand_link:
                worksheet.write_url(row, 3, snap.brand_link, brand_link_format, snap.brand_name)
            else:
                worksheet.write(row, 3, snap.brand_name, left_text_format)

            fmt = official_format if snap.item_type == "공식" else unofficial_format
            worksheet.write(row, 4, snap.item_type, fmt)

            worksheet.write_number(row, 5, snap.sold or 0, number_format)
            worksheet.write_number(row, 6, snap.original_price or 0, currency_format)
            worksheet.write_number(row, 7, snap.sale_price or 0, currency_format)
            if snap.discount_rate is not None:
                worksheet.write_number(row, 8, snap.discount_rate / 100, percent_format)
            else:
                worksheet.write(row, 8, "", text_format)
            worksheet.write_number(row, 9, snap.mega_price or 0, currency_format)
            if snap.mega_discount_rate is not None:
                worksheet.write_number(row, 10, snap.mega_discount_rate / 100, percent_format)
            else:
                worksheet.write(row, 10, "", text_format)
            worksheet.write_number(row, 11, snap.review_count or 0, number_format)
    print(f"✅ 엑셀 저장 완료: {output_path}")