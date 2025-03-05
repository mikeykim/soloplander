import { useState, useEffect } from 'react';
import { ISolopreneur } from '@/types';

export function useSolopreneurs() {
  const [solopreneurs, setSolopreneurs] = useState<ISolopreneur[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSolopreneurs() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/solopreneurs');
        
        if (!response.ok) {
          throw new Error('솔로프리너 데이터를 가져오는 중 오류가 발생했습니다.');
        }
        
        const data = await response.json();
        setSolopreneurs(data);
      } catch (err) {
        console.error('솔로프리너 데이터 로딩 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSolopreneurs();
  }, []);

  return { solopreneurs, isLoading, error };
}

export function useSolopreneur(id: string) {
  const [solopreneur, setSolopreneur] = useState<ISolopreneur | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSolopreneur() {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/solopreneurs/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('솔로프리너를 찾을 수 없습니다.');
          }
          throw new Error('솔로프리너 데이터를 가져오는 중 오류가 발생했습니다.');
        }
        
        const data = await response.json();
        setSolopreneur(data);
      } catch (err) {
        console.error('솔로프리너 상세 데이터 로딩 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSolopreneur();
  }, [id]);

  return { solopreneur, isLoading, error };
} 