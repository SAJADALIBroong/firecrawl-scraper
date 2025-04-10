import { NextRequest, NextResponse } from 'next/server';
import { scrapeProduct } from '@/app/actions/scraper';

export async function POST(req: NextRequest, res: NextResponse) {
  const { url } = await req.json();
  try {
    const data = await scrapeProduct(url);
    if (!data || !data.products) {
      return NextResponse.json({ 
        error: 'No products found',
        message: 'No products found on the provided URL'
      }, { status: 404 });
    }    
    return NextResponse.json({
      data: data,
      message: 'Scraping successful'
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ 
      error: 'Failed to scrape data',
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}