require('dotenv').config();

console.log('===== 환경 변수 확인 =====');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || '(설정되지 않음)');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '(설정됨)' : '(설정되지 않음)');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '(설정됨)' : '(설정되지 않음)');

// Next.js 앱에서 사용하는 환경 값은 API 요청을 했을 때 확인 가능
console.log('\n===== 테스트 방법 =====');
console.log('1. npm run dev를 실행하여 개발 서버 시작');
console.log('2. 브라우저에서 http://localhost:3000/api/solopreneurs 접속');
console.log('3. 응답 확인');

// .env.local 파일이 우선적으로 사용됨을 알려줌
console.log('\n===== 참고 사항 =====');
console.log('Next.js는 .env 파일보다 .env.local 파일을 우선적으로 사용합니다.');
console.log('.env.local 파일에 올바른 환경 변수 값이 설정되어 있는지 확인하세요.');
console.log('Supabase 대시보드에서 최신 API 키를 확인하세요.'); 