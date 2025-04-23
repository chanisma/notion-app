import axios from 'axios'
import { db } from '../../lib/firebase-admin'
import { access } from 'fs'

export default async function handler(req, res) {
  const { code } = req.query

  try {
    // OAuth 코드로 access_token 요청
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

    const { access_token, refresh_token, workspace_id } = tokenRes.data

    console.log('✅ Access Token:', access_token)

    // 사용자 정보 조회
    const userInfo = await axios.get('https://api.notion.com/v1/users/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    })

    const userId = userInfo.data.id

    // Firebase 저장
    await db.ref(`users/${userId}`).set({
      access_token,
      refresh_token,
      workspace_id
    })

    res.redirect(`/api/checkOrCreateDb?user_id=${userId}`)

  } catch (err) {
    console.error('❌ OAuth 인증 실패:', JSON.stringify(err.response?.data || err.message, null, 2))
    res.status(500).send(`<h2>OAuth 인증 실패</h2><pre>${JSON.stringify(err.response?.data || err.message)}</pre>`)
  }
}
