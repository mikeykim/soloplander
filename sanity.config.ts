'use client'

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `\app\sanity\[[...tool]]\page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {deskTool} from 'sanity/desk'
import {media} from 'sanity-plugin-media'
import {vercelDeployTool} from 'sanity-plugin-vercel-deploy'
import {schemaTypes} from './sanity/schemas'
import {structure} from './sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './sanity/env'
import {schema} from './sanity/schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'SolopLander Blog',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema: {
    types: schemaTypes,
  },
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool(),
    media(),
    vercelDeployTool()
  ],
})
