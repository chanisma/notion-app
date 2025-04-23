import axios from 'axios'

export default async function handler(req, res) {
  const code = req.query.code
  const redirectUri = process.env.NOTION_REDIRECT_URI
  const clientId = process.env.NOTION_CLIENT_ID
  const clientSecret = process.env.NOTION_CLIENT_SECRET

  // 값 누락 시 방어
  if (!code || !redirectUri || !clientId || !clientSecret) {
    console.error('❌ OAuth 환경변수 누락')
    return res.status(500).send('❌ 환경변수가 누락되었습니다. (.env에서 확인)')
  }

  try {
    // OAuth 코드로 access_token 요청
    const tokenRes = await axios.post('https://api.notion.com/v1/oauth/token', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    }, {
      auth: {
        username: clientId,
        password: clientSecret
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const accessToken = tokenRes.data.access_token

    console.log('✅ Access Token:', accessToken)

    // access_token을 클라이언트에 전달 (redirect 방식)
    res.redirect(`/api/checkOrCreateDb?access_token=${accessToken}`)

    // 또는 아래처럼 accessToken 바로 출력하고 싶다면:
    // res.status(200).send(`Access Token: ${accessToken}`)

  } catch (err) {
    console.error('❌ OAuth 인증 실패:', JSON.stringify(err.response?.data || err.message, null, 2))
    res.status(500).send(`인증 실패: ${JSON.stringify(err.response?.data || err.message)}`)
  }
}
