'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  LayoutDashboard,
  Users,
  GlobeIcon,
  TagIcon,
  ListChecks,
  UserRound,
  Share,
  TrendingUp
} from 'lucide-react'

interface IStats {
  totalSolopreneurs: number
  regionCounts: {
    USA: number
    Europe: number
    Asia: number
    Other: number
  }
  genderCounts: {
    남성: number
    여성: number
    기타: number
  }
  platformCounts: Record<string, number>
  keywordCounts: Record<string, number>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<IStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/stats')
        if (!response.ok) {
          throw new Error('통계 데이터를 불러오는데 실패했습니다')
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : '오류가 발생했습니다')
        console.error('통계 데이터 불러오기 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // 플랫폼 정보 매핑 
  const platformInfo = {
    youtube: { name: '유튜브', color: 'bg-rose-500' },
    twitter: { name: '트위터', color: 'bg-sky-500' },
    linkedin: { name: '링크드인', color: 'bg-blue-600' },
    instagram: { name: '인스타그램', color: 'bg-fuchsia-500' },
    website: { name: '웹사이트', color: 'bg-emerald-500' }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center mb-8 border-b border-slate-200 pb-6">
          <div className="bg-indigo-100 p-3 rounded-full mr-5">
            <LayoutDashboard className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">관리자 대시보드</h1>
            <p className="text-slate-500 mt-1">솔로프리너 플랫폼 관리 및 통계 현황</p>
          </div>
        </div>
        
        {/* 통계 카드 섹션 */}
        {loading ? (
          <div className="flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100 p-10 animate-pulse">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-200 mb-4"></div>
              <div className="h-5 w-40 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-red-800 font-medium">데이터 로드 오류</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : stats ? (
          <>
            {/* 주요 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* 전체 솔로프리너 수 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="bg-indigo-50 p-3 rounded-full mr-4">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">전체 솔로프리너</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.totalSolopreneurs}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-xs font-medium text-emerald-500">활성 계정</span>
                </div>
              </div>
              
              {/* 지역 분포 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="bg-emerald-50 p-3 rounded-full mr-4">
                    <GlobeIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">지역 분포</p>
                    <p className="text-3xl font-bold text-slate-800">{Object.keys(stats.regionCounts).length}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 mr-1"></div>
                      <span>USA: {stats.regionCounts.USA}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-violet-500 mr-1"></div>
                      <span>Europe: {stats.regionCounts.Europe}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
                      <span>Asia: {stats.regionCounts.Asia}</span>
                    </div>
                  </div>
                  <div className="flex h-2.5 mt-2 rounded-full overflow-hidden bg-slate-100">
                    <div 
                      className="bg-indigo-500 transition-all duration-500" 
                      style={{ 
                        width: `${stats.totalSolopreneurs ? (stats.regionCounts.USA / stats.totalSolopreneurs) * 100 : 0}%` 
                      }}
                    ></div>
                    <div 
                      className="bg-violet-500 transition-all duration-500" 
                      style={{ 
                        width: `${stats.totalSolopreneurs ? (stats.regionCounts.Europe / stats.totalSolopreneurs) * 100 : 0}%` 
                      }}
                    ></div>
                    <div 
                      className="bg-amber-500 transition-all duration-500" 
                      style={{ 
                        width: `${stats.totalSolopreneurs ? (stats.regionCounts.Asia / stats.totalSolopreneurs) * 100 : 0}%` 
                      }}
                    ></div>
                    <div 
                      className="bg-slate-400 transition-all duration-500" 
                      style={{ 
                        width: `${stats.totalSolopreneurs ? (stats.regionCounts.Other / stats.totalSolopreneurs) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* 카테고리 수 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="bg-purple-50 p-3 rounded-full mr-4">
                    <TagIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">총 카테고리</p>
                    <p className="text-3xl font-bold text-slate-800">{Object.keys(stats.keywordCounts).length}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-2">상위 카테고리</p>
                  <div className="space-y-2">
                    {Object.entries(stats.keywordCounts).slice(0, 2).map(([keyword, count], index) => (
                      <div key={keyword} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-amber-500' : 'bg-emerald-500'} mr-2`}></div>
                          <span className="text-xs font-medium text-slate-700">{keyword}</span>
                        </div>
                        <span className="text-xs font-medium text-slate-500">{count}명</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 성별 분포 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="bg-sky-50 p-3 rounded-full mr-4">
                    <UserRound className="h-6 w-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">성별 분포</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xl font-bold text-sky-600">{stats.genderCounts.남성}</span>
                      <span className="text-xl font-bold text-rose-500">{stats.genderCounts.여성}</span>
                      {stats.genderCounts.기타 > 0 && (
                        <span className="text-xl font-bold text-slate-500">{stats.genderCounts.기타}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">남성</span>
                      <span className="text-slate-500">{stats.totalSolopreneurs ? ((stats.genderCounts.남성 / stats.totalSolopreneurs) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-sky-500 h-2 rounded-full transition-all duration-500" style={{ width: `${stats.totalSolopreneurs ? (stats.genderCounts.남성 / stats.totalSolopreneurs) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">여성</span>
                      <span className="text-slate-500">{stats.totalSolopreneurs ? ((stats.genderCounts.여성 / stats.totalSolopreneurs) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-rose-500 h-2 rounded-full transition-all duration-500" style={{ width: `${stats.totalSolopreneurs ? (stats.genderCounts.여성 / stats.totalSolopreneurs) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  
                  {stats.genderCounts.기타 > 0 && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-700 font-medium">기타</span>
                        <span className="text-slate-500">{stats.totalSolopreneurs ? ((stats.genderCounts.기타 / stats.totalSolopreneurs) * 100).toFixed(1) : 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-slate-500 h-2 rounded-full transition-all duration-500" style={{ width: `${stats.totalSolopreneurs ? (stats.genderCounts.기타 / stats.totalSolopreneurs) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
              
            {/* 상세 통계 카드 (두 번째 줄) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              {/* 플랫폼 통계 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transform transition-all duration-200 hover:shadow-md overflow-hidden">
                <div className="flex items-center mb-4">
                  <div className="bg-rose-50 p-3 rounded-full mr-4">
                    <Share className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">플랫폼 통계</p>
                    <p className="text-xl font-bold text-slate-800">{Object.keys(stats.platformCounts).length}개 플랫폼</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(stats.platformCounts).map(([platform, count]) => {
                    const info = platformInfo[platform as keyof typeof platformInfo] || { name: platform, color: 'bg-slate-500' };
                    const totalCount = Object.values(stats.platformCounts).reduce((sum, c) => sum + c, 0);
                    const percentage = (count / totalCount * 100).toFixed(1);
                    
                    return (
                      <div key={platform} className="platform-item">
                        <div className="flex justify-between text-xs mb-1">
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full ${info.color.replace('bg-', 'bg-')} mr-1.5`}></div>
                            <span className="font-medium text-slate-700">{info.name}</span>
                          </div>
                          <span className="text-slate-500">{percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                          <div className={`${info.color} h-2 rounded-full transition-all duration-500`} 
                               style={{ width: `${percentage}%` }}></div>
                        </div>
                        <div className="text-xs text-slate-500 text-right">{count}개</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* 상위 카테고리 통계 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transform transition-all duration-200 hover:shadow-md overflow-hidden">
                <div className="flex items-center mb-4">
                  <div className="bg-amber-50 p-3 rounded-full mr-4">
                    <BarChart className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">상위 카테고리</p>
                    <p className="text-xl font-bold text-slate-800">인기 키워드 분석</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(stats.keywordCounts).slice(0, 6).map(([keyword, count], index) => {
                    const maxCount = Object.values(stats.keywordCounts).reduce((max, c) => Math.max(max, c), 0);
                    const percentage = (count / maxCount * 100).toFixed(0);
                    
                    const colors = [
                      'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500', 
                      'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'
                    ];
                    
                    return (
                      <div key={keyword} className="keyword-item">
                        <div className="flex justify-between text-xs mb-1">
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full ${colors[index]} mr-1.5`}></div>
                            <span className="font-medium text-slate-700 truncate max-w-[120px]">{keyword}</span>
                          </div>
                          <span className="text-slate-500 ml-1">{count}명</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`${colors[index]} h-2.5 rounded-full transition-all duration-700`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : null}
        
        {/* 기능 카드 섹션 */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-6">관리 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/solopreneurs" className="group">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full transform transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1 group-hover:border-indigo-200">
                <div className="bg-indigo-50 p-4 rounded-full inline-flex mb-5 transition-all duration-300 group-hover:bg-indigo-100">
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 transition-colors duration-300 group-hover:text-indigo-600">솔로프리너 관리</h3>
                <p className="text-slate-500">솔로프리너 프로필 추가, 수정 및 삭제와 카테고리 관리를 진행할 수 있습니다.</p>
              </div>
            </Link>
            
            <div className="relative bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full opacity-60">
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">준비 중</span>
              </div>
              <div className="bg-green-50 p-4 rounded-full inline-flex mb-5">
                <BarChart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">트래픽 분석</h3>
              <p className="text-slate-500">방문자 통계, 페이지 조회수, 체류 시간 등 사이트 활동 데이터를 분석합니다.</p>
            </div>
            
            <div className="relative bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full opacity-60">
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">준비 중</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-full inline-flex mb-5">
                <LineChart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">성장 추세</h3>
              <p className="text-slate-500">시간별 솔로프리너 증가 추세와 카테고리 인기도 변화를 추적합니다.</p>
            </div>
          </div>
        </div>
        
        {/* 최근 업데이트 정보 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">최근 업데이트</h3>
          <div className="border-l-2 border-indigo-200 pl-4 ml-2">
            <div className="mb-4 relative">
              <div className="absolute -left-6 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white"></div>
              <p className="text-sm text-slate-500">2024년 5월</p>
              <p className="font-medium text-slate-700">관리자 대시보드 UI 개선</p>
              <p className="text-xs text-slate-500 mt-1">통계 시각화 및 전반적인 사용자 경험 개선</p>
            </div>
            <div className="mb-4 relative">
              <div className="absolute -left-6 w-4 h-4 rounded-full bg-slate-300 border-2 border-white"></div>
              <p className="text-sm text-slate-500">2024년 4월</p>
              <p className="font-medium text-slate-700">솔로프리너 키워드 관리 기능 추가</p>
              <p className="text-xs text-slate-500 mt-1">카테고리별 솔로프리너 분류 및 검색 기능 개선</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 