import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    
    if (!query.trim()) {
      // If no query, just return the list
      const client = await getSOAPClient();
      const result = await client.ListeColisAsync({ page: page.toString() });
      
      let responseData = result[0];
      if (responseData.ListeColisResult && typeof responseData.ListeColisResult === 'string') {
        try {
          responseData.ListeColisResult = JSON.parse(responseData.ListeColisResult);
        } catch (e) {
          console.error('Failed to parse ListeColisResult:', e);
        }
      }
      
      return NextResponse.json({
        success: true,
        data: responseData
      });
    }
    
    // For now, use ListeColis and filter client-side
    // Later can implement server-side search if API supports it
    const client = await getSOAPClient();
    const result = await client.ListeColisAsync({ page: page.toString() });
    
    console.log('Search Response:', JSON.stringify(result, null, 2));
    
    let responseData = result[0];
    if (responseData.ListeColisResult && typeof responseData.ListeColisResult === 'string') {
      try {
        responseData.ListeColisResult = JSON.parse(responseData.ListeColisResult);
      } catch (e) {
        console.error('Failed to parse ListeColisResult:', e);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error: any) {
    console.error('Error searching colis:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search colis'
      },
      { status: 500 }
    );
  }
}

