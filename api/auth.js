export default function handler(req, res) {
    const client_id = process.env.NOTION_CLIENT_ID;
    const redirect_uri = process.env.NOTION_REDIRECT_URI;
    const url = `https://api.notion.com/v1/oauth/authorize?client_id=${client_id}&response_type=code&owner=user&redirect_uri=${redirect_uri}`;
    res.redirect(url);
  }
  