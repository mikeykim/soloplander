import { defineField, defineType } from 'sanity'

/**
 * 작성자 스키마 정의
 * 블로그 포스트 작성자 정보를 저장하는 문서 타입
 */
export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    // 작성자 이름
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required().error('Name is required'),
    }),
    
    // 작성자 슬러그 (URL 식별자)
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required().error('Slug is required'),
    }),
    
    // 작성자 이미지
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true, // 이미지 크롭 핫스팟 활성화
      },
    }),
    
    // 작성자 소개
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
    }),
  ],
  
  // 미리보기 설정
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
})

export default authorType 