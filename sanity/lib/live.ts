// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { client } from './client';

// 임시 대체 함수 - 원래 기능 대신 일반 fetch 사용
export const sanityFetch = async (query: string, params?: any) => {
  // @ts-ignore
  return client.fetch(query, params);
};

// 더미 컴포넌트 - 에러가 나지 않도록 하기 위함
export const SanityLive = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// 주석 처리된 원래 코드
/*
import { defineLive } from "next-sanity";
import { client } from './client'

export const { sanityFetch, SanityLive } = defineLive({ 
  client: client.withConfig({ 
    // Live content is currently only available on the experimental API
    // https://www.sanity.io/docs/api-versioning
    apiVersion: 'vX' 
  }) 
});
*/
