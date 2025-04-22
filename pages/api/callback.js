import axios from 'axios';

export default async function handler(req, res) {
  const code = req.query.code;

  try {
    if (!code) {
      return res.status(400).send("❗ code가 없습니다");
    }

    const response = await axios.post('https://api.notion.com/v1/oauth/token', {
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
    });

    const accessToken = response.data.access_token;

    // 로그 찍기
    console.log('✅ Access token:', accessToken);

    res.redirect(`/api/checkOrCreateDb?access_token=${accessToken}`);
  } catch (err) {
    console.error('❌ OAuth 인증 실패:', err.response?.data || err.message);
    res.status(500).send("OAuth 인증 실패");
  }
}
