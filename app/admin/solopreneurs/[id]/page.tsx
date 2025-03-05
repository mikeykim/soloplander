'use client'

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
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

interface IPageProps {
  params: {
    id: string
  }
}

export default function EditSolopreneurPage({ params }: IPageProps) {
  const router = useRouter()
  const { id } = params
  
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    const fetchSolopreneur = async () => {
      try {
        const response = await fetch(`/api/solopreneurs/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch solopreneur')
        }
        
        const data = await response.json()
        
        setFormData({
          name: data.name,
          region: data.region,
          image: data.image,
          description: data.description,
          gender: data.gender,
          youtubeLink: data.links?.youtube || '',
          twitterLink: data.links?.twitter || '',
          linkedinLink: data.links?.linkedin || '',
          websiteLink: data.links?.website || '',
          youtubePreview: data.links?.previews?.youtube || '',
          twitterPreview: data.links?.previews?.twitter || '',
          linkedinPreview: data.links?.previews?.linkedin || '',
          keywords: (data.keywords || []).join(', ')
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchSolopreneur()
  }, [id])

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

      console.log('솔로프리너 업데이트 요청 데이터:', apiData);

      const response = await fetch(`/api/solopreneurs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })

      const responseData = await response.json();
      console.log('솔로프리너 업데이트 응답:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update solopreneur')
      }

      // Redirect to the solopreneurs list page
      router.push('/admin/solopreneurs')
      router.refresh()
    } catch (err) {
      console.error('솔로프리너 업데이트 오류:', err);
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">솔로프리너 데이터를 불러오는 중...</div>
  }

  return (
    <div className="edit-solopreneur-page">
      <div className="page-header">
        <h1>솔로프리너 수정</h1>
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
            <ImageUploader
              label="프로필 이미지 *"
              initialImage={formData.image}
              onImageUpload={handleProfileImageUpload}
              platform="profile"
              className="profile-image-uploader"
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

          <div className="form-group full-width">
            <label htmlFor="description">설명 *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="솔로프리너에 대한 간략한 설명"
            />
          </div>

          <div className="form-group">
            <label htmlFor="youtubeLink">YouTube 링크</label>
            <input
              type="url"
              id="youtubeLink"
              name="youtubeLink"
              value={formData.youtubeLink}
              onChange={handleChange}
              placeholder="https://youtube.com/c/channel"
            />
          </div>

          <div className="form-group">
            <label htmlFor="twitterLink">Twitter 링크</label>
            <input
              type="url"
              id="twitterLink"
              name="twitterLink"
              value={formData.twitterLink}
              onChange={handleChange}
              placeholder="https://twitter.com/username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="linkedinLink">LinkedIn 링크</label>
            <input
              type="url"
              id="linkedinLink"
              name="linkedinLink"
              value={formData.linkedinLink}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="websiteLink">웹사이트 링크</label>
            <input
              type="url"
              id="websiteLink"
              name="websiteLink"
              value={formData.websiteLink}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="keywords">키워드</label>
            <input
              type="text"
              id="keywords"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              placeholder="비즈니스, 마케팅, 기술 (쉼표로 구분)"
            />
            <small>쉼표로 구분된 키워드를 입력하세요</small>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => router.push('/admin/solopreneurs')}
          >
            취소
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={saving}
          >
            {saving ? '저장 중...' : '솔로프리너 업데이트'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .edit-solopreneur-page {
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
          display: inline-flex;
          align-items: center;
          color: #64748b;
          font-size: 0.875rem;
          text-decoration: none;
        }
        
        .back-button:hover {
          color: #334155;
          text-decoration: underline;
        }
        
        .error-message {
          background-color: #fee2e2;
          color: #b91c1c;
          padding: 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1.5rem;
        }
        
        .loading {
          padding: 2rem;
          text-align: center;
          color: #64748b;
        }
        
        .solopreneur-form {
          background-color: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .full-width {
          grid-column: span 2;
        }
        
        label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          margin-bottom: 0.5rem;
        }
        
        input, select, textarea {
          padding: 0.625rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #1e293b;
          background-color: #f8fafc;
        }
        
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
        }
        
        small {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.25rem;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .cancel-button {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          background-color: #f1f5f9;
          border: none;
          cursor: pointer;
        }
        
        .submit-button {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: white;
          background-color: #3b82f6;
          border: none;
          cursor: pointer;
        }
        
        .submit-button:hover {
          background-color: #2563eb;
        }
        
        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
} 