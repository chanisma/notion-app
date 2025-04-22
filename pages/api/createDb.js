import axios from 'axios';

export default async function handler(req, res) {
  const token = req.query.access_token;

  try {
    // 사용자 정보 조회
    const userInfo = await axios.get('https://api.notion.com/v1/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': process.env.NOTION_API_VERSION
      }
    });

    const userId = userInfo.data.id;

    // 사용자 계정에 DB 생성
    const dbRes = await axios.post('https://api.notion.com/v1/databases', {
      parent: { type: 'user_id', user_id: userId },
      title: [{ type: 'text', text: { content: 'My Vercel Notion DB' } }],
      properties: {
        Name: { title: {} },
        Tag: {
          multi_select: {
            options: [
              { name: 'Work', color: 'blue' },
              { name: 'Study', color: 'green' }
            ]
          }
        },
        Done: { checkbox: {} }
      }
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': process.env.NOTION_API_VERSION,
        'Content-Type': 'application/json'
      }
    });

    const dbId = dbRes.data.id;

    // DB 생성 성공 후 view 페이지로 이동 (쿼리로 db id와 토큰 전달)
    res.redirect(`/api/viewDb?db=${dbId}&access_token=${token}`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("❌ DB 생성 실패");
  }
}
