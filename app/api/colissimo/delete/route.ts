import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const code = searchParams.get('code');
    
    // Use code_barre parameter (the actual tracking code from API)
    const codeBarre = code || id;
    
    if (!codeBarre) {
      return NextResponse.json(
        {
          success: false,
          error: 'Colis code is required'
        },
        { status: 400 }
      );
    }
    
    console.log('Deleting colis with code_barre:', codeBarre);
    
    const client = await getSOAPClient();
    
    // SupprimerColis expects code_barre parameter (from WSDL line 727)
    const result = await client.SupprimerColisAsync({ code_barre: codeBarre });
    
    console.log('Delete response:', JSON.stringify(result, null, 2));
    
    // Parse response
    let responseData = result[0];
    if (responseData.SupprimerColisResult && typeof responseData.SupprimerColisResult === 'string') {
      try {
        responseData.SupprimerColisResult = JSON.parse(responseData.SupprimerColisResult);
        console.log('Parsed delete result:', responseData.SupprimerColisResult);
      } catch (e) {
        console.error('Failed to parse SupprimerColisResult:', e);
      }
    }
    
    // Check for errors
    const parsedData = responseData.SupprimerColisResult;
    if (parsedData && parsedData.result_type === 'erreur') {
      console.error('API returned error:', parsedData);
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
      message: 'Colis supprimé avec succès!'
    });
  } catch (error: any) {
    console.error('Error deleting colis:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete colis'
      },
      { status: 500 }
    );
  }
}

