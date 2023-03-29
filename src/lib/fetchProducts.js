import slugify from 'slugify'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(process.cwd(), 'src/data')

export async function fetchProducts() {
  const fileContent = await fs.promises.readFile(
    path.join(DATA_DIR, 'products.json'),
    'utf-8'
  )
  const products = JSON.parse(fileContent)
  return products
}

export async function fetchFeaturedProducts() {
  let products = await fetchProducts()
  return products
}

export function groupProductsByTag(products) {
  const grouped = {}

  products.forEach((product) => {
    if (product.tag) {
      const tag = product.tag
      const slug = slugify(tag.toString(), { lower: true })

      if (!grouped.hasOwnProperty(tag)) {
        grouped[tag] = {
          tag: tag,
          slug: slug,
          products: []
        }
      }
      grouped[tag].products.push(product)
    }
  })
  return Object.values(grouped)
}
