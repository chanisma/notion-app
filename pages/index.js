// pages/index.js
import { useEffect} from "react";
import { auth } from "../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

export default function Home() {
    console.log("Home component render")
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        console.log("🟢 Auth useEffect 진입");
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ hd: "kijun.hs.kr" });
      
        // ① 리디렉트 복귀 후 한 번만 실행
        getRedirectResult(auth)
          .then((result) => {
            console.log("🔍 getRedirectResult:", result);
            if (result?.user) {
              // 여기서 로그인 처리 끝!
              console.log("✅ Redirect 성공, 유저:", result.user.email);
              return;
            }
            // ② 아직 유저가 없으면 리디렉트
            console.log("👀 로그인 안 됐음, 리디렉트 시작");
            signInWithRedirect(auth, provider);
          })
          .catch((err) => {
            console.error("⚠️ getRedirectResult 에러:", err);
            // 에러 났어도 리디렉트 시도
            signInWithRedirect(auth, provider);
          });
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
