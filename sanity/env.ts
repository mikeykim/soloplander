/**
 * Sanity 환경 설정
 * 프로젝트 ID, 데이터셋, API 버전 등 Sanity 관련 환경 변수 관리
 */

// 필수 환경 변수 확인 함수
function assertValue<T>(value: T | undefined, errorMessage: string): T {
  if (value === undefined) {
    throw new Error(errorMessage);
  }
  
  return value;
}

// 환경 변수에서 프로젝트 ID 가져오기
export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Sanity project ID is not set in environment variables'
);

// 환경 변수에서 데이터셋 가져오기
export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  'Sanity dataset is not set in environment variables'
);

// API 버전 설정
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03';

// 프로덕션 모드 확인
export const isProduction = process.env.NODE_ENV === 'production';

export const useCdn = false
