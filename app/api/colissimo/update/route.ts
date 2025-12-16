import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';
import { ColisFormData } from '@/types/colissimo';

export async function PUT(request: NextRequest) {
  try {
    const data: ColisFormData & { id: string } = await request.json();
    
    if (!data.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Colis ID is required'
        },
        { status: 400 }
      );
    }
    
    const colis = {
      id: data.id,
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
    
    const client = await getSOAPClient();
    const result = await client.ModifierColisAsync({ pic: JSON.stringify(colis) });
    
    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Colis updated successfully'
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

