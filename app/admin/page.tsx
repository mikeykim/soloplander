'use client'

import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="admin-dashboard">
      <h1>관리자 대시보드</h1>
      <p>솔로프리너 사이트 관리를 위한 대시보드입니다.</p>
      
      <div className="admin-cards">
        <Link href="/admin/solopreneurs" className="admin-card">
          <h2>솔로프리너 관리</h2>
          <p>솔로프리너 프로필을 추가, 수정, 삭제합니다.</p>
        </Link>
      </div>
      
      <style jsx>{`
        .admin-dashboard {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
        }
        
        p {
          color: #64748b;
          margin-bottom: 2rem;
        }
        
        .admin-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .admin-card {
          background-color: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .admin-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .admin-card h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        
        .admin-card p {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  )
} 