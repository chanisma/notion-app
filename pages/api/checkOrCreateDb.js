import axios from 'axios'
import { db } from '../../lib/firebase-admin'
import { viewDB } from '../../lib/viewDB'

const TEMPLATE_DB_TITLE = 'Auto Notion Template'

/**
 * ✅ 해결 방법 2: 내부에서 redirect 하지 않고, 
 * access_token 또는 null만 반환
 */
async function getValidAccessToken(userId, user) {
  try {
    await axios.get('https://api.notion.com/v1/users/me', {
      headers: { Authorization: `Bearer ${user.access_token}` }
    })
    return user.access_token
  } catch {
    if (!user.refresh_token) {
      return null
    }

    const tokenRes = await axios.post('https://api.notion.com/v1/oauth/token', {
      grant_type: 'refresh_token',
      refresh_token: user.refresh_token
    }, {
      auth: {
        username: process.env.NOTION_CLIENT_ID,
        password: process.env.NOTION_CLIENT_SECRET
      },
      headers: { 'Content-Type': 'application/json' }
    })

    const access_token = tokenRes.data.access_token
    await db.ref(`users/${userId}`).update({ access_token })
    return access_token
  }
}

export default async function handler(req, res) {
  const userId = req.query.user_id
  if (!userId) return res.status(400).send('❗ user_id 없음')

  try {
    const userRef = db.ref(`users/${userId}`)
    const snapshot = await userRef.once('value')
    const user = snapshot.val()

    if (!user || !user.access_token) {
      return res.redirect(`/reauth?reason=missing_token`)
    }

    const accessToken = await getValidAccessToken(userId, user)

    if (!accessToken) {
      return res.redirect(`/reauth?reason=expired_or_no_refresh`)
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Notion-Version': process.env.NOTION_API_VERSION,
      'Content-Type': 'application/json'
    }

    let dbId = user.dbId

    if (!dbId) {
      // 복제된 템플릿 DB 검색
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

      if (!matched) throw new Error('❌ 복제된 템플릿 DB를 찾을 수 없음')

      dbId = matched.id
      await userRef.update({ dbId })
    }

    const html = await viewDB(dbId, headers)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)

  } catch (err) {
    console.error('❌ 사용자별 DB 처리 중 오류:', err.response?.data || err.message)
    res.status(500).send(`<h2>오류</h2><pre>${JSON.stringify(err.response?.data || err.message, null, 2)}</pre>`)
  }
}
