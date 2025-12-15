import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    
    const client = await getSOAPClient();
    
    // Call ListeColis with page as string in object (WSDL requires: <page>string</page>)
    const result = await client.ListeColisAsync({ page: page.toString() });
    
    // Parse the response - result[0] contains the actual data
    let responseData = result[0];
    
    // If ListeColisResult is a string, parse it
    if (responseData.ListeColisResult && typeof responseData.ListeColisResult === 'string') {
      try {
        responseData.ListeColisResult = JSON.parse(responseData.ListeColisResult);
      } catch (e) {
        console.error('Failed to parse ListeColisResult:', e);
      }
    }
    
    // Check for API errors
    const parsedData = responseData.ListeColisResult;
    if (parsedData && parsedData.result_type === 'erreur') {
      return NextResponse.json(
        {
          success: false,
          error: `API Error: ${parsedData.result_code} - ${parsedData.result_content}`
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error: any) {
    console.error('Error fetching colis list:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch colis list'
      },
      { status: 500 }
    );
  }
}

