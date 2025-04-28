// pages/index.js
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

import { setLogLevel } from "firebase/auth";
setLogLevel("debug");

export default function Home() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("🟢 Auth useEffect 진입");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: "kijun.hs.kr" });
  
    (async () => {
      try {
        // 1) 리디렉트 복귀 직후 한 번 결과 처리
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("✅ Redirect 성공, 유저:", result.user.email);
          return; // 여기서 끝내면 무한 리디렉트 방지
        }
      } catch (e) {
        console.warn("getRedirectResult 에러:", e);
      }
  
      // 2) 현재 인증 상태 보고, 로그인 안 됐으면 리디렉트 시작
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          console.log("👀 로그인 안 됐음, 리디렉트 호출");
          signInWithRedirect(auth, provider);
        } else {
          console.log("👋 이미 로그인된 유저:", user.email);
        }
      });
    })();
  }, []);  

  if (initializing) return <p>로딩 중…</p>;

  // Not signed in yet? Kick off the redirect
  if (!user) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <button
          onClick={() => {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ hd: "kijun.hs.kr" });
            signInWithRedirect(auth, provider);d
          }}
        >
          Sign in with Google (@kijun.hs.kr only)
        </button>
      </div>
    );
  }

  // Signed in: show your dashboard / Notion-connect UI
  return (
    <div>
      <h1>환영합니다, {user.email}</h1>
      <a href="/api/auth">
            <button>Notion 로그인 및 DB 확인</button>
      </a>
    </div>
  );
}




// pages/index.js
// import { useEffect, useState } from "react";
// import { auth } from "../lib/firebase";
// import {
//   GoogleAuthProvider,
//   onAuthStateChanged,
//   signInWithPopup,
// } from "firebase/auth";

// export default function Home() {
//   const [initializing, setInitializing] = useState(true);

//   useEffect(() => {
//     const provider = new GoogleAuthProvider();
//     provider.setCustomParameters({ hd: "kijun.hs.kr" });

//     // 1) 인증 상태 감지
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (!user) {
//         // 2) 로그인이 안 되어 있으면 팝업 호출
//         signInWithPopup(auth, provider).catch((err) => {
//           console.error("Google sign-in failed:", err);
//         });
//       }
//       setInitializing(false);
//     });
//     return unsubscribe;
//   }, []);

//   if (initializing) {
//     return <p>로딩 중…</p>;
//   }

//   // 로그인 성공하면 여기에 실제 대시보드 / Notion 연결 UI가 보여집니다.
//   return (
//     <div>
//       <h1>환영합니다, {auth.currentUser?.email}</h1>
//       <a href="/api/auth">
//             <button>Notion 로그인 및 DB 확인</button>
//       </a>
//     </div>
//   );
// }
