import { NextRequest, NextResponse } from 'next/server';
import { ColisFormData } from '@/types/colissimo';

/**
 * API Route: Bulk Import Colis
 * Calls the REST API AjoutVMultiple endpoint to create multiple colis at once
 */
export async function POST(request: NextRequest) {
  try {
    const { listColis } = await request.json();

    if (!Array.isArray(listColis) || listColis.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'La liste des colis est vide ou invalide'
        },
        { status: 400 }
      );
    }

    if (listColis.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le nombre maximum de colis par import est de 50'
        },
        { status: 400 }
      );
    }

    // Call the REST API
    const apiUrl = 'https://delivery.colissimo.com.tn/api/api.v1/StColis/AjoutVMultiple';
    
    const payload = {
      Uilisateur: process.env.COLISSIMO_USERNAME,
      Pass: process.env.COLISSIMO_PASSWORD,
      listColis: listColis.map((colis: ColisFormData) => ({
        reference: colis.reference || '',
        client: colis.client,
        adresse: colis.adresse,
        gouvernorat: colis.gouvernorat,
        ville: colis.ville,
        nb_pieces: colis.nb_pieces || 1,
        prix: colis.prix || 0,
        tel1: colis.tel1,
        tel2: colis.tel2 || '',
        designation: colis.designation || '',
        commentaire: colis.commentaire || '',
        type: colis.type || 'VO',
        echange: colis.echange || 0
      }))
    };

    console.log('Calling REST API for bulk import:', { count: listColis.length });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    console.log('Bulk import API response:', result);

    if (result.result_type === 'success' || result.result_type === 'partial_success') {
      const content = result.result_content;
      
      return NextResponse.json({
        success: true,
        data: {
          nbCrees: content.nbCrees || 0,
          nbTotal: content.nbTotal || 0,
          lsCrees: content.lsCrees || [],
          lsErreurs: content.lsErreurs || [],
          type: result.result_type
        }
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Erreur API: ${result.result_code} - ${result.result_content}`
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error in bulk import:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de l\'importation'
      },
      { status: 500 }
    );
  }
}


