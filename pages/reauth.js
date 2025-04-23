import { useRouter } from 'next/router'

export default function ReauthPage() {
  const router = useRouter()
  const reason = router.query.reason

  const messages = {
    missing_token: {
      title: '🔐 인증이 필요합니다',
      description: 'Notion 계정으로 로그인하지 않았거나 토큰이 없습니다. 다시 로그인해 주세요.'
    },
    expired_or_no_refresh: {
      title: '🔑 로그인 세션이 만료되었습니다',
      description: 'Notion access_token이 만료되었고, 자동 갱신할 수 없습니다. 다시 로그인해 주세요.'
    },
    default: {
      title: '❗ 로그인 오류',
      description: '로그인 중 문제가 발생했습니다. 다시 로그인해 주세요.'
    }
  }

  const { title, description } = messages[reason] || messages.default

  const clientId = process.env.NEXT_PUBLIC_NOTION_CLIENT_ID
  const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_NOTION_REDIRECT_URI)
  const authUrl = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h2>{title}</h2>
      <p>{description}</p>
      <a href={authUrl}>
        <button style={{ padding: '10px 20px', fontSize: '1rem', marginTop: '1rem' }}>
          Notion 다시 로그인
        </button>
      </a>
    </div>
  )
}
