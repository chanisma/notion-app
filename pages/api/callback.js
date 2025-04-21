import axios from 'axios';

export default async function handler(req, res) {
  const code = req.query.code;
  res.status(200).send("🧠 Auth route OK!");

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

    const accessToken = tokenRes.data.access_token;

    // access token을 쿼리로 넘기기 (임시)
    res.redirect(`/api/createDb?access_token=${accessToken}`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('OAuth 실패');
  }
}
