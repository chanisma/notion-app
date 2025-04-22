import axios from 'axios'

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
    // 1. 사용자 정보 조회
    const userRes = await axios.get('https://api.notion.com/v1/users/me', { headers })
    const userId = userRes.data.id
    console.log('✅ 사용자 ID:', userId)

    // 2. 빈 페이지 생성
    const pageRes = await axios.post('https://api.notion.com/v1/pages', {
      parent: {
        type: 'user_id',
        user_id: userId
      },
      properties: {}
    }, { headers })

    const pageId = pageRes.data.id
    console.log('📄 페이지 생성됨:', pageId)

    // 3. 페이지 안에 DB 생성
    const dbRes = await axios.post('https://api.notion.com/v1/databases', {
      parent: {
        type: 'page_id',
        page_id: pageId
      },
      title: [{
        type: 'text',
        text: { content: 'My Auto Notion DB' }
      }],
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

    const dbId = dbRes.data.id
    console.log('📦 DB 생성 완료:', dbId)

    // 4. DB 내용 조회
    const queryRes = await axios.post(`https://api.notion.com/v1/databases/${dbId}/query`, {}, { headers })
    const items = queryRes.data.results

    const rows = items.map((item) => {
      const props = item.properties
      const name = props.Name?.title?.[0]?.plain_text || '(no title)'
      const tags = props.Tag?.multi_select?.map(t => t.name).join(', ') || ''
      const done = props.Done?.checkbox ? '✅' : '❌'
      return `<li><strong>${name}</strong> [${tags}] - ${done}</li>`
    })

    // 5. 결과 표시
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(`
      <h2>📄 생성된 Notion DB 항목</h2>
      <ul>${rows.join('')}</ul>
    `)
  } catch (err) {
    console.error('❌ checkOrCreateDb 에러:', err.response?.data || err.message)
    res.status(500).send("❌ DB 생성 중 오류 발생")
  }
}
