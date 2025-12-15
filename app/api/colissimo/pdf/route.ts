import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code_barre = searchParams.get('id');
    
    if (!code_barre) {
      return NextResponse.json(
        {
          success: false,
          error: 'Code barre is required'
        },
        { status: 400 }
      );
    }
    
    const client = await getSOAPClient();
    
    // Call getColisPdf (lowercase) with code_barre parameter
    const result = await client.getColisPdfAsync({ code_barre });
    
    // Parse response
    let responseData = result[0];
    
    // The result is in getColisPdfResult (base64Binary)
    const pdfData = responseData.getColisPdfResult;
    
    // If result is a string, check if it's JSON (error) or base64
    if (pdfData && typeof pdfData === 'string') {
      try {
        const parsed = JSON.parse(pdfData);
        // If it parses as JSON, it's an error
        if (parsed.result_type === 'erreur') {
          return NextResponse.json(
            {
              success: false,
              error: `API Error: ${parsed.result_code} - ${parsed.result_content}`
            },
            { status: 400 }
          );
        }
      } catch (e) {
        // It's base64 binary, not JSON - this is what we want
      }
    }
    
    // Return the base64 PDF
    return NextResponse.json({
      success: true,
      pdf: pdfData
    });
  } catch (error: any) {
    console.error('Error fetching colis PDF:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch colis PDF'
      },
      { status: 500 }
    );
  }
}

