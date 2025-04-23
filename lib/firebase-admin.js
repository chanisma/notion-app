import admin from 'firebase-admin'

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)

  // 🔥 PEM 키에서 이스케이프된 줄바꿈 복원
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    databaseURL: process.env.FIREBASE_DB_URL
  })
}
const db = admin.database()

console.log('📦 admin.database:', typeof admin.database)
console.log('📡 databaseURL:', process.env.FIREBASE_DB_URL)
console.log('🧠 FIREBASE_SERVICE_ACCOUNT 존재:', !!process.env.FIREBASE_SERVICE_ACCOUNT)

export { admin, db }