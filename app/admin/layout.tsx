'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutDashboard, Users, LogOut, Home } from 'lucide-react'

interface IAdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: IAdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // 로그아웃 성공 시 로그인 페이지로 리디렉션
        router.push('/admin/login')
        router.refresh()
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error)
    }
  }
  
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased">
      {/* 사이드바 */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="h-6 w-6 text-indigo-400" />
            <h1 className="text-lg font-bold">관리자 패널</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-5">
          <div className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            메뉴
          </div>
          <ul className="space-y-1">
            <li>
              <Link 
                href="/admin" 
                className={`flex items-center px-3 py-2.5 text-sm rounded-md transition-colors ${
                  pathname === '/admin' 
                    ? 'bg-indigo-600 text-white font-medium' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 mr-3 shrink-0" />
                <span>대시보드</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/solopreneurs" 
                className={`flex items-center px-3 py-2.5 text-sm rounded-md transition-colors ${
                  pathname?.includes('/admin/solopreneurs') 
                    ? 'bg-indigo-600 text-white font-medium' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="h-4 w-4 mr-3 shrink-0" />
                <span>솔로프리너 관리</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/" 
                className="flex items-center px-3 py-2.5 text-sm rounded-md transition-colors text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Home className="h-4 w-4 mr-3 shrink-0" />
                <span>홈페이지로 이동</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-5 border-t border-slate-700/50">
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </button>
        </div>
      </aside>
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
} 