const fs = require('fs')
const path = require('path')

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons')
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

// Garantir diretório existe
if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true })
}

// Gerar SVG base dourado com "A"
function generateSVG(size) {
    const fontSize = Math.round(size * 0.5)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#c9a858"/>
      <stop offset="100%" style="stop-color:#b8943f"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#0b0d10"/>
  <rect x="${Math.round(size * 0.05)}" y="${Math.round(size * 0.05)}" width="${Math.round(size * 0.9)}" height="${Math.round(size * 0.9)}" rx="${Math.round(size * 0.15)}" fill="url(#gold)"/>
  <text x="50%" y="54%" font-family="system-ui,-apple-system,sans-serif" font-size="${fontSize}" font-weight="800" fill="#0b0d10" text-anchor="middle" dominant-baseline="middle">A</text>
</svg>`
}

// Gerar SVGs
for (const size of SIZES) {
    const svg = generateSVG(size)
    const svgPath = path.join(ICONS_DIR, `icon-${size}x${size}.svg`)
    fs.writeFileSync(svgPath, svg)
    console.log(`✓ Generated ${svgPath}`)
}

// Tentar converter para PNG com sharp
try {
    const sharp = require('sharp')
        ; (async () => {
            for (const size of SIZES) {
                const svgPath = path.join(ICONS_DIR, `icon-${size}x${size}.svg`)
                const pngPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`)
                await sharp(svgPath).resize(size, size).png().toFile(pngPath)
                console.log(`✓ Converted to PNG: ${pngPath}`)
                // Remove SVG after conversion
                fs.unlinkSync(svgPath)
            }
            console.log('\n✅ All PWA icons generated successfully!')
        })()
} catch {
    console.log('\n⚠️  Sharp not installed. SVG icons generated.')
    console.log('   Run: npm install -D sharp')
    console.log('   Then: node scripts/generate-icons.js')
}
