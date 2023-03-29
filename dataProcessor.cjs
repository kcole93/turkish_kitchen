const Airtable = require('airtable')
const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const slugify = require('slugify')
const marked = require('marked')
const dotenv = require('dotenv')
const mime = require('mime-types')
const { htmlToText } = require('html-to-text')
dotenv.config()

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY
})

const base = Airtable.base('appLI1HdKdgySRlpf')

const IMAGES_DIR = path.join(process.cwd(), 'public/assets/images')
const DATA_DIR = path.join(process.cwd(), 'src/data')

// Function to format time durations
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  let formattedTime = ''

  if (hours > 0) {
    formattedTime += `${hours}h `
  }
  if (minutes > 0) {
    formattedTime += `${minutes}m `
  }
  if (remainingSeconds > 0) {
    formattedTime += `${remainingSeconds}s`
  }

  return formattedTime.trim()
}

// Function to download an image and save it locally
async function downloadImage(url, localPath) {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  await fs.promises.writeFile(localPath, Buffer.from(buffer))
}

// Function to parse a product record
function parseProducts(record, titleField, imageField) {
  if (record.fields[titleField]) {
    return {
      title: record.fields[titleField],
      slug: slugify(record.fields[titleField].toString(), { lower: true }),
      link: record.fields.link ? record.fields.link : '',
      description: record.fields.description
        ? marked.parse(record.fields.description)
        : '',
      descriptionPlain: record.fields.description
        ? htmlToText(record.fields.description)
        : '',
      longDescription: record.fields.longDescription
        ? marked.parse(record.fields.longDescription)
        : '',
      image: record.fields[imageField]
        ? { url: record.fields[imageField][0].localUrl }
        : null,
      tag: record.fields.tag ? record.fields.tag : '',
      featured: record.fields.featured ? record.fields.featured : false
    }
  }
  return null
}

function parseRecipes(record, titleField, imageField) {
  if (record.fields[titleField]) {
    return {
      title: record.fields[titleField],
      slug: slugify(record.fields[titleField].toString(), { lower: true }),
      link: record.fields.link ? record.fields.link : '',
      description: record.fields.description
        ? marked.parse(record.fields.description)
        : '',
      descriptionPlain: record.fields.description
        ? htmlToText(record.fields.description)
        : '',
      longDescription: record.fields.longDescription
        ? marked.parse(record.fields.longDescription)
        : '',
      image: record.fields[imageField]
        ? { url: record.fields[imageField][0].localUrl }
        : null,
      ingredients: record.fields.ingredients
        ? marked.parse(record.fields.ingredients)
        : '',
      instructions: record.fields.instructions
        ? marked.parse(record.fields.instructions)
        : '',
      additionalNotes: record.fields.additionalNotes
        ? marked.parse(record.fields.additionalNotes)
        : '',
      prepTime: record.fields.prepTime
        ? formatTime(record.fields.prepTime)
        : '',
      cookTime: record.fields.cookTime
        ? formatTime(record.fields.cookTime)
        : '',
      featured: record.fields.featured ? record.fields.featured : false
    }
  }
  return null
}

// Function to download images from Airtable, process records, and save processed data to JSON files
async function processDataFromAirtable(
  baseName,
  viewName,
  parseFunction,
  titleField = 'title',
  imageField = 'image'
) {
  const records = await base(baseName).select({ view: viewName }).all()

  await fs.promises.mkdir(IMAGES_DIR, { recursive: true })

  const parsedRecords = await Promise.all(
    records.map(async (record) => {
      if (record.fields[titleField] && record.fields[imageField]) {
        const imageUrl = record.fields[imageField][0].url
        const mimeType = record.fields[imageField][0].type
        const fileExtension = mime.extension(mimeType)
        const fileName =
          slugify(record.fields[titleField].toString(), { lower: true }) +
          '.' +
          fileExtension
        const localPath = path.join(IMAGES_DIR, fileName)

        if (!fs.existsSync(localPath)) {
          console.log(`Downloading image: ${fileName}`)
          await downloadImage(imageUrl, localPath)
        }
        record.fields[imageField][0].localUrl = '/assets/images/' + fileName
      }
      return parseFunction(record, titleField, imageField)
    })
  )

  return parsedRecords.filter((record) => record !== null)
}

async function main() {
  const recipes = await processDataFromAirtable(
    'Recipes',
    'Grid view',
    parseRecipes
  )
  const products = await processDataFromAirtable(
    'Products',
    'Grid view',
    parseProducts
  )

  await fs.promises.mkdir(DATA_DIR, { recursive: true })

  await fs.promises.writeFile(
    path.join(DATA_DIR, 'recipes.json'),
    JSON.stringify(recipes)
  )
  await fs.promises.writeFile(
    path.join(DATA_DIR, 'products.json'),
    JSON.stringify(products)
  )
}

main().catch((error) => {
  console.error('Error processing data:', error)
  process.exit(1)
})
