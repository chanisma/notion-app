import axios from 'axios'

const META_DB_ID = process.env.NOTION_META_DB_ID
const ADMIN_TOKEN = process.env.NOTION_ADMIN_TOKEN
const NOTION_API_VERSION = process.env.NOTION_API_VERSION || '2022-06-28'

export default async function handler(req, res) {
  const userToken = req.query.access_token
  if (!userToken) {
    return res.status(400).send("❗ access_token 없음")
  }

  const userHeaders = {
    Authorization: `Bearer ${userToken}`,
    'Notion-Version': NOTION_API_VERSION,
    'Content-Type': 'application/json'
  }

  const adminHeaders = {
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    'Notion-Version': NOTION_API_VERSION,
    'Content-Type': 'application/json'
  }

  try {
    // 1. 사용자 정보 조회
    const userRes = await axios.get('https://api.notion.com/v1/users/me', { headers: userHeaders })
    const userId = userRes.data.id

    // 2. meta DB에서 userId 검색 (관리자 토큰 사용)
    const metaQuery = await axios.post(
      `https://api.notion.com/v1/databases/${META_DB_ID}/query`,
      {
        filter: {
          property: 'UserId',
          title: {
            equals: userId
          }
        }
      },
      { headers: adminHeaders }
    )

    let dbId = null

    if (metaQuery.data.results.length > 0) {
      dbId = metaQuery.data.results[0].properties.DbId.rich_text[0].plain_text
    } else {
      // 3. 사용자 워크스페이스에 페이지 + DB 생성
      const pageRes = await axios.post('https://api.notion.com/v1/pages', {
        parent: { type: 'user_id', user_id: userId },
        properties: {}
      }, { headers: userHeaders })

      const pageId = pageRes.data.id

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
      }, { headers: userHeaders })

      dbId = dbRes.data.id

      // 4. meta DB에 userId → dbId 저장 (관리자 토큰 사용)
      await axios.post('https://api.notion.com/v1/pages', {
        parent: {
          database_id: META_DB_ID
        },
        properties: {
          UserId: {
            title: [{ type: 'text', text: { content: userId } }]
          },
          DbId: {
            rich_text: [{ type: 'text', text: { content: dbId } }]
          }
        }
      }, { headers: adminHeaders })
    }

    // 5. 사용자 DB 내용 조회
    const queryRes = await axios.post(`https://api.notion.com/v1/databases/${dbId}/query`, {}, { headers: userHeaders })
    const items = queryRes.data.results

    const rows = items.map((item) => {
      const props = item.properties
      const name = props.Name?.title?.[0]?.plain_text || '(no title)'
      const tags = props.Tag?.multi_select?.map(t => t.name).join(', ') || ''
      const done = props.Done?.checkbox ? '✅' : '❌'
      return `<li><strong>${name}</strong> [${tags}] - ${done}</li>`
    })

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(`<h2>📄 사용자 Notion DB 항목</h2><ul>${rows.join('')}</ul>`)

  } catch (err) {
    console.error('❌ 오류:', JSON.stringify(err.response?.data || err.message, null, 2))
    res.status(500).send("❌ 사용자별 DB 처리 중 오류 발생")
  }
}
