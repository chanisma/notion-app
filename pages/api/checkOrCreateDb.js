import axios from 'axios'
import { db } from '../../lib/firebase-admin'
import { viewDB } from '../../lib/viewDB'

const TEMPLATE_DB_TITLE = 'Auto Notion Template'

async function getValidAccessToken(userId) {
  const ref = db.ref(`users/${userId}`)
  const snapshot = await ref.once('value')
  const user = snapshot.val()

  if (!user || !user.access_token) {
    throw new Error('❌ 사용자 정보 없음 또는 access_token 누락')
  }

  try {
    await axios.get('https://api.notion.com/v1/users/me', {
      headers: { Authorization: `Bearer ${user.access_token}` }
    })
    return user.access_token
  } catch {
    // 🔁 전략 2: access_token 실패 시 refresh_token 시도
    if (!user.refresh_token) {
        return res.redirect(`/reauth?user_id=${userId}`)
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

    const { access_token } = tokenRes.data
    await ref.update({ access_token }) // 🔄 새 access_token 저장
    return access_token
  }
}

export default async function handler(req, res) {
  const userId = req.query.user_id
  if (!userId) return res.status(400).send('❗ user_id 없음')

  try {
    const accessToken = await getValidAccessToken(userId)

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Notion-Version': process.env.NOTION_API_VERSION,
      'Content-Type': 'application/json'
    }

    const userRef = db.ref(`users/${userId}`)
    const snapshot = await userRef.once('value')
    const user = snapshot.val()

    let dbId = user.dbId

    if (!dbId) {
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
