import axios from 'axios';

export default async function handler(req, res) {
  const token = req.query.access_token;

  const headers = {
    Authorization: `Bearer ${token}`,
    'Notion-Version': process.env.NOTION_API_VERSION,
    'Content-Type': 'application/json',
  };

  try {
    console.log('🔍 STEP 1: Notion DB 검색 시작');

    const searchRes = await axios.post('https://api.notion.com/v1/search', {
      filter: {
        property: 'object',
        value: 'database'
      },
      page_size: 10
    }, { headers });

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
      console.log('📦 DB 없음 → 생성 시작');

      const userInfo = await axios.get('https://api.notion.com/v1/users/me', { headers });
      const userId = userInfo.data.id;

      const dbRes = await axios.post('https://api.notion.com/v1/databases', {
        parent: {
            type: 'page_id',
            page_id: '1db31746bed980648e93c4d8eb346743' // ✅ 여기 너의 Notion 페이지 ID
        },
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
     }, { headers });


      dbId = dbRes.data.id;
      console.log(`✅ 새 DB 생성 완료: ${dbId}`);
    }

    // DB 내용 조회
    console.log('📄 DB 내용 조회 시작');
    const queryRes = await axios.post(
      `https://api.notion.com/v1/databases/${dbId}/query`,
      {},
      { headers }
    );

    const rows = queryRes.data.results.map((item) => {
      const props = item.properties;
      const name = props.Name?.title?.[0]?.plain_text || '(no title)';
      const tags = props.Tag?.multi_select?.map(t => t.name).join(', ') || '';
      const done = props.Done?.checkbox ? '✅' : '❌';
      return `<li><strong>${name}</strong> [${tags}] - ${done}</li>`;
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(`<h2>📄 Notion DB 항목</h2><ul>${rows.join('')}</ul>`);
  } catch (err) {
    console.error('❌ checkOrCreateDb 에러:', err.response?.data || err.message);
    res.status(500).send("❌ DB 확인 또는 생성 중 오류 발생");
  }
}
