import { NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';
import { parseColisResponse } from '@/lib/parse-soap-response';

export async function GET() {
  try {
    const client = await getSOAPClient();
    
    // Fetch first few pages to get all unique statuses
    let allStatuses = new Set<string>();
    
    for (let page = 1; page <= 5; page++) {
      const response = await client.ListeColisAsync({ page: page.toString() });
      const pageData = response[0];
      
      let parsedData = pageData.ListeColisResult;
      if (typeof parsedData === 'string') {
        parsedData = JSON.parse(parsedData);
      }
      
      const pageColis = parseColisResponse({ ListeColisResult: parsedData });
      
      pageColis.forEach((colis: any) => {
        if (colis.etat) {
          allStatuses.add(colis.etat);
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      statuses: Array.from(allStatuses).sort(),
      count: allStatuses.size
    });
  } catch (error: any) {
    console.error('Error fetching statuses:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch statuses'
      },
      { status: 500 }
    );
  }
}

