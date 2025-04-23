import axios from 'axios'
import { db } from '../../lib/firebase-admin'

export default async function handler(req, res) {
  const { code } = req.query
  if (!code) return res.status(400).send('❗ code 없음')

  try {
    // 1. access_token 발급
    const tokenRes = await axios.post('https://api.notion.com/v1/oauth/token', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.NOTION_REDIRECT_URI
    }, {
      auth: {
        username: process.env.NOTION_CLIENT_ID,
        password: process.env.NOTION_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const { access_token, workspace_id } = tokenRes.data

    // 2. 사용자 정보 가져오기
    const userInfo = await axios.get('https://api.notion.com/v1/users/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Notion-Version': process.env.NOTION_API_VERSION,
        'Content-Type': 'application/json'
      }
    })

    const userId = userInfo.data.id

    // 3. Firebase에 사용자 저장
    await db.ref(`users/${userId}`).set({
      access_token,
      workspace_id
      // refresh_token 없음: 현재 구조에서는 저장 안 함
    })

    // 4. 사용자 DB 확인/출력 페이지로 이동
    res.redirect(`/api/checkOrCreateDb?user_id=${userId}`)

  } catch (err) {
    console.error('❌ OAuth 인증 실패:', err.response?.data || err.message)
    res.status(500).send(`<h2>OAuth 인증 실패</h2><pre>${JSON.stringify(err.response?.data || err.message, null, 2)}</pre>`)
  }
}
