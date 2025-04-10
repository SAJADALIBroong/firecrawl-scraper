// app/actions/scraper.js
import FireCrawlApp from '@mendable/firecrawl-js';
import { z } from 'zod';

export async function scrapeProduct(url: string) {
  try {
    const app = new FireCrawlApp({apiKey: "fc-dfe81a59554f4dfa85f773cf19a9f96a"});

    const schema = z.object({
      products: z.array(z.object({
        product_name: z.string(),
        image_url: z.string(),
        price: z.number(),
        category: z.string()
      }))
    });
    
    const extractResult = await app.extract([
       url,
    ], {
      prompt: "Extract product name, image URL, price and category for products on this page.",
      schema,
    });
    
    if ('data' in extractResult) {
      return extractResult.data;
    } else {
      console.error('No data returned from extraction');
      return { products: [] }; 
    }
  } catch (error) {
    console.error('Error in scrapeProduct:', error);
    // Return empty products array in case of error
    return { products: [] };
  }
}