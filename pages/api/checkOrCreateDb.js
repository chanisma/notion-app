import axios from 'axios'

const META_DB_ID = '1dd31746bed980c59dbbdb862e115597' // 예: 'abcdef1234567890abcdef1234567890'

console.log('🔍 Meta DB 저장 요청 전');
console.log('🧾 META_DB_ID:', META_DB_ID);
console.log('🧑‍🎓 userId:', userId);
console.log('📄 dbId:', dbId);

export default async function handler(req, res) {
  const token = req.query.access_token

  if (!token) {
    return res.status(400).send("❗ access_token 없음")
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Notion-Version': process.env.NOTION_API_VERSION,
    'Content-Type': 'application/json'
  }

  try {
    // 사용자 정보 조회
    const userRes = await axios.get('https://api.notion.com/v1/users/me', { headers })
    const userId = userRes.data.id

    // meta DB에서 user_id 검색
    const metaQuery = await axios.post(
      `https://api.notion.com/v1/databases/${META_DB_ID}/query`,
      {
        filter: {
          property: 'UserId',
          rich_text: {
            equals: userId
          }
        }
      },
      { headers }
    )

    let dbId = null

    if (metaQuery.data.results.length > 0) {
      // 기존 DB ID 사용
      dbId = metaQuery.data.results[0].properties.DbId.rich_text[0].plain_text
    } else {
      // 새 페이지 생성
      const pageRes = await axios.post('https://api.notion.com/v1/pages', {
        parent: { type: 'user_id', user_id: userId },
        properties: {}
      }, { headers })

      const pageId = pageRes.data.id

      // 새 DB 생성
      const dbRes = await axios.post('https://api.notion.com/v1/databases', {
        parent: { type: 'page_id', page_id: pageId },
        title: [{ type: 'text', text: { content: 'My Auto Notion DB' } }],
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
      }, { headers })

      dbId = dbRes.data.id

      // meta DB에 user_id → db_id 저장
      await axios.post('https://api.notion.com/v1/pages', {
        parent: {
          database_id: META_DB_ID
        },
        properties: {
          UserId: {
            rich_text: [{ type: 'text', text: { content: userId } }]
          },
          DbId: {
            rich_text: [{ type: 'text', text: { content: dbId } }]
          }
        }
      }, { headers })
    }

    // DB 내용 조회
    const queryRes = await axios.post(
      `https://api.notion.com/v1/databases/${dbId}/query`,
      {},
      { headers }
    )

    const rows = queryRes.data.results.map((item) => {
      const props = item.properties
      const name = props.Name?.title?.[0]?.plain_text || '(no title)'
      const tags = props.Tag?.multi_select?.map(t => t.name).join(', ') || ''
      const done = props.Done?.checkbox ? '✅' : '❌'
      return `<li><strong>${name}</strong> [${tags}] - ${done}</li>`
    })

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(`
      <h2>사용자 Notion DB 항목</h2>
      <ul>${rows.join('')}</ul>
    `)
  } catch (err) {
    console.error('❌ 오류:', err.response?.data || err.message)
    res.status(500).send("❌ 사용자별 DB 처리 중 오류 발생")
  }
}
