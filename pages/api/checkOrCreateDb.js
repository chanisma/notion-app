import axios from 'axios'
import {db} from '../../lib/firebase-admin'

console.log('🔥 typeof db:', typeof db)
console.log('🔥 typeof db.ref:', typeof db?.ref)

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

  try {
    // 1. 사용자 정보 조회
    const userRes = await axios.get('https://api.notion.com/v1/users/me', { headers: userHeaders })
    const userId = userRes.data.id
    console.log('👤 사용자 ID:', userId)

    // 2. Firebase에서 dbId 조회
    const snapshot = await db.ref(`users/${userId}/dbId`).once('value')
    let dbId = snapshot.val()

    if (dbId) {
      console.log('📄 기존 dbId 찾음:', dbId)
    } else {
      // 3. 사용자 워크스페이스에 페이지 생성
      console.log('📄 3. 사용자 워크스페이스에 페이지 생성')
      const pageRes = await axios.post('https://api.notion.com/v1/pages', {
        parent: { type: 'user_id', user_id: userId },
        properties: {}
      }, { headers: userHeaders })

      const pageId = pageRes.data.id

      // 4. DB 생성
      console.log('📄 4. DB 생성')
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
      console.log('🆕 새 dbId 생성:', dbId)

      // 5. Firebase에 저장
      await db.ref(`users/${userId}`).set({ dbId })
      console.log('✅ Firebase 저장 완료')
    }

    // 6. DB 내용 조회
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
