const crypto = require('crypto')
// Gera par de chaves VAPID para Web Push
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
})
const pub = Buffer.from(publicKey).toString('base64url')
const priv = Buffer.from(privateKey).toString('base64url')
console.log('\n🔑 VAPID Keys geradas!\n')
console.log('Adicione ao .env.local:\n')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${pub}`)
console.log(`VAPID_PRIVATE_KEY=${priv}`)
console.log(`VAPID_EMAIL=mailto:seu@email.com`)
console.log('')
