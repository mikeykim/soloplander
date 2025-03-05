'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RegionType } from '@/types'
import ImageUploader from '@/components/ImageUploader'

interface IFormData {
  name: string
  region: RegionType
  image: string
  description: string
  gender: 'male' | 'female'
  youtubeLink: string
  twitterLink: string
  linkedinLink: string
  websiteLink: string
  youtubePreview: string
  twitterPreview: string
  linkedinPreview: string
  keywords: string
}

export default function NewSolopreneurPage() {
  const router = useRouter()
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<IFormData>({
    name: '',
    region: 'USA',
    image: '',
    description: '',
    gender: 'male',
    youtubeLink: '',
    twitterLink: '',
    linkedinLink: '',
    websiteLink: '',
    youtubePreview: '',
    twitterPreview: '',
    linkedinPreview: '',
    keywords: ''
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfileImageUpload = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      image: imageUrl
    }))
  }

  const handleYoutubePreviewUpload = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      youtubePreview: imageUrl
    }))
  }

  const handleTwitterPreviewUpload = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      twitterPreview: imageUrl
    }))
  }

  const handleLinkedinPreviewUpload = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      linkedinPreview: imageUrl
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Prepare the data for API
      const apiData = {
        name: formData.name,
        region: formData.region,
        image: formData.image,
        description: formData.description,
        gender: formData.gender,
        links: {
          youtube: formData.youtubeLink || null,
          twitter: formData.twitterLink || null,
          linkedin: formData.linkedinLink || null,
          website: formData.websiteLink || null,
          previews: {
            youtube: formData.youtubePreview || null,
            twitter: formData.twitterPreview || null,
            linkedin: formData.linkedinPreview || null
          }
        },
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean)
      }

      const response = await fetch('/api/solopreneurs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create solopreneur')
      }

      // Redirect to the solopreneurs list page
      router.push('/admin/solopreneurs')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="new-solopreneur-page">
      <div className="page-header">
        <h1>새 솔로프리너 추가</h1>
        <Link href="/admin/solopreneurs" className="back-button">
          목록으로 돌아가기
        </Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="solopreneur-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">이름 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="전체 이름 입력"
            />
          </div>

          <div className="form-group">
            <label htmlFor="region">지역 *</label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              required
            >
              <option value="USA">미국</option>
              <option value="Europe">유럽</option>
              <option value="Asia">아시아</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="gender">성별 *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">설명 *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="솔로프리너에 대한 설명을 입력하세요"
              rows={4}
            />
          </div>

          <div className="form-group full-width">
            <ImageUploader
              label="프로필 이미지 *"
              initialImage={formData.image}
              onImageUpload={handleProfileImageUpload}
              platform="profile"
              className="profile-image-uploader"
            />
          </div>

          <div className="form-group">
            <label htmlFor="youtubeLink">유튜브 링크</label>
            <input
              type="url"
              id="youtubeLink"
              name="youtubeLink"
              value={formData.youtubeLink}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
            />
          </div>

          {formData.youtubeLink && (
            <div className="form-group full-width">
              <ImageUploader
                label="유튜브 미리보기 이미지"
                initialImage={formData.youtubePreview}
                onImageUpload={handleYoutubePreviewUpload}
                platform="youtube"
                className="preview-image-uploader"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="twitterLink">트위터 링크</label>
            <input
              type="url"
              id="twitterLink"
              name="twitterLink"
              value={formData.twitterLink}
              onChange={handleChange}
              placeholder="https://twitter.com/..."
            />
          </div>

          {formData.twitterLink && (
            <div className="form-group full-width">
              <ImageUploader
                label="트위터 미리보기 이미지"
                initialImage={formData.twitterPreview}
                onImageUpload={handleTwitterPreviewUpload}
                platform="twitter"
                className="preview-image-uploader"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="linkedinLink">링크드인 링크</label>
            <input
              type="url"
              id="linkedinLink"
              name="linkedinLink"
              value={formData.linkedinLink}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          {formData.linkedinLink && (
            <div className="form-group full-width">
              <ImageUploader
                label="링크드인 미리보기 이미지"
                initialImage={formData.linkedinPreview}
                onImageUpload={handleLinkedinPreviewUpload}
                platform="linkedin"
                className="preview-image-uploader"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="websiteLink">웹사이트 링크</label>
            <input
              type="url"
              id="websiteLink"
              name="websiteLink"
              value={formData.websiteLink}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="keywords">키워드 (쉼표로 구분)</label>
            <input
              type="text"
              id="keywords"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              placeholder="예: 마케팅, 디자인, 프리랜서"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={saving}
          >
            {saving ? '저장 중...' : '솔로프리너 추가'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .new-solopreneur-page {
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
        
        .back-button {
          background-color: #64748b;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.2s;
        }
        
        .back-button:hover {
          background-color: #475569;
        }
        
        .error-message {
          background-color: #fee2e2;
          color: #b91c1c;
          padding: 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1.5rem;
        }
        
        .solopreneur-form {
          background-color: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group.full-width {
          grid-column: span 2;
        }
        
        .form-group label {
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #1e293b;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.5rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          font-size: 1rem;
        }
        
        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .form-actions {
          margin-top: 2rem;
          display: flex;
          justify-content: flex-end;
        }
        
        .submit-button {
          background-color: #3b82f6;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .submit-button:hover {
          background-color: #2563eb;
        }
        
        .submit-button:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
} 