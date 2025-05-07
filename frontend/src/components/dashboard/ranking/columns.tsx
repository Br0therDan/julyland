import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ItemSnapshotPublic } from "@/client/management"; // 스키마 타입
import Image from "next/image";
import DefaultHeader from "@/components/data_table/DefaultHeader";
import { Badge } from '@/components/ui/badge';

// 타입이 필요 없으면 `any`로 대체하세요.
export const columns: ColumnDef<ItemSnapshotPublic>[] = [
  // 1) Select all 체크박스 컬럼
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(val) => row.toggleSelected(!!val)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // 1) 순위
  {
    accessorKey: "rank",
    id: "순위",
    header: (info) => {
      return <DefaultHeader<ItemSnapshotPublic> info={info} name="순위" />;
    },
    cell: ({ row }) => <span>{row.original.rank ?? "-"}</span>,
  },
  // 2) 카테고리
  {
    accessorKey: "category",
    id: "카테고리",
    header: (info) => {
      return <DefaultHeader<ItemSnapshotPublic> info={info} name="카테고리" />;
    },
    cell: ({ row }) => <span className='capitalize'>{row.original.category}</span>,
  },
  // 3) 썸네일
  {
    accessorKey: "thumbnail",
    id: "썸네일",
    header: (info) => {
      return <DefaultHeader<ItemSnapshotPublic> info={info} name="썸네일" />;
    },
    cell: ({ row }) => {
      const { link } = row.original.item;
      return (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline "
            title={row.original.item.item_name}
          >
          <Image
            src={row.original.item.thumbnail || "/globe.svg"}
            alt={row.original.item.item_name}
            width={60}
            height={60}
            className="rounded-md"
            style={{ width: 40, height: 40, objectFit: "cover" }}
          />
        </a>
      );
    },
    enableSorting: false,
  },
  // 2) 카테고리
  {
    accessorKey: "is_official",
    id: "유형",
    header: (info) => {
      return <DefaultHeader<ItemSnapshotPublic> info={info} name="유형" />;
    },
    cell: ({ row }) => {
      const { item } = row.original;
      return (
        <div className="flex items-center">
          {item.is_official == false && <Badge className='bg-blue-500'>비공식</Badge>}
          {item.is_official == null && <Badge className='bg-gray-500'>미제공</Badge>}
          {item.is_official == true && <Badge className='bg-red-500'>공식</Badge>}
        </div>
      );
      }
  },
  // 4) 상품명 (링크)
  {
    accessorKey: "item_name",
    header: (info) => {
      return <DefaultHeader<ItemSnapshotPublic> info={info} name="상품명" />;
    },
    cell: ({ row }) => {
      const { item_name } = row.original.item;
      return (
        <div className="flex items-center max-w-[250px] truncate">
            {item_name}
        </div>
      );
    },
  },

  // 5) 브랜드명 (링크)
  {
    accessorKey: "brand_name",
    header: (info) => {
      return <DefaultHeader<ItemSnapshotPublic> info={info} name="브랜드" />;
    },
    cell: ({ row }) => {
      const { brand_link, brand_name } = row.original.item;
      return brand_link ? (
        <a
          href={brand_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {brand_name}
        </a>
      ) : (
        <span>{brand_name || "-"}</span>
      );
    },
  },

  // 6) 판매량
  {
    accessorKey: "sold",
    header: (info) => {
      return <DefaultHeader<ItemSnapshotPublic> info={info} name="판매량" />;
    },
    cell: ({ row }) =>
      row.original.sold != null ? row.original.sold.toLocaleString() : "-",
  },
  // 7) 참고가격
  {
    accessorKey: "original_price",
    header: (info) => {
      return <DefaultHeader<ItemSnapshotPublic> info={info} name="참고가격" />;
    },
    cell: ({ row }) =>
      row.original.original_price != null
        ? `${row.original.original_price?.toLocaleString()}円`
        : "-",
  },

  // 7) 판매가격
  {
    accessorKey: "sale_price",
    header: (info) => {
      return <DefaultHeader<ItemSnapshotPublic> info={info} name="판매가" />;
    },
    cell: ({ row }) => {
      return (
        <div className="flex justify-start">
          {row.original.sale_price != null ? (
            <div className="flex flex-col font-bold items-center">
              {`${row.original.sale_price.toLocaleString()}円`}
              <div className="text-blue-400 text-xs">{`(${
                row.original.discount_rate ? row.original.discount_rate : " - "
              }%)`}</div>
            </div>
          ) : (
            " - "
          )}
        </div>
      );
    },
  },

  // 8) 메가할인
  {
    accessorKey: "mega_price",
    header: (info) => {
      return <DefaultHeader<ItemSnapshotPublic> info={info} name="메가할인" />;
    },
    cell: ({ row }) => {
      return (
        <div className="flex justify-start">
          {row.original.mega_price != null ? (
            <div className="flex flex-col font-bold text-red-500 items-center">
              {`${row.original.mega_price.toLocaleString()}円`}
              <div className="text-blue-400 text-xs">{`(${
                row.original.mega_discount_rate
                  ? row.original.mega_discount_rate
                  : " - "
              }%)`}</div>
            </div>
          ) : (
            " - "
          )}
        </div>
      );
    },
  },

  // 9) 리뷰 수
  {
    accessorKey: "review_count",
    header: (info) => {
      return <DefaultHeader<ItemSnapshotPublic> info={info} name="리뷰" />;
    },
    cell: ({ row }) =>
      row.original.review_count != null
        ? row.original.review_count.toLocaleString()
        : "-",
  },
];
