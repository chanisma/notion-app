import axios from 'axios';

export default async function handler(req, res) {
  const code = req.query.code;
  try {
    const tokenRes = await axios.post('https://api.notion.com/v1/oauth/token', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.NOTION_REDIRECT_URI
    }, {
      auth: {
        username: process.env.NOTION_CLIENT_ID,
        password: process.env.NOTION_CLIENT_SECRET
      },
      headers: { 'Content-Type': 'application/json' }
    });

    console.log("defined tokenRes", username, password, redirect_uri)

    const accessToken = tokenRes.data.access_token;
    console.log(accessToken)
    // ✅ 이 리디렉션이 없으면 화면이 멈춘 것처럼 보여요!
    res.redirect(`/api/checkOrCreateDb?access_token=${accessToken}`);
    console.log("redirect success");
  } catch (err) {
    console.error('OAuth 오류:', err.response?.data || err.message);
    res.status(500).send('OAuth 인증 실패');
  }
}
