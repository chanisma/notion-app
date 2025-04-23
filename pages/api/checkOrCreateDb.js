import axios from 'axios'
import { db } from '../../lib/firebase-admin'
import { viewDB } from '../../lib/viewDB'

const TEMPLATE_DB_TITLE = 'Auto Notion Template'

export default async function handler(req, res) {
  const userId = req.query.user_id
  if (!userId) return res.status(400).send('❗ user_id 없음')

  try {
    const userRef = db.ref(`users/${userId}`)
    const snapshot = await userRef.once('value')
    const user = snapshot.val()

    if (!user || !user.access_token) {
      return res.status(401).send('❗ 인증되지 않은 사용자')
    }

    const accessToken = user.access_token

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Notion-Version': process.env.NOTION_API_VERSION,
      'Content-Type': 'application/json'
    }

    // ✅ 이미 Firebase에 dbId가 있다면 바로 사용
    if (user.dbId) {
      const html = await viewDB(user.dbId, headers)
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.send(html)
    }

    // ❌ 없을 경우 템플릿 DB 검색
    const searchRes = await axios.post('https://api.notion.com/v1/search', {
      query: TEMPLATE_DB_TITLE,
      sort: { direction: 'descending', timestamp: 'last_edited_time' },
      filter: { value: 'database', property: 'object' }
    }, { headers })

    const matched = searchRes.data.results.find(db =>
      db.object === 'database' &&
      (
        db.title?.[0]?.plain_text === TEMPLATE_DB_TITLE ||
        db.properties?.title?.[0]?.plain_text === TEMPLATE_DB_TITLE
      )
    )

    if (!matched) throw new Error('❌ 템플릿 DB를 찾을 수 없음')

    const dbId = matched.id
    await userRef.update({ dbId })

    const html = await viewDB(dbId, headers)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)

  } catch (err) {
    console.error('❌ 사용자별 DB 처리 중 오류:', err.response?.data || err.message)
    res.status(500).send(`<h2>오류</h2><pre>${JSON.stringify(err.response?.data || err.message, null, 2)}</pre>`)
  }
}
