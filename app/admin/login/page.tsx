'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/admin'
  
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // 로컬 API 엔드포인트로 인증 요청
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '로그인에 실패했습니다.')
      }
      
      // 로그인 성공 시 리디렉션
      router.push(redirectPath)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-header">
          <Link href="/" className="site-logo">
            <Image 
              src="/logo.png" 
              alt="Site Logo" 
              width={40} 
              height={40}
              className="logo-image"
            />
            <span className="site-name">관리자 페이지</span>
          </Link>
        </div>
        
        <div className="login-form-container">
          <h1>관리자 로그인</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="관리자 비밀번호를 입력하세요"
              />
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          
          <div className="back-to-site">
            <Link href="/">
              메인 사이트로 돌아가기
            </Link>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .admin-login-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f1f5f9;
        }
        
        .login-container {
          width: 100%;
          max-width: 400px;
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .login-header {
          padding: 1.5rem;
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .site-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #1e293b;
        }
        
        .logo-image {
          border-radius: 0.25rem;
        }
        
        .site-name {
          margin-left: 0.75rem;
          font-weight: 600;
          font-size: 1.125rem;
        }
        
        .login-form-container {
          padding: 2rem;
        }
        
        .login-form-container h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        
        .error-message {
          background-color: #fee2e2;
          color: #b91c1c;
          padding: 0.75rem;
          border-radius: 0.375rem;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
        }
        
        input {
          padding: 0.625rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #1e293b;
          background-color: #f8fafc;
        }
        
        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
        }
        
        .login-button {
          padding: 0.625rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 0.5rem;
        }
        
        .login-button:hover {
          background-color: #2563eb;
        }
        
        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .back-to-site {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
        }
        
        .back-to-site a {
          color: #64748b;
          text-decoration: none;
        }
        
        .back-to-site a:hover {
          color: #334155;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
} 