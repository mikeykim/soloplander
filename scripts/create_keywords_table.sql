-- solopreneur_keywords 테이블 생성
CREATE TABLE IF NOT EXISTS public.solopreneur_keywords (
  id SERIAL PRIMARY KEY,
  solopreneur_id INTEGER NOT NULL REFERENCES public.solopreneurs(id) ON DELETE CASCADE,
  keyword VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_solopreneur_keywords_solopreneur_id ON public.solopreneur_keywords(solopreneur_id);
CREATE INDEX IF NOT EXISTS idx_solopreneur_keywords_keyword ON public.solopreneur_keywords(keyword);

-- RLS(Row Level Security) 설정
ALTER TABLE public.solopreneur_keywords ENABLE ROW LEVEL SECURITY;

-- 익명 사용자 정책 (읽기 전용)
CREATE POLICY "익명 사용자는 모든 키워드를 볼 수 있음" ON public.solopreneur_keywords
  FOR SELECT USING (true);

-- 초기 데이터 입력을 위한 함수 (먼저 solopreneurs 테이블의 ID를 확인해야 함)
-- Alex Hormozi (ID 확인 필요)
INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'business' FROM public.solopreneurs WHERE name = 'Alex Hormozi'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'marketing' FROM public.solopreneurs WHERE name = 'Alex Hormozi'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'content' FROM public.solopreneurs WHERE name = 'Alex Hormozi'
ON CONFLICT DO NOTHING;

-- Pat Walls
INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'business' FROM public.solopreneurs WHERE name = 'Pat Walls'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'content' FROM public.solopreneurs WHERE name = 'Pat Walls'
ON CONFLICT DO NOTHING;

-- Pieter Levels
INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'tech' FROM public.solopreneurs WHERE name = 'Pieter Levels'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'development' FROM public.solopreneurs WHERE name = 'Pieter Levels'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'business' FROM public.solopreneurs WHERE name = 'Pieter Levels'
ON CONFLICT DO NOTHING;

-- Marc Lou
INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'tech' FROM public.solopreneurs WHERE name = 'Marc Lou'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'development' FROM public.solopreneurs WHERE name = 'Marc Lou'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'business' FROM public.solopreneurs WHERE name = 'Marc Lou'
ON CONFLICT DO NOTHING;

-- Richard Lim
INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'data' FROM public.solopreneurs WHERE name = 'Richard Lim'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'ai' FROM public.solopreneurs WHERE name = 'Richard Lim'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'education' FROM public.solopreneurs WHERE name = 'Richard Lim'
ON CONFLICT DO NOTHING;

-- Ben AI
INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'ai' FROM public.solopreneurs WHERE name = 'Ben AI'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'tech' FROM public.solopreneurs WHERE name = 'Ben AI'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'content' FROM public.solopreneurs WHERE name = 'Ben AI'
ON CONFLICT DO NOTHING;

-- Timo Nikolai
INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'ai' FROM public.solopreneurs WHERE name = 'Timo Nikolai'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'marketing' FROM public.solopreneurs WHERE name = 'Timo Nikolai'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'tech' FROM public.solopreneurs WHERE name = 'Timo Nikolai'
ON CONFLICT DO NOTHING;

-- David Ondrej
INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'ai' FROM public.solopreneurs WHERE name = 'David Ondrej'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'tech' FROM public.solopreneurs WHERE name = 'David Ondrej'
ON CONFLICT DO NOTHING;

INSERT INTO public.solopreneur_keywords (solopreneur_id, keyword)
SELECT id, 'development' FROM public.solopreneurs WHERE name = 'David Ondrej'
ON CONFLICT DO NOTHING; 