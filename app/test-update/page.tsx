'use client'

import { useState, useEffect } from 'react'

interface ISolopreneur {
  id: string | number
  name: string
  region: string
  description: string
  gender: string
  image?: string
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
}

export default function TestUpdatePage() {
  const [solopreneurs, setSolopreneurs] = useState<ISolopreneur[]>([])
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const [formData, setFormData] = useState<Partial<ISolopreneur>>({
    name: '',
    region: '',
    description: '',
    gender: 'male',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<any>(null)
  
  // 솔로프리너 목록 가져오기
  useEffect(() => {
    const fetchSolopreneurs = async () => {
      try {
        const response = await fetch('/api/solopreneurs')
        if (!response.ok) {
          throw new Error('Failed to fetch solopreneurs')
        }
        const data = await response.json()
        setSolopreneurs(data.solopreneurs || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }

    fetchSolopreneurs()
  }, [])
  
  // 솔로프리너 선택 시 폼 데이터 업데이트
  const handleSelectSolopreneur = (id: string | number) => {
    const selected = solopreneurs.find(s => s.id === id)
    if (selected) {
      setSelectedId(id)
      setFormData({
        name: selected.name,
        region: selected.region,
        description: selected.description,
        gender: selected.gender,
      })
    }
  }
  
  // 폼 입력 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/solopreneurs/${selectedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update solopreneur')
      }
      
      const data = await response.json()
      setResponse(data)
      
      // 성공 메시지 표시
      alert('솔로프리너가 성공적으로 업데이트되었습니다.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">솔로프리너 업데이트 테스트</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">솔로프리너 선택:</h2>
        <select 
          className="w-full p-2 border rounded"
          value={selectedId?.toString() || ''}
          onChange={(e) => handleSelectSolopreneur(e.target.value)}
        >
          <option value="">선택하세요</option>
          {solopreneurs.map(solo => (
            <option key={solo.id} value={solo.id.toString()}>
              {solo.name} ({solo.region})
            </option>
          ))}
        </select>
      </div>
      
      {selectedId && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">이름</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">지역</label>
            <input
              type="text"
              name="region"
              value={formData.region || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">설명</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows={4}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">성별</label>
            <select
              name="gender"
              value={formData.gender || 'male'}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? '업데이트 중...' : '업데이트'}
          </button>
        </form>
      )}
      
      {error && <p className="text-red-500 mt-4">{error}</p>}
      
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