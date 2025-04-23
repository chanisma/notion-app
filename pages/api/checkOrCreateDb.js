import axios from 'axios'
import { db } from '../../lib/firebase-admin'
import { viewDB } from '../../lib/viewDB'

async function getValidAccessToken(userId) {
  const ref = db.ref(`users/${userId}`)
  const snapshot = await ref.once('value')
  const user = snapshot.val()

  if (!user) throw new Error('❌ 사용자 정보 없음')

  try {
    // 토큰 유효성 테스트
    await axios.get('https://api.notion.com/v1/users/me', {
      headers: { Authorization: `Bearer ${user.access_token}` }
    })
    return user.access_token
  } catch {
    // access_token 만료 → refresh_token 사용
    const tokenRes = await axios.post('https://api.notion.com/v1/oauth/token', {
      grant_type: 'refresh_token',
      refresh_token: user.refresh_token
    }, {
      auth: {
        username: process.env.NOTION_CLIENT_ID,
        password: process.env.NOTION_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const { access_token } = tokenRes.data
    await ref.update({ access_token })
    return access_token
  }
}

export default async function handler(req, res) {
  const userId = req.query.user_id
  if (!userId) return res.status(400).send('❗ user_id 없음')

  try {
    const token = await getValidAccessToken(userId)

    const headers = {
      Authorization: `Bearer ${token}`,
      'Notion-Version': process.env.NOTION_API_VERSION,
      'Content-Type': 'application/json'
    }

    // 이후 기존 로직: search → db 찾기/생성 → viewDB()
    const html = await viewDB(/* dbId */, headers) // 생략한 DB ID 가져오는 로직 포함

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)

  } catch (err) {
    console.error('❌ 사용자별 DB 처리 중 오류:', err.response?.data || err.message)
    res.status(500).send('❌ 사용자별 DB 처리 중 오류 발생')
  }
}
