import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Enrich Colis Details using REST API
 * Takes a list of code bars and returns detailed info from REST API v2
 * This is used to get livreur, tel_livreur, and dern_anomalie fields
 * that are not available in the SOAP API
 */
export async function POST(request: NextRequest) {
  try {
    const username = process.env.COLISSIMO_USERNAME;
    const password = process.env.COLISSIMO_PASSWORD;

    if (!username || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication credentials not configured' 
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { codeBars } = body;

    if (!codeBars || !Array.isArray(codeBars)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'codeBars must be an array' 
        },
        { status: 400 }
      );
    }

    // Filter out invalid code bars
    const validCodeBars = codeBars.filter(
      code => code && typeof code === 'string' && code.trim().length > 0
    );

    if (validCodeBars.length === 0) {
      // Return empty success if no valid code bars
      return NextResponse.json({
        success: true,
        data: {}
      });
    }

    // Join code bars with semicolon as required by the API
    const codeBarString = validCodeBars.join(';');
    
    // Call REST API v2 to get detailed info
    const response = await fetch(
      'https://delivery.colissimo.com.tn/api/api.v2/StColis/ListColis',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Uilisateur: username,
          Pass: password,
          codeBar: codeBarString,
        }),
      }
    );

    const data = await response.json();
    
    // Check for API errors
    if (data.result_type === 'erreur') {
      return NextResponse.json(
        {
          success: false,
          error: `API Error: ${data.result_code} - ${data.result_content}`
        },
        { status: 400 }
      );
    }

    // Extract colis array
    const enrichedColis = data.result_content?.colis || [];
    // console.log("enrichedColis", enrichedColis);
    // Create a map for easy lookup
    const enrichedMap: { [key: string]: any } = {};
    enrichedColis.forEach((colis: any) => {
      enrichedMap[colis.code] = {
        livreur: colis.livreur || '',
        tel_livreur: colis.tel_livreur || '',
        dern_anomalie: colis.dern_anomalie || null,
        date_enlevement: colis.date_enlevement || null,
        date_livraison: colis.date_livraison || null,
        frais_livraison: colis.frais_livraison || 0,
        frais_retour: colis.frais_retour || 0,
        };
      });
      
      return NextResponse.json({
      success: true,
      data: enrichedMap
    });
  } catch (error: any) {
    console.error('Error enriching colis details:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to enrich colis details'
      },
      { status: 500 }
    );
  }
}

