import {StructureBuilder} from 'sanity/desk'
import {MdSettings, MdDescription, MdPerson, MdLabel} from 'react-icons/md'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // 블로그 포스트
      S.listItem()
        .title('Blog Posts')
        .icon(MdDescription)
        .child(
          S.documentTypeList('post')
            .title('Blog Posts')
            .filter('_type == "post"')
        ),
      
      // 작성자
      S.listItem()
        .title('Authors')
        .icon(MdPerson)
        .child(
          S.documentTypeList('author')
            .title('Authors')
            .filter('_type == "author"')
        ),
      
      // 카테고리 부분 주석 처리
      /* 
      S.listItem()
        .title('Categories')
        .icon(MdLabel)
        .child(
          S.documentTypeList('category')
            .title('Categories')
            .filter('_type == "category"')
        ),
      */
      
      // 설정 부분도 필요하면 주석 처리
      /*
      S.listItem()
        .title('Site Settings')
        .icon(MdSettings)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
      */
      
      // 다른 문서 타입들을 기본 리스트로 표시
      ...S.documentTypeListItems().filter(
        listItem => !['post', 'author'].includes(listItem.getId() || '')
        // 'category', 'siteSettings' 제거
      )
    ])
