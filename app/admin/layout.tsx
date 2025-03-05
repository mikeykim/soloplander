'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface IAdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: IAdminLayoutProps) {
  const router = useRouter()
  
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
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h1>관리자 대시보드</h1>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link href="/admin">대시보드</Link>
            </li>
            <li>
              <Link href="/admin/solopreneurs">솔로프리너 관리</Link>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            로그아웃
          </button>
        </div>
      </aside>
      
      <div className="admin-content">
        {children}
      </div>
      
      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
        }
        
        .admin-sidebar {
          width: 250px;
          background-color: #1e293b;
          color: white;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-header h1 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 2rem;
        }
        
        .sidebar-nav {
          flex: 1;
        }
        
        .sidebar-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .sidebar-nav li {
          margin-bottom: 0.5rem;
        }
        
        .sidebar-nav a {
          display: block;
          padding: 0.5rem 0;
          color: #cbd5e1;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .sidebar-nav a:hover {
          color: white;
        }
        
        .admin-content {
          flex: 1;
          padding: 2rem;
          background-color: #f8fafc;
        }
        
        .sidebar-footer {
          padding: 1.5rem 0 0 0;
          border-top: 1px solid #334155;
          margin-top: 1.5rem;
        }
        
        .logout-button {
          display: block;
          width: 100%;
          padding: 0.625rem;
          background-color: #ef4444;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .logout-button:hover {
          background-color: #dc2626;
        }
      `}</style>
    </div>
  )
} 