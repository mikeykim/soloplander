import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {media} from 'sanity-plugin-media'
import {vercelDeployTool} from 'sanity-plugin-vercel-deploy'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'SolopLander Blog',

  // 환경 변수 대신 직접 값을 입력
  projectId: 'eqkm480h',
  dataset: 'production',

  plugins: [
    deskTool({structure}),
    visionTool(),
    media(),
    vercelDeployTool()
  ],

  schema: {
    types: schemaTypes,
  },

  studio: {
    components: {
      // 커스텀 컴포넌트가 있다면 여기에 추가
    }
  }
})