// pages/reauth.js
export default function ReauthPage({ user_id }) {
    const clientId = process.env.NEXT_PUBLIC_NOTION_CLIENT_ID
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_NOTION_REDIRECT_URI)
    const authUrl = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`
  
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h2>🔒 인증이 만료되었습니다</h2>
        <p>다시 로그인하여 계속 진행해주세요.</p>
        <a href={authUrl}>
          <button style={{ padding: '0.6rem 1.2rem', fontSize: '1rem' }}>Notion 다시 로그인</button>
        </a>
      </div>
    )
  }
  
  export async function getServerSideProps(context) {
    return {
      props: {
        user_id: context.query.user_id || ''
      }
    }
  }
