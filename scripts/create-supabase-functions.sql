-- 키워드 삭제 함수 생성
CREATE OR REPLACE FUNCTION admin_delete_keywords(p_solopreneur_id INTEGER)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM solopreneur_keywords
  WHERE solopreneur_id = p_solopreneur_id;
END;
$$ LANGUAGE plpgsql;

-- 키워드 추가 함수 생성
CREATE OR REPLACE FUNCTION admin_insert_keyword(p_solopreneur_id INTEGER, p_keyword TEXT)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO solopreneur_keywords (solopreneur_id, keyword)
  VALUES (p_solopreneur_id, p_keyword);
END;
$$ LANGUAGE plpgsql;

-- 키워드 일괄 업데이트 함수 생성
CREATE OR REPLACE FUNCTION admin_update_keywords(p_solopreneur_id INTEGER, p_keywords TEXT[])
RETURNS TEXT[]
SECURITY DEFINER
AS $$
DECLARE
  v_keyword TEXT;
  v_result TEXT[];
BEGIN
  -- 기존 키워드 삭제
  DELETE FROM solopreneur_keywords
  WHERE solopreneur_id = p_solopreneur_id;
  
  -- 새 키워드 추가
  FOREACH v_keyword IN ARRAY p_keywords
  LOOP
    IF LENGTH(TRIM(v_keyword)) > 0 THEN
      INSERT INTO solopreneur_keywords (solopreneur_id, keyword)
      VALUES (p_solopreneur_id, TRIM(v_keyword));
      v_result := array_append(v_result, TRIM(v_keyword));
    END IF;
  END LOOP;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql; 