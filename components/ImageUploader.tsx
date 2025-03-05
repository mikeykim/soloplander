'use client'

import { useState, useRef, ChangeEvent } from 'react'
import Image from 'next/image'

interface IImageUploaderProps {
  initialImage?: string
  onImageUpload: (imageUrl: string) => void
  platform?: 'profile' | 'youtube' | 'twitter' | 'linkedin'
  label: string
  className?: string
}

export default function ImageUploader({
  initialImage,
  onImageUpload,
  platform = 'profile',
  label,
  className = ''
}: IImageUploaderProps) {
  const [image, setImage] = useState<string | null>(initialImage || null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    console.log('파일 선택됨:', file.name, file.type, file.size);
    
    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.')
      return
    }
    
    // 이미지 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.')
      return
    }
    
    setIsUploading(true)
    setError(null)
    
    try {
      // FormData 생성
      const formData = new FormData()
      formData.append('file', file)
      formData.append('platform', platform)
      
      console.log('이미지 업로드 요청 시작:', platform);
      
      // 파일 업로드 API 호출
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      console.log('이미지 업로드 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const data = await response.json()
        console.error('이미지 업로드 실패:', data);
        throw new Error(data.error || '이미지 업로드에 실패했습니다.')
      }
      
      const data = await response.json()
      console.log('이미지 업로드 성공:', data);
      
      // 이미지 URL 설정
      setImage(data.url)
      
      // 부모 컴포넌트에 이미지 URL 전달
      onImageUpload(data.url)
    } catch (err) {
      console.error('이미지 업로드 오류:', err);
      setError(err instanceof Error ? err.message : '이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }
  
  // 플랫폼별 이미지 크기 설정
  const getImageDimensions = () => {
    switch (platform) {
      case 'youtube':
        return { width: 320, height: 180 } // 16:9 비율
      case 'twitter':
        return { width: 300, height: 150 } // 2:1 비율
      case 'linkedin':
        return { width: 280, height: 160 } // 1.75:1 비율
      case 'profile':
      default:
        return { width: 150, height: 150 } // 정사각형
    }
  }
  
  const { width, height } = getImageDimensions()
  
  return (
    <div className={`image-uploader ${className}`}>
      <label className="uploader-label">{label}</label>
      
      <div className="uploader-container">
        {image ? (
          <div className="image-preview">
            <Image
              src={image}
              alt="Uploaded image"
              width={width}
              height={height}
              className="preview-image"
            />
            <button
              type="button"
              className="change-image-button"
              onClick={handleButtonClick}
              disabled={isUploading}
            >
              이미지 변경
            </button>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="placeholder-content">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                <line x1="16" y1="5" x2="22" y2="5"></line>
                <line x1="19" y1="2" x2="19" y2="8"></line>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
              <span>{isUploading ? '업로드 중...' : '이미지 업로드'}</span>
            </div>
            <button
              type="button"
              className="upload-button"
              onClick={handleButtonClick}
              disabled={isUploading}
            >
              파일 선택
            </button>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="file-input"
        />
      </div>
      
      {error && <div className="upload-error">{error}</div>}
      
      <style jsx>{`
        .image-uploader {
          margin-bottom: 1.5rem;
        }
        
        .uploader-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          margin-bottom: 0.5rem;
        }
        
        .uploader-container {
          border: 2px dashed #cbd5e1;
          border-radius: 0.5rem;
          padding: 1.5rem;
          text-align: center;
          background-color: #f8fafc;
          transition: border-color 0.2s;
        }
        
        .uploader-container:hover {
          border-color: #94a3b8;
        }
        
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .placeholder-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
        }
        
        .upload-button {
          padding: 0.5rem 1rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .upload-button:hover {
          background-color: #2563eb;
        }
        
        .upload-button:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }
        
        .file-input {
          display: none;
        }
        
        .image-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .preview-image {
          object-fit: cover;
          border-radius: 0.375rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .change-image-button {
          padding: 0.5rem 1rem;
          background-color: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .change-image-button:hover {
          background-color: #e2e8f0;
        }
        
        .change-image-button:disabled {
          background-color: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
        }
        
        .upload-error {
          margin-top: 0.5rem;
          color: #ef4444;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  )
} 