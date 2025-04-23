import admin from 'firebase-admin'

if (!admin.apps.length) {
  
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