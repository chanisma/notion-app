// components/GoogleLoginButton.jsx
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function GoogleLoginButton({ onSuccess }) {
  const provider = new GoogleAuthProvider();
  // tell Google to only show kijun.hs.kr accounts
  provider.setCustomParameters({ hd: "kijun.hs.kr" });

  async function handleLogin() {
    try {
      const { user } = await signInWithPopup(auth, provider);
      const email = user.email || "";

      // *double-check* domain on the client
      if (!email.endsWith("@kijun.hs.kr")) {
        await signOut(auth);
        alert("🚫 Please sign in with your @kijun.hs.kr account.");
        return;
      }

      // you’re good—hand the user object back up
      onSuccess(user);
    } catch (err) {
      console.error(err);
      alert("Login failed. Are pop-ups allowed?");
    }
  }

  return (
    <button onClick={handleLogin}>
      Sign in with Google (@kijun.hs.kr only)
    </button>
  );
}