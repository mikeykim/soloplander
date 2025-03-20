-- 키워드 관리 함수 (RLS 우회)
-- 이 함수들은 SECURITY DEFINER 속성을 사용하여 RLS 정책을 우회합니다.

-- 1. 키워드 삭제 함수
CREATE OR REPLACE FUNCTION public.admin_delete_keywords(solopreneur_id_param INTEGER)
RETURNS VOID AS
$$
BEGIN
  DELETE FROM public.solopreneur_keywords
  WHERE solopreneur_id = solopreneur_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 키워드 추가 함수
CREATE OR REPLACE FUNCTION public.admin_add_keyword(solopreneur_id_param INTEGER, keyword_param TEXT)
RETURNS VOID AS
$$
BEGIN
  INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword, created_at, updated_at)
  VALUES (solopreneur_id_param, keyword_param, NOW(), NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 여러 키워드 일괄 업데이트 함수
CREATE OR REPLACE FUNCTION public.admin_update_keywords(
  solopreneur_id_param INTEGER,
  keywords_param TEXT[]
)
RETURNS TEXT[] AS
$$
DECLARE
  keyword_item TEXT;
  successful_keywords TEXT[] := '{}';
BEGIN
  -- 기존 키워드 삭제
  PERFORM public.admin_delete_keywords(solopreneur_id_param);
  
  -- 새 키워드 추가
  FOREACH keyword_item IN ARRAY keywords_param
  LOOP
    BEGIN
      PERFORM public.admin_add_keyword(solopreneur_id_param, keyword_item);
      successful_keywords := array_append(successful_keywords, keyword_item);
    EXCEPTION WHEN OTHERS THEN
      -- 특정 키워드 추가 실패 시 다음 키워드로 계속 진행
      RAISE NOTICE 'Failed to add keyword: %', keyword_item;
    END;
  END LOOP;
  
  RETURN successful_keywords;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 키워드 조회 함수
CREATE OR REPLACE FUNCTION public.admin_get_keywords(solopreneur_id_param INTEGER)
RETURNS TABLE (id INTEGER, keyword TEXT) AS
$$
BEGIN
  RETURN QUERY SELECT k.id, k.keyword 
               FROM public.solopreneur_keywords k
               WHERE k.solopreneur_id = solopreneur_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 