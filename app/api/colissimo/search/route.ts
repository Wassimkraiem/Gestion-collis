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
    
    // Search across all pages, but return only matching colis
    const client = await getSOAPClient();
    const normalizedQuery = query.trim();
    const matches: any[] = [];
    let pageToFetch = 1;
    let totalPages = 1;

    const isNumberQuery = /^[0-9]+$/.test(normalizedQuery);

    while (pageToFetch <= totalPages) {
      const result = await client.ListeColisAsync({
        page: pageToFetch.toString(),
      });

      let responseData = result[0];
      if (
        responseData.ListeColisResult &&
        typeof responseData.ListeColisResult === 'string'
      ) {
        try {
          responseData.ListeColisResult = JSON.parse(
            responseData.ListeColisResult
          );
        } catch (e) {
          console.error('Failed to parse ListeColisResult:', e);
        }
      }

      const parsed = responseData.ListeColisResult;
      const content = parsed?.result_content;
      const colis = Array.isArray(content?.colis) ? content.colis : [];

      for (const item of colis) {
        const reference = String(item.reference || '').trim();
        const numeroColis = String(item.numero_colis || '').trim();
        const tel1 = String(item.tel1 || '').trim();
        const tel2 = String(item.tel2 || '').trim();

        if (isNumberQuery) {
          if (
            reference === normalizedQuery ||
            numeroColis === normalizedQuery ||
            tel1 === normalizedQuery ||
            tel2 === normalizedQuery
          ) {
            matches.push(item);
          }
        } else {
          const haystack = `${reference} ${numeroColis}`.toLowerCase();
          if (haystack.includes(normalizedQuery.toLowerCase())) {
            matches.push(item);
          }
        }
      }

      totalPages = Number(content?.nbPages) || totalPages;
      pageToFetch += 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        colis: matches,
        totalReturned: matches.length,
      },
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
