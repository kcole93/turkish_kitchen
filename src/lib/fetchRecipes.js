import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'src/data')

export async function fetchRecipes() {
  const fileContent = await fs.promises.readFile(
    path.join(DATA_DIR, 'recipes.json'),
    'utf-8'
  )
  const recipes = JSON.parse(fileContent)
  return recipes
}

export async function fetchFeaturedRecipes() {
  let recipes = await fetchRecipes()
  return recipes
}
