import { NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';
import { parseColisResponse } from '@/lib/parse-soap-response';

export async function GET() {
  try {
    const client = await getSOAPClient();
    
    // Fetch all pages to get accurate counts
    const response = await client.ListeColisAsync({ page: '1' });
    const firstPageData = response[0];
    
    // Parse JSON if needed
    let parsedData = firstPageData.ListeColisResult;
    if (typeof parsedData === 'string') {
      parsedData = JSON.parse(parsedData);
    }
    
    // Get total pages
    const totalPages = parseInt(parsedData.result_content?.nbPages) || 1;
    
    // Fetch all pages
    let allColis: any[] = [];
    
    for (let page = 1; page <= Math.min(totalPages, 20); page++) {
      const pageResponse = await client.ListeColisAsync({ page: page.toString() });
      const pageData = pageResponse[0];
      
      let pageResult = pageData.ListeColisResult;
      if (typeof pageResult === 'string') {
        pageResult = JSON.parse(pageResult);
      }
      
      const pageColis = parseColisResponse({ ListeColisResult: pageResult });
      allColis = [...allColis, ...pageColis];
    }
    
    // Calculate status counts
    const counts: { [key: string]: number } = {};
    allColis.forEach((colis) => {
      const status = colis.etat || 'Unknown';
      counts[status] = (counts[status] || 0) + 1;
    });
    
    return NextResponse.json({
      success: true,
      data: counts
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch stats'
      },
      { status: 500 }
    );
  }
}

