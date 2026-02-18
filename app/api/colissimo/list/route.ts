import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';

export async function GET(request: NextRequest) {
  try {
    const client = await getSOAPClient();
    const searchParams = request.nextUrl.searchParams;
    const maxPagesParam = searchParams.get('maxPages');
    const maxPages = maxPagesParam
      ? Math.max(parseInt(maxPagesParam, 10), 1)
      : null;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.max(parseInt(limitParam, 10), 1) : 200;

    let allColis: any[] = [];
    let meta: any = {};
    let pagesFetched = 0;
    let totalPages = 1;

    for (let page = 1; page <= totalPages; page++) {
      const result = await client.ListeColisAsync({
        page: page.toString(),
      });

      let responseData = result[0];

      if (
        responseData.ListeColisResult &&
        typeof responseData.ListeColisResult === 'string'
      ) {
        responseData.ListeColisResult = JSON.parse(
          responseData.ListeColisResult
        );
      }

      const parsed = responseData.ListeColisResult;

      if (parsed?.result_type === 'erreur') {
        return NextResponse.json(
          {
            success: false,
            error: `${parsed.result_code} - ${parsed.result_content}`,
          },
          { status: 400 }
        );
      }

      const content = parsed.result_content;

      if (Array.isArray(content.colis)) {
        allColis.push(...content.colis);
      }

      // Save metadata from API
      meta = {
        nbColis: content.nbColis,
        nbPages: content.nbPages,
      };
      pagesFetched += 1;
      totalPages = Number(content.nbPages) || totalPages;

      if (maxPages && page >= maxPages) {
        break;
      }

      if (allColis.length >= limit) {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        colis: allColis.slice(0, limit),
        pagesFetched,
        maxPages,
        limit,
        totalReturned: allColis.length,
        ...meta,
      },
    });
  } catch (error: any) {
    console.error('Error fetching colis list:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch colis list',
      },
      { status: 500 }
    );
  }
}
