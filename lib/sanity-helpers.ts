import { client } from './sanity';

// 타입 문제를 우회하는 래퍼 함수
export async function fetchSanity(query: string, params?: any) {
  // @ts-ignore
  return client.fetch(query, params);
} 