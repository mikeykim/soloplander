/**
 * 날짜 문자열을 포맷팅하는 함수
 * @param dateString - ISO 형식의 날짜 문자열 (예: "2023-05-15T12:00:00Z")
 * @returns 포맷팅된 날짜 문자열 (예: "May 15, 2023")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // 유효하지 않은 날짜인 경우 빈 문자열 반환
  if (isNaN(date.getTime())) return '';
  
  // 날짜 포맷팅 옵션
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  // 한국어 로케일로 날짜 포맷팅
  return date.toLocaleDateString('ko-KR', options);
}

/**
 * 날짜 문자열을 상대적 시간으로 포맷팅하는 함수 (예: "3일 전", "1시간 전")
 * @param dateString - ISO 형식의 날짜 문자열
 * @returns 상대적 시간 문자열
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // 유효하지 않은 날짜인 경우 빈 문자열 반환
  if (isNaN(date.getTime())) return '';
  
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // 1분 미만
  if (diffInSeconds < 60) {
    return '방금 전';
  }
  
  // 1시간 미만
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}분 전`;
  }
  
  // 1일 미만
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}시간 전`;
  }
  
  // 1주일 미만
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}일 전`;
  }
  
  // 1개월 미만
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}주 전`;
  }
  
  // 1년 미만
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}개월 전`;
  }
  
  // 1년 이상
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years}년 전`;
} 