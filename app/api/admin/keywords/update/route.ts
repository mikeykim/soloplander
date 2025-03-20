import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { supabase, serviceSupabase } from '@/utils/supabase';

// 환경 변수 로깅 (디버깅 용도)
console.log('환경 변수 확인:');
console.log('NEXT_PUBLIC_SUPABASE_URL 설정됨:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_KEY 설정됨:', !!process.env.SUPABASE_SERVICE_KEY);

// 관리자 비밀번호 확인
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

// 키워드 업데이트 스크립트 실행 함수
const execPromise = promisify(exec);

async function runKeywordUpdateScript(solopreneurId: number, keywords: string[]) {
  try {
    // 직접 스크립트 모듈 가져오기 시도
    let updateModule;
    try {
      // 상대 경로로 모듈 임포트 시도
      const modulePath = path.join(process.cwd(), 'scripts', 'admin-update-keywords.js');
      if (fs.existsSync(modulePath)) {
        // NodeJS require는 CommonJS만 지원하므로 dynamic import 사용
        updateModule = require(modulePath);
      }
    } catch (importError) {
      console.error('모듈 임포트 오류:', importError);
    }
    
    // 모듈이 있으면 직접 함수 호출
    if (updateModule?.updateKeywords) {
      console.log('모듈 함수를 직접 호출합니다...');
      return await updateModule.updateKeywords(solopreneurId, keywords);
    }
    
    // 모듈을 가져올 수 없을 경우 프로세스 실행으로 대체
    console.log('외부 프로세스로 스크립트를 실행합니다...');
    
    // 임시 파일에 키워드 저장
    const tempFile = path.join(process.cwd(), 'temp', `keywords-${solopreneurId}-${Date.now()}.json`);
    const tempDir = path.dirname(tempFile);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(tempFile, JSON.stringify({
      solopreneur_id: solopreneurId,
      keywords
    }));
    
    // 스크립트 실행
    const scriptPath = path.join(process.cwd(), 'scripts', 'admin-update-keywords.js');
    const { stdout, stderr } = await execPromise(`node ${scriptPath} --file=${tempFile}`);
    
    console.log('스크립트 출력:', stdout);
    if (stderr) {
      console.error('스크립트 오류:', stderr);
    }
    
    // 응답 확인
    try {
      if (fs.existsSync(`${tempFile}.result`)) {
        const resultContent = fs.readFileSync(`${tempFile}.result`, 'utf8');
        const result = JSON.parse(resultContent);
        
        // 임시 파일 삭제
        fs.unlinkSync(tempFile);
        fs.unlinkSync(`${tempFile}.result`);
        
        return result;
      }
    } catch (readError) {
      console.error('결과 파일 읽기 오류:', readError);
    }
    
    // 스크립트 출력 파싱
    if (stdout && stdout.includes('success')) {
      // 출력에서 키워드 추출 시도
      const keywordMatch = stdout.match(/업데이트된 키워드:\s*\[(.*?)\]/);
      const extractedKeywords = keywordMatch ? 
        keywordMatch[1].split(',').map(k => k.trim().replace(/'/g, '')) : 
        keywords;
      
      return {
        success: true,
        keywords: extractedKeywords
      };
    }
    
    // 실패 시 원본 키워드 반환
    return {
      success: false,
      error: stderr || '알 수 없는 오류',
      keywords
    };
    
  } catch (error) {
    console.error('스크립트 실행 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      keywords
    };
  }
}

export async function POST(request: NextRequest) {
  console.log('관리자 키워드 업데이트 API 호출됨');
  
  // 인증 확인
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.replace('Bearer ', '') !== ADMIN_PASSWORD) {
    console.log('인증 실패');
    return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  }
  
  try {
    // 요청 데이터 파싱
    const body = await request.json();
    const { solopreneur_id, keywords } = body;
    
    if (!solopreneur_id || !Array.isArray(keywords)) {
      console.log('잘못된 요청 형식:', body);
      return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 });
    }
    
    console.log(`솔로프리너 ID ${solopreneur_id}의 키워드 업데이트 요청:`, keywords);
    
    // 키워드 업데이트 스크립트 실행
    const result = await runKeywordUpdateScript(solopreneur_id, keywords);
    
    if (!result.success) {
      console.error('키워드 업데이트 실패:', result.error);
      
      // 데이터베이스 직접 접근 시도
      console.log('데이터베이스 직접 업데이트 시도 중...');
      
      // 유효한 키워드만 필터링
      const validKeywords = keywords
        .map(k => typeof k === 'string' ? k.trim() : String(k).trim())
        .filter(k => k.length > 0);
      
      // 중복 제거
      const uniqueKeywords = [...new Set(validKeywords)];
      
      // 1. 기존 키워드 삭제
      const { error: deleteError } = await serviceSupabase
        .from('solopreneur_keywords')
        .delete()
        .eq('solopreneur_id', solopreneur_id);
      
      if (deleteError) {
        console.error('키워드 삭제 오류:', deleteError);
        return NextResponse.json({ 
          error: '키워드 삭제 오류', 
          details: deleteError.message,
          success: false
        }, { status: 500 });
      }
      
      console.log('기존 키워드 삭제 성공');
      
      // 2. 새 키워드 추가
      if (uniqueKeywords.length > 0) {
        const keywordInserts = uniqueKeywords.map(keyword => ({
          solopreneur_id,
          keyword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { error: insertError } = await serviceSupabase
          .from('solopreneur_keywords')
          .insert(keywordInserts);
        
        if (insertError) {
          console.error('키워드 추가 오류:', insertError);
          return NextResponse.json({ 
            error: '키워드 추가 오류', 
            details: insertError.message,
            success: false,
            keywords: uniqueKeywords  // 실패해도 처리된 키워드 반환
          }, { status: 500 });
        }
        
        console.log('새 키워드 추가 성공');
      }
      
      // 3. 업데이트된 키워드 확인
      const { data: updatedKeywords, error: selectError } = await serviceSupabase
        .from('solopreneur_keywords')
        .select('keyword')
        .eq('solopreneur_id', solopreneur_id);
      
      return NextResponse.json({
        success: !selectError,
        message: selectError ? '키워드 확인 오류' : '키워드가 성공적으로 업데이트되었습니다',
        keywords: updatedKeywords?.map(k => k.keyword) || uniqueKeywords
      });
    }
    
    // 스크립트 실행 성공 결과 반환
    return NextResponse.json({
      success: true,
      message: '키워드가 성공적으로 업데이트되었습니다',
      keywords: result.keywords
    });
    
  } catch (error) {
    console.error('키워드 업데이트 중 오류:', error);
    return NextResponse.json({ 
      error: '서버 오류', 
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      success: false
    }, { status: 500 });
  }
} 