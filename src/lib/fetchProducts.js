import Airtable from 'airtable'
import { marked } from 'marked'
import slugify from 'slugify'

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: import.meta.env.AIRTABLE_API_KEY
})
const base = Airtable.base('appLI1HdKdgySRlpf')

function parseProducts(products) {
  let product = {}
  let parsedProducts = []
  products.map((record) => {
    if (record.fields.name) {
      product = {
        name: record.fields.name,
        slug: slugify(record.fields.name.toString(), { lower: true }),
        link: record.fields.link ? record.fields.link : '',
        description: record.fields.description
          ? marked.parse(record.fields.description)
          : '',
        longDescription: record.fields.longDescription
          ? marked.parse(record.fields.longDescription)
          : '',
        image: record.fields.image ? record.fields.image[0] : null,
        tag: record.fields.tag ? record.fields.tag : ''
      }
    }
    parsedProducts.push(product)
  })
  return parsedProducts
}

export async function fetchProducts() {
  let productQuery = await base('Products').select({ view: 'Grid view' }).all()
  return parseProducts(productQuery)
}

export async function fetchFeaturedProducts() {
  let productQuery = await base('Products').select({ view: 'Featured' }).all()
  let products = parseProducts(productQuery)
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
