import axios from 'axios';

export default async function handler(req, res) {
  const token = req.query.access_token;

  const headers = {
    Authorization: `Bearer ${token}`,
    'Notion-Version': process.env.NOTION_API_VERSION,
    'Content-Type': 'application/json',
  };

  try {
    // STEP 1: 현재 사용자의 DB 목록 중 이름으로 검색
    const searchRes = await axios.post(
      'https://api.notion.com/v1/search',
      {
        filter: {
          property: 'object',
          value: 'database'
        },
        page_size: 10 // 혹시 같은 이름이 많은 경우 대비
      },
      { headers }
    );

    const dbList = searchRes.data.results;
    const existingDb = dbList.find(db =>
      db.object === 'database' &&
      db.title?.[0]?.plain_text === 'My Vercel Notion DB'
    );

    let dbId = '';

    if (existingDb) {
      dbId = existingDb.id;
      console.log(`✅ 기존 DB 발견: ${dbId}`);
    } else {
      // STEP 2: 없으면 DB 생성
      const userInfo = await axios.get('https://api.notion.com/v1/users/me', { headers });
      const userId = userInfo.data.id;

      const dbRes = await axios.post(
        'https://api.notion.com/v1/databases',
        {
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
        },
        { headers }
      );

      dbId = dbRes.data.id;
      console.log(`📦 새 DB 생성: ${dbId}`);
    }

    // STEP 3: DB 내용 조회
    const queryRes = await axios.post(
      `https://api.notion.com/v1/databases/${dbId}/query`,
      {},
      { headers }
    );

    const items = queryRes.data.results;

    const rows = items.map((item) => {
      const props = item.properties;
      const name = props.Name?.title?.[0]?.plain_text || '(no title)';
      const tags = props.Tag?.multi_select?.map(t => t.name).join(', ') || '';
      const done = props.Done?.checkbox ? '✅' : '❌';
      return `<li><strong>${name}</strong> [${tags}] - ${done}</li>`;
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <h2>📄 Notion Database 항목</h2>
      <ul>${rows.join('')}</ul>
    `);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("❌ DB 확인 또는 생성 중 오류 발생");
  }
}
