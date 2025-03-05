'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface ISolopreneur {
  id: string | number
  name: string
  region: string
  image: string
  preview_image?: string | null
  previewImage?: string
  description: string
  gender: string
  links?: {
    youtube?: string
    twitter?: string
    linkedin?: string
    instagram?: string
    website?: string
    previews?: {
      youtube?: string
      twitter?: string
      linkedin?: string
      instagram?: string
      website?: string
    }
  }
  keywords?: string[]
}

export default function SolopreneursAdminPage() {
  const [solopreneurs, setSolopreneurs] = useState<ISolopreneur[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSolopreneurs = async () => {
      try {
        const response = await fetch('/api/solopreneurs')
        if (!response.ok) {
          throw new Error('Failed to fetch solopreneurs')
        }
        const data = await response.json()
        
        // API 응답 구조 변경에 맞게 데이터 추출
        const solopreneursData = data.solopreneurs || []
        setSolopreneurs(solopreneursData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchSolopreneurs()
  }, [])

  const handleDelete = async (id: string | number) => {
    if (!confirm('이 솔로프리너를 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/solopreneurs/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete solopreneur')
      }

      setSolopreneurs(prev => prev.filter(solo => solo.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  if (loading) {
    return <div className="loading">솔로프리너 데이터를 불러오는 중...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <div className="solopreneurs-admin-page">
      <div className="page-header">
        <h1>솔로프리너 관리</h1>
        <Link href="/admin/solopreneurs/new" className="add-button">
          새 솔로프리너 추가
        </Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">솔로프리너 데이터를 불러오는 중...</div>
      ) : (
        <div className="solopreneurs-list">
          {solopreneurs.length === 0 ? (
            <div className="empty-state">
              <p>등록된 솔로프리너가 없습니다.</p>
              <Link href="/admin/solopreneurs/new" className="add-link">
                첫 번째 솔로프리너를 추가하세요
              </Link>
            </div>
          ) : (
            <div className="solopreneurs-grid">
              {solopreneurs.map(solopreneur => (
                <div key={solopreneur.id} className="solopreneur-card">
                  <div className="card-image">
                    <Image
                      src={solopreneur.preview_image || solopreneur.previewImage || solopreneur.image}
                      alt={solopreneur.name}
                      width={120}
                      height={120}
                      className="profile-image"
                    />
                  </div>
                  <div className="card-content">
                    <h3>{solopreneur.name}</h3>
                    <p className="region">{solopreneur.region}</p>
                    <p className="description">{solopreneur.description.substring(0, 100)}...</p>
                  </div>
                  <div className="card-actions">
                    <Link href={`/admin/solopreneurs/${solopreneur.id}`} className="edit-button">
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(solopreneur.id)}
                      className="delete-button"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .solopreneurs-admin-page {
          width: 100%;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
        }
        
        .add-button {
          background-color: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.2s;
        }
        
        .add-button:hover {
          background-color: #2563eb;
        }
        
        .solopreneurs-list {
          width: 100%;
          background-color: white;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .solopreneurs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          padding: 1rem;
        }
        
        .solopreneur-card {
          background-color: white;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .card-image {
          width: 100%;
          height: 120px;
          overflow: hidden;
        }
        
        .profile-image {
          object-fit: cover;
          width: 100%;
          height: 100%;
        }
        
        .card-content {
          padding: 1rem;
        }
        
        .card-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        
        .card-content p {
          margin: 0.25rem 0;
        }
        
        .region {
          font-weight: 500;
          color: #475569;
        }
        
        .description {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
        }
        
        .edit-button {
          background-color: #10b981;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          text-decoration: none;
        }
        
        .delete-button {
          background-color: #ef4444;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          border: none;
          cursor: pointer;
        }
        
        .empty-state {
          padding: 2rem;
          text-align: center;
          color: #64748b;
        }
        
        .loading, .error {
          padding: 2rem;
          text-align: center;
        }
        
        .error {
          color: #ef4444;
        }
      `}</style>
    </div>
  )
} 