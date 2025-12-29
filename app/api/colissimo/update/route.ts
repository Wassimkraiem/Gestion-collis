import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';
import { ColisFormData } from '@/types/colissimo';

export async function PUT(request: NextRequest) {
  try {
    const data: ColisFormData & { id: string } = await request.json();
    
    if (!data.id || data.id.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Colis ID (code barre) is required and cannot be empty'
        },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!data.client || !data.adresse || !data.tel1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: client, adresse, tel1'
        },
        { status: 400 }
      );
    }
    
    const colis = {
      code: data.id, // API expects code field for the barcode
      code_barre: data.id, // Also include code_barre for compatibility
      reference: data.reference,
      client: data.client,
      adresse: data.adresse,
      ville: data.ville,
      gouvernorat: data.gouvernorat,
      tel1: data.tel1,
      tel2: data.tel2 || '',
      designation: data.designation,
      prix: data.prix,
      nb_pieces: data.nb_pieces,
      type: data.type,
      commentaire: data.commentaire || '',
      echange: data.echange,
      cod: data.cod || 0,
      poids: data.poids || 0
    };
    
    console.log('Updating colis with data:', colis);
    
    const client = await getSOAPClient();
    const colisJson = JSON.stringify(colis);
    console.log('JSON to send:', colisJson);
    
    const result = await client.ModifierColisAsync({ pic: colisJson });
    
    console.log('Update Colis Response:', JSON.stringify(result, null, 2));
    
    // Parse response
    let responseData = result[0];
    console.log('Raw response:', responseData);
    
    if (responseData.ModifierColisResult && typeof responseData.ModifierColisResult === 'string') {
      try {
        responseData.ModifierColisResult = JSON.parse(responseData.ModifierColisResult);
        console.log('Parsed ModifierColisResult:', responseData.ModifierColisResult);
      } catch (e) {
        console.error('Failed to parse ModifierColisResult:', e);
      }
    }
    
    // Check for errors
    const parsedData = responseData.ModifierColisResult;
    if (parsedData && parsedData.result_type === 'erreur') {
      console.error('API returned error:', parsedData);
      return NextResponse.json(
        {
          success: false,
          error: `API Error: ${parsedData.result_code || 'Unknown error'} - ${parsedData.result_content || parsedData.message || 'Failed to update colis'}`
        },
        { status: 400 }
      );
    }
    
    // Check for success
    if (parsedData && (parsedData.result_type === 'success' || parsedData.result_type === 'succes')) {
      console.log('Colis updated successfully:', parsedData);
      return NextResponse.json({
        success: true,
        data: parsedData,
        message: 'Colis modifié avec succès!'
      });
    }
    
    // If we get here, something unexpected happened
    console.warn('Unexpected response format:', responseData);
    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Colis updated (response unclear)'
    });
  } catch (error: any) {
    console.error('Error updating colis:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update colis'
      },
      { status: 500 }
    );
  }
}

