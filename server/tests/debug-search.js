import { catalogService } from '../src/services/catalog.service.js'

async function run() {
  try {
    console.info('Testing searchProducts without filters:')
    const res1 = await catalogService.searchProducts({})
    console.info('Result 1 total:', res1.meta.total, 'items count:', res1.data.length)

    console.info('Testing searchProducts with category bags-footwear:')
    const res2 = await catalogService.searchProducts({ category: 'bags-footwear' })
    console.info('Result 2 total:', res2.meta.total, 'items count:', res2.data.length)
    if (res2.data.length > 0) {
      console.info('Sample item category_slug:', res2.data[0].category_slug, 'title:', res2.data[0].title)
    }
  } catch (err) {
    console.error('Search debug error:', err)
  }
}

run()
