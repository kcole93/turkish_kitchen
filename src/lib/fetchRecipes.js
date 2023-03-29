import Airtable from 'airtable'
import { marked } from 'marked'
import slugify from 'slugify'
import formatTime from './formatTime'

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: import.meta.env.AIRTABLE_API_KEY
})
const base = Airtable.base('appLI1HdKdgySRlpf')

function parseRecipes(recipes) {
  let recipe = {}
  let parsedRecipes = []
  recipes.map((record) => {
    if (record.fields.title) {
      recipe = {
        title: record.fields.title,
        slug: slugify(record.fields.title.toString(), { lower: true }),
        description: record.fields.description
          ? marked.parse(record.fields.description)
          : '',
        longDescription: record.fields.longDescription
          ? marked.parse(record.fields.longDescription)
          : '',
        image: record.fields.image ? record.fields.image[0] : null,
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
          : ''
      }
    }
    parsedRecipes.push(recipe)
  })
  return parsedRecipes
}

export async function fetchRecipes() {
  let recipeQuery = await base('Recipes').select({ view: 'Grid view' }).all()
  return parseRecipes(recipeQuery)
}

export async function fetchFeaturedRecipes() {
  let recipeQuery = await base('Recipes').select({ view: 'Featured' }).all()
  let recipes = parseRecipes(recipeQuery)
  return recipes
}
