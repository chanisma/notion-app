import axios from 'axios';

export default async function handler(req, res) {
  const dbId = req.query.db;
  const token = req.query.access_token;

  try {
    const queryRes = await axios.post(
      `https://api.notion.com/v1/databases/${dbId}/query`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': process.env.NOTION_API_VERSION,
          'Content-Type': 'application/json'
        }
      }
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
    res.status(500).send("❌ DB 조회 실패");
  }
}
