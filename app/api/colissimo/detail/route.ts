import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Colis ID is required'
        },
        { status: 400 }
      );
    }
    
    const client = await getSOAPClient();
    
    // Use getColis method with code_barre parameter
    const result = await client.getColisAsync({ code_barre: id });
    
    // Parse response
    let responseData = result[0];
    if (responseData.getColisResult && typeof responseData.getColisResult === 'string') {
      try {
        responseData.getColisResult = JSON.parse(responseData.getColisResult);
      } catch (e) {
        console.error('Failed to parse getColisResult:', e);
      }
    }
    
    // Check for errors
    const parsedData = responseData.getColisResult;
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
    console.error('Error fetching colis detail:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch colis detail'
      },
      { status: 500 }
    );
  }
}

