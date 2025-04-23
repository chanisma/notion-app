import axios from 'axios'
import { db } from '../../lib/firebase-admin'
import { viewDB } from '../../lib/viewDB'

const TEMPLATE_DB_TITLE = 'Auto Notion Template'

/** ✅ access_token 유효성 검사 + 만료 시 자동 refresh */
async function getValidAccessToken(userId) {
  const ref = db.ref(`users/${userId}`)
  const snapshot = await ref.once('value')
  const user = snapshot.val()
  if (!user) throw new Error('❌ 사용자 정보 없음')

  try {
    // 현재 access_token이 유효한지 확인
    await axios.get('https://api.notion.com/v1/users/me', {
      headers: { Authorization: `Bearer ${user.access_token}` }
    })
    return user.access_token
  } catch {
    // 만료된 경우 refresh_token으로 새 access_token 발급
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
    await ref.update({ access_token }) // 새 토큰 저장
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
      // ✅ 사용자의 워크스페이스에서 복제된 템플릿 DB 검색
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

      // ✅ Firebase에 dbId 저장
      await userRef.update({ dbId })
    }

    // ✅ DB 조회 후 HTML 렌더링
    const html = await viewDB(dbId, headers)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)

  } catch (err) {
    console.error('❌ 사용자별 DB 처리 중 오류:', err.response?.data || err.message)
    res.status(500).send('❌ 사용자별 DB 처리 중 오류 발생')
  }
}
