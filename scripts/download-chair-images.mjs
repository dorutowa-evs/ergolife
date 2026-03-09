/**
 * Downloads all external chair images to public/images/chairs/.
 * Run once: node scripts/download-chair-images.mjs
 */
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'chairs')

const images = [
  { file: 'aeron.jpg',              url: 'https://static2.flymee.jp/product_images/af4d-30406/202301231128557113.jpg' },
  { file: 'steelcase-leap-v2.webp', url: 'https://btod-delta-store.s3.amazonaws.com/public/ultracommerce/product/transform/images/byUrlTitle/steelcase-leap-v2/sc-leap-v2.webp' },
  { file: 'steelcase-gesture.jpg',  url: 'https://images.steelcase.com/image/upload/v1676059815/21-0166043-1.jpg' },
  { file: 'embody.png',             url: 'https://images.hermanmiller.group/asset/b075e0ce-0a95-40ad-bbcd-c07071691a7c/W/HM_4737_100147350_graphite_graphite_charcoal_a.png' },
  { file: 'sayl.png',               url: 'https://hermanmiller.co.jp/cdn/shop/products/AS1YA23HAN2BKBBBKBK9115_621789d0-eae2-4925-a395-e8ddf0f53421.png?height=1110&v=1720771825&width=960' },
  { file: 'humanscale-freedom.png', url: 'https://cdn11.bigcommerce.com/s-lpku7oc/images/stencil/760x760/products/384/4525/F211GV101_1_946x1500_1__35185.1557339613.png?c=2' },
  { file: 'branch.jpg',             url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbPTUYvBLKo2EK0mH54cJdwjj6T3goyzDcTQ&s' },
  { file: 'knoll-generation.jpg',   url: 'https://static2.flymee.jp/product_images/b550-115661/202312121724062463.jpg' },
  { file: 'haworth-fern.png',       url: 'https://floydhome.com/cdn/shop/files/Fern_Floyd_REd-Blue_Sisu_Front34_FNL-removebg_2655x.png?v=1695398112' },
  { file: 'secretlab-titan-evo.jpg',url: 'https://m.media-amazon.com/images/I/51ia8cmW4KL.jpg' },
  { file: 'sihoo-m57.jpg',          url: 'https://sihoooffice.co.jp/cdn/shop/files/img_v3_02u7_aeff4c06-3c61-48e1-9de4-761f17c23deg.jpg?v=1769151470&width=603' },
  { file: 'flexispot-c7.png',       url: 'https://s3.springbeetle.eu/dev-de-s3-flexispot/commodity/item/1028_file_c7-png-250715-3.png' },
  { file: 'razer-iskur.jpg',        url: 'https://m.media-amazon.com/images/I/712puRvM3XL.jpg' },
  { file: 'ticova.jpg',             url: 'https://www.ticova.net/wp-content/uploads/2022/01/Ticova-Ergonomic-Office-Chair-1-1.jpg' },
  { file: 'odinlake-l1.jpg',        url: 'https://www.odinlake.com/cdn/shop/files/OdinLake-Ergo-UPGRADE-518-1024V1-1.jpg?v=1769219681' },
  { file: 'duramont.jpg',           url: 'https://duramontchairs.com/cdn/shop/files/main_black_new.jpg?v=1742471775' },
]

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close()
        fs.unlinkSync(dest)
        download(res.headers.location, dest).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        file.close()
        fs.unlinkSync(dest)
        reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        return
      }
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
    })
    req.on('error', (err) => { fs.unlinkSync(dest); reject(err) })
  })
}

for (const { file, url } of images) {
  const dest = path.join(OUT_DIR, file)
  if (fs.existsSync(dest)) {
    console.log(`skip  ${file} (exists)`)
    continue
  }
  process.stdout.write(`dl    ${file} ... `)
  try {
    await download(url, dest)
    console.log('ok')
  } catch (e) {
    console.log(`FAIL: ${e.message}`)
  }
}
