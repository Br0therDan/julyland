// iconMap.tsx
import React from 'react'
import {
    Home,
    User,
    Book,
    Settings,
    Globe,
    SquareTerminal,
    Beer,
    ShipWheel,
    ShoppingCart
  } from 'lucide-react'
  
  // 문자열(서버에서 오는 logo 필드) -> 실제 Lucide 컴포넌트
  export const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    home: Home,
    user: User,
    docs: Book,
    settings: Settings,
    locations: Globe,
    quant: SquareTerminal,
    homebrew: Beer,
    yachts: ShipWheel,
    julyland: ShoppingCart
  }
  
  export default function LucideIcons({ icon }: { icon: string }) {
    // 1) map에서 해당 아이콘을 찾는다
    const LucideIcon = iconMap[icon.toLowerCase()] // 소문자/대문자 변환 주의
  
    // 2) 매핑되는 아이콘이 없으면 fallback 처리
    if (!LucideIcon) {
      return <div className="text-red-500">Icon not found</div>
    }
  
    // 3) 찾았다면 React.createElement 등으로 렌더
    return <LucideIcon className="size-4 shrink-0" />
  }