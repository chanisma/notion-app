export default function handler(req, res) {
  const client_id = process.env.NOTION_CLIENT_ID;
  const redirect_uri = process.env.NOTION_REDIRECT_URI;

  if (!client_id || !redirect_uri) {
    return res.status(500).send("❌ 환경변수 누락: NOTION_CLIENT_ID 또는 REDIRECT_URI가 없음");
  }

  const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${client_id}&response_type=code&owner=user&redirect_uri=${redirect_uri}`;
  res.redirect(notionAuthUrl);
}
