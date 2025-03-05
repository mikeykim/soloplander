import { createClient } from '@supabase/supabase-js';

// Supabase 연결 정보
const supabaseUrl = 'https://seuttskwyxmznloukxog.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXR0c2t3eXhtem5sb3VreG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjgyNjMsImV4cCI6MjA1NjY0NDI2M30.aM8fuEGJvni4RqFqWO1i9v9yhc2FdWDdIz5wJzKEDDE';

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 