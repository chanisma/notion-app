// lib/viewDB.js
import axios from 'axios'

export async function viewDB(dbId, headers) {
  const queryRes = await axios.post(
    `https://api.notion.com/v1/databases/${dbId}/query`,
    {},
    { headers }
  )

  const rows = queryRes.data.results.map((item) => {
    const props = item.properties
    const name = props.Name?.title?.[0]?.plain_text || '(no title)'
    const tags = props.Category?.multi_select?.map(t => t.name).join(', ') || ''
    const done = props.Done?.checkbox ? '✅' : '❌'
    return `<li><strong>${name}</strong> [${tags}] - ${done}</li>`
  })

  return `
    <h2>📋 사용자 Notion DB 항목</h2>
    <ul>${rows.join('')}</ul>
  `
}