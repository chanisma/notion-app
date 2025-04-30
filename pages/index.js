// pages/index.js
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithRedirect,
  onAuthStateChanged,
} from "firebase/auth";

export default function Home() {
  // ① Declare both pieces of state
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: "kijun.hs.kr" });

    // ② First handle the redirect result once
    getRedirectResult(auth)
      .then((result) => {
        console.log("🔍 getRedirectResult:", result);
        if (result?.user) {
          setUser(result.user);
          console.log("✅ Redirect 로그인 성공:", result.user.email);
        } else {
          console.log("👀 로그인 안 됐음, 리디렉트 시작");
          signInWithRedirect(auth, provider);
        }
      })
      .catch((err) => {
        console.error("⚠️ getRedirectResult 에러:", err);
        signInWithRedirect(auth, provider);
      })
      .finally(() => {
        // ③ Turn off the loading flag so we can render either login or dashboard
        setInitializing(false);
      });

    // ④ Also subscribe to ongoing auth-state changes
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("👤 onAuthStateChanged:", u);
      setUser(u);
    });
    return unsubscribe;
  }, []);

  // ⑤ Show a loading indicator until we've processed the redirect
  if (initializing) {
    return <p>로딩 중…</p>;
  }

  // ⑥ If still no user, show a manual “Sign in” button
  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ hd: "kijun.hs.kr" });
            signInWithRedirect(auth, provider);
          }}
        >
          Sign in with Google (@kijun.hs.kr only)
        </button>
      </div>
    );
  }

  // ⑦ Finally, the logged-in view
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
