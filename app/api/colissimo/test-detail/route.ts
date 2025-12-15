import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error: 'Code barre is required'
        },
        { status: 400 }
      );
    }
    
    const client = await getSOAPClient();
    
    // Call getColis with the code
    console.log('Calling getColis with code:', code);
    const result = await client.getColisAsync({ code_barre: code });
    
    console.log('Raw getColis Response:', JSON.stringify(result, null, 2));
    
    // Parse response
    let responseData = result[0];
    console.log('Response Data:', JSON.stringify(responseData, null, 2));
    
    if (responseData.getColisResult && typeof responseData.getColisResult === 'string') {
      try {
        responseData.getColisResult = JSON.parse(responseData.getColisResult);
        console.log('Parsed getColisResult:', JSON.stringify(responseData.getColisResult, null, 2));
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
      data: responseData,
      parsed: parsedData
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

