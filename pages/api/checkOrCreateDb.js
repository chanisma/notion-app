import axios from 'axios'
import { db } from '../../lib/firebase-admin'
import { viewDB } from '../../lib/viewDB'

export default async function handler(req, res) {
  const token = req.query.access_token
  if (!token) return res.status(400).send('❗ access_token 없음')

  const headers = {
    Authorization: `Bearer ${token}`,
    'Notion-Version': process.env.NOTION_API_VERSION,
    'Content-Type': 'application/json'
  }

  const TEMPLATE_DB_TITLE = 'Auto Notion Template' // 복제된 템플릿 DB 이름

  try {
    // 사용자 정보 조회
    const userRes = await axios.get('https://api.notion.com/v1/users/me', { headers })
    const userId = userRes.data.id

    // Firebase 확인
    const ref = db.ref(`users/${userId}`)
    const snapshot = await ref.once('value')

    let dbId

    if (snapshot.exists()) {
      dbId = snapshot.val().dbId
    } else {
      // ✅ 복제된 템플릿 DB 검색
      const searchRes = await axios.post('https://api.notion.com/v1/search', {
        query: TEMPLATE_DB_TITLE,
        sort: { direction: 'descending', timestamp: 'last_edited_time' },
        filter: { value: 'database', property: 'object' }
      }, { headers })

      const matched = searchRes.data.results.find(db =>
        db.object === 'database' &&
        (
          db.title?.[0]?.plain_text === TEMPLATE_DB_TITLE ||  // 안전하게
          db.properties?.title?.[0]?.plain_text === TEMPLATE_DB_TITLE
        )
      )

      if (!matched) throw new Error('❌ 복제된 템플릿 DB를 찾을 수 없음')

      dbId = matched.id

      // ✅ Firebase에 저장
      await ref.set({ dbId })
    }

    //viewDB로 출력
    const html = await viewDB(dbId, headers)

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)

  } catch (err) {
    console.error('❌ 사용자별 DB 처리 중 오류:', err.response?.data || err.message)
    res.status(500).send('❌ 사용자별 DB 처리 중 오류 발생')
  }
}
