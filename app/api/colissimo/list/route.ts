import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';

const MAX_PAGES = 2;

export async function GET(request: NextRequest) {
  try {
    const client = await getSOAPClient();

    let allColis: any[] = [];
    let meta: any = {};

    for (let page = 1; page <= MAX_PAGES; page++) {
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

      // Stop early if API has fewer pages
      if (page >= Number(content.nbPages)) {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        colis: allColis,
        pagesFetched: MAX_PAGES,
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