'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function TestUploadPage() {
  const [image, setImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<any>(null)
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    console.log('파일 선택됨:', file.name, file.type, file.size)
    
    setIsUploading(true)
    setError(null)
    
    try {
      // FormData 생성
      const formData = new FormData()
      formData.append('file', file)
      formData.append('platform', 'profile')
      
      // 파일 업로드 API 호출
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      console.log('이미지 업로드 응답 상태:', response.status, response.statusText)
      
      if (!response.ok) {
        const data = await response.json()
        console.error('이미지 업로드 실패:', data)
        throw new Error(data.error || '이미지 업로드에 실패했습니다.')
      }
      
      const data = await response.json()
      console.log('이미지 업로드 성공:', data)
      
      // 이미지 URL 설정
      setImage(data.url)
      setResponse(data)
    } catch (err) {
      console.error('이미지 업로드 오류:', err)
      setError(err instanceof Error ? err.message : '이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
    }
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">이미지 업로드 테스트</h1>
      
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
      
      {isUploading && <p className="text-blue-500">업로드 중...</p>}
      
      {error && <p className="text-red-500">{error}</p>}
      
      {image && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">업로드된 이미지:</h2>
          <div className="relative w-64 h-64 border rounded-md overflow-hidden">
            <Image
              src={image}
              alt="Uploaded image"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      )}
      
      {response && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">API 응답:</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 