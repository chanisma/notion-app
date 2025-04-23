import axios from 'axios'
import { db } from '../../lib/firebase-admin'

export default async function handler(req, res) {
  const { code } = req.query

  try {
    // 1. access_token 요청
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

    // 2. 사용자 정보 요청
    const userInfo = await axios.get('https://api.notion.com/v1/users/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Notion-Version': process.env.NOTION_API_VERSION,
        'Content-Type': 'application/json'
      }
    })

    const userId = userInfo.data.id
    const ref = db.ref(`users/${userId}`)
    const prev = (await ref.once('value')).val()

    // 3. Firebase 저장 - 전략 1 적용: refresh_token 있으면 업데이트, 없으면 유지
    await ref.set({
      access_token,
      workspace_id,
      refresh_token: refresh_token || prev?.refresh_token || null
    })

    res.redirect(`/api/checkOrCreateDb?user_id=${userId}`)
  } catch (err) {
    console.error('❌ OAuth 인증 실패:', JSON.stringify(err.response?.data || err.message, null, 2))
    res.status(500).send(`<h2>OAuth 인증 실패</h2><pre>${JSON.stringify(err.response?.data || err.message, null, 2)}</pre>`)
  }
}
