import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Validate individual colis for pickup
 * Calls demanderEnlevement API to validate a single colis
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
    const { codeBar, bulk } = body;

    // For bulk validation, codeBar is not needed
    // The API validates all "En Attente" colis when called

    // Call demanderEnlevement API
    const response = await fetch(
      'https://delivery.colissimo.com.tn/api/api.v1/StColis/demanderEnlevement',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Uilisateur: username,
          Pass: password,
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

    // Return success with PDF URL if available
    return NextResponse.json({
      success: true,
      message: 'Colis validé avec succès',
      pdfUrl: data.result_content || null,
    });
  } catch (error: any) {
    console.error('Error validating colis:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to validate colis'
      },
      { status: 500 }
    );
  }
}

