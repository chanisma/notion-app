import axios from 'axios'
import { db } from '../../lib/firebase-admin'

export default async function handler(req, res) {
  const token = req.query.access_token
  if (!token) return res.status(400).send('❗ access_token 없음')

  const headers = {
    Authorization: `Bearer ${token}`,
    'Notion-Version': process.env.NOTION_API_VERSION,
    'Content-Type': 'application/json'
  }

  const TEMPLATE_PAGE_TITLE = 'Auto Notion Template' // ⬅️ 여기 하드코딩됨

  try {
    // 사용자 정보 조회
    const userRes = await axios.get('https://api.notion.com/v1/users/me', { headers })
    const userId = userRes.data.id

    // Firebase에서 사용자 기록 확인
    const ref = db.ref(`users/${userId}`)
    const snapshot = await ref.once('value')

    let dbId

    if (snapshot.exists()) {
      dbId = snapshot.val().dbId
    } else {
      // 복제된 템플릿 페이지 검색
      const searchRes = await axios.post('https://api.notion.com/v1/search', {
        query: TEMPLATE_PAGE_TITLE,
        sort: { direction: 'descending', timestamp: 'last_edited_time' },
        filter: { value: 'page', property: 'object' }
      }, { headers })

      const matched = searchRes.data.results.find(page =>
        page.object === 'page' &&
        page.parent?.type === 'workspace' &&
        page.properties?.title?.[0]?.plain_text === TEMPLATE_PAGE_TITLE
      )

      if (!matched) throw new Error('❌ 복제된 템플릿 페이지를 찾을 수 없음')

      const pageId = matched.id

      // 해당 페이지에 새 DB 생성
      const dbRes = await axios.post('https://api.notion.com/v1/databases', {
        parent: { page_id: pageId },
        title: [{ type: 'text', text: { content: 'My Auto DB' } }],
        properties: {
          Name: { title: {} },
          Tag: {
            multi_select: {
              options: [
                { name: 'Work', color: 'blue' },
                { name: 'Study', color: 'green' }
              ]
            }
          },
          Done: { checkbox: {} }
        }
      }, { headers })

      dbId = dbRes.data.id

      // Firebase에 저장
      await ref.set({ dbId })
    }

    // DB 내용 출력
    const queryRes = await axios.post(
      `https://api.notion.com/v1/databases/${dbId}/query`,
      {},
      { headers }
    )

    const rows = queryRes.data.results.map(item => {
      const name = item.properties.Name?.title?.[0]?.plain_text || '(no title)'
      const tags = item.properties.Tag?.multi_select?.map(t => t.name).join(', ') || ''
      const done = item.properties.Done?.checkbox ? '✅' : '❌'
      return `<li><strong>${name}</strong> [${tags}] - ${done}</li>`
    })

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(`<h2>📋 사용자 Notion DB 항목</h2><ul>${rows.join('')}</ul>`)

  } catch (err) {
    console.error('❌ 사용자별 DB 처리 중 오류:', err.response?.data || err.message)
    res.status(500).send('❌ 사용자별 DB 처리 중 오류 발생')
  }
}
