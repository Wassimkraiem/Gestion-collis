import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';

export async function POST(request: NextRequest) {
  try {
    const { code_barre, newStatus } = await request.json();
    
    if (!code_barre || !newStatus) {
      return NextResponse.json(
        {
          success: false,
          error: 'Code barre and new status are required'
        },
        { status: 400 }
      );
    }
    
    const client = await getSOAPClient();
    
    // First, get the current colis details
    const getResult = await client.getColisAsync({ code_barre });
    const getResponse = getResult[0];
    
    if (getResponse.getColisResult && typeof getResponse.getColisResult === 'string') {
      try {
        getResponse.getColisResult = JSON.parse(getResponse.getColisResult);
      } catch (e) {
        console.error('Failed to parse getColisResult:', e);
      }
    }
    
    const parsedData = getResponse.getColisResult;
    if (parsedData && parsedData.result_type === 'erreur') {
      return NextResponse.json(
        {
          success: false,
          error: `API Error: ${parsedData.result_code} - ${parsedData.result_content}`
        },
        { status: 400 }
      );
    }
    
    const currentColis = parsedData?.result_content;
    
    if (!currentColis) {
      return NextResponse.json(
        {
          success: false,
          error: 'Colis not found'
        },
        { status: 404 }
      );
    }
    
    // Update the colis with new status
    const updatedColis = {
      ...currentColis,
      etat: newStatus,
      code_barre: code_barre
    };
    
    // Call ModifierColis to update
    const updateResult = await client.ModifierColisAsync({ pic: JSON.stringify(updatedColis) });
    console.log('updateResult', updateResult);
    // Parse the result to check for actual success
    let modifyResponse = updateResult[0];
    if (modifyResponse.ModifierColisResult && typeof modifyResponse.ModifierColisResult === 'string') {
      try {
        modifyResponse.ModifierColisResult = JSON.parse(modifyResponse.ModifierColisResult);
      } catch (e) {
        console.error('Failed to parse ModifierColisResult:', e);
      }
    }
    
    const modifyData = modifyResponse.ModifierColisResult;
    if (modifyData && modifyData.result_type === 'erreur') {
      return NextResponse.json(
        {
          success: false,
          error: `API Error: ${modifyData.result_code} - ${modifyData.result_content}`
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: modifyData,
      message: 'Status updated successfully'
    });
  } catch (error: any) {
    console.error('Error changing colis status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to change colis status'
      },
      { status: 500 }
    );
  }
}

