import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';
import { ColisFormData } from '@/types/colissimo';

export async function POST(request: NextRequest) {
  try {
    const data: ColisFormData = await request.json();
    
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
      reference: data.reference || '',
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
    
    console.log('Sending colis data:', colis);
    
    const client = await getSOAPClient();
    
    // AjouterColis expects pic parameter as JSON string
    const colisJson = JSON.stringify(colis);
    console.log('JSON to send:', colisJson);
    
    const result = await client.AjouterColisAsync({ pic: colisJson });
    
    console.log('Add Colis Response:', JSON.stringify(result, null, 2));
    
    // Parse response
    let responseData = result[0];
    console.log('Raw response:', responseData);
    
    if (responseData.AjouterColisResult && typeof responseData.AjouterColisResult === 'string') {
      try {
        responseData.AjouterColisResult = JSON.parse(responseData.AjouterColisResult);
        console.log('Parsed AjouterColisResult:', responseData.AjouterColisResult);
      } catch (e) {
        console.error('Failed to parse AjouterColisResult:', e);
      }
    }
    
    // Check for errors
    const parsedData = responseData.AjouterColisResult;
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
    
    // Check for success
    if (parsedData && parsedData.result_type === 'success') {
      console.log('Colis added successfully:', parsedData);
      return NextResponse.json({
        success: true,
        data: parsedData,
        message: 'Colis ajouté avec succès!'
      });
    }
    
    // If we get here, something unexpected happened
    console.warn('Unexpected response format:', responseData);
    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Colis added (response unclear)'
    });
  } catch (error: any) {
    console.error('Error adding colis:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to add colis'
      },
      { status: 500 }
    );
  }
}

