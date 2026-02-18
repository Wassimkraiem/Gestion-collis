import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';

export async function GET(request: NextRequest) {
  try {
    const client = await getSOAPClient();
    const searchParams = request.nextUrl.searchParams;
    const pageParam = searchParams.get('page');
    const page = pageParam ? Math.max(parseInt(pageParam, 10), 1) : 1;

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

    return NextResponse.json({
      success: true,
      data: responseData,
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
