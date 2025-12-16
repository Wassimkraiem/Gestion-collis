import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';

/**
 * API Route: Get list of gouvernorats with their villes
 * Calls listGouvernorats from Colissimo API
 */
export async function GET(request: NextRequest) {
  try {
    const client = await getSOAPClient();
    
    // listGouvernorats doesn't take any parameters, authentication is via SOAP headers
    const result = await client.listGouvernoratsAsync({});
    
    // Extract the result from SOAP response
    const soapResult = result[0];
    
    if (!soapResult || !soapResult.listGouvernoratsResult) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response from SOAP API'
        },
        { status: 500 }
      );
    }

    // Parse the outer JSON string from listGouvernoratsResult
    let parsedResult;
    try {
      parsedResult = JSON.parse(soapResult.listGouvernoratsResult);
    } catch (parseError) {
      console.error('Error parsing listGouvernoratsResult:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse API response'
        },
        { status: 500 }
      );
    }

    if (parsedResult.result_type === 'erreur') {
      return NextResponse.json(
        {
          success: false,
          error: `API Error: ${parsedResult.result_code} - ${parsedResult.result_content}`
        },
        { status: 400 }
      );
    }

    // Parse the inner result_content JSON string to get the actual gouvernorats array
    let gouvernorats = [];
    if (parsedResult.result_content) {
      try {
        gouvernorats = JSON.parse(parsedResult.result_content);
      } catch (parseError) {
        console.error('Error parsing result_content:', parseError);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to parse gouvernorats data'
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: gouvernorats,
    });
  } catch (error: any) {
    console.error('Error fetching gouvernorats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch gouvernorats'
      },
      { status: 500 }
    );
  }
}

