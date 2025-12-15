import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';

// API route to fetch gouvernorats and villes
export async function GET(request: NextRequest) {
  try {
    const client = await getSOAPClient();
    
    // Call listGouvernorats
    const result = await client.listGouvernoratsAsync({});
    
    // Parse response
    let responseData = result[0];
    
    // If listGouvernoratsResult is a string, parse it
    if (responseData.listGouvernoratsResult && typeof responseData.listGouvernoratsResult === 'string') {
      try {
        responseData.listGouvernoratsResult = JSON.parse(responseData.listGouvernoratsResult);
      } catch (e) {
        console.error('Failed to parse listGouvernoratsResult:', e);
      }
    }
    
    let parsedData = responseData.listGouvernoratsResult;
    
    // If the result is still a string, parse it again
    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch (e) {
        console.error('Failed to parse gouvernorats data:', e);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to parse gouvernorats data'
          },
          { status: 500 }
        );
      }
    }
    
    // Check for errors
    if (parsedData && parsedData.result_type === 'erreur') {
      return NextResponse.json(
        {
          success: false,
          error: `API Error: ${parsedData.result_code} - ${parsedData.result_content}`
        },
        { status: 400 }
      );
    }
    
    // The data could be directly an array or wrapped in result_content
    let gouvernoratsData = Array.isArray(parsedData) ? parsedData : (parsedData?.result_content || []);
    
    // If result_content is still a string, parse it
    if (typeof gouvernoratsData === 'string') {
      try {
        gouvernoratsData = JSON.parse(gouvernoratsData);
      } catch (e) {
        console.error('Failed to parse result_content:', e);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to parse gouvernorats content'
          },
          { status: 500 }
        );
      }
    }
    
    // Return the gouvernorats list
    return NextResponse.json({
      success: true,
      data: Array.isArray(gouvernoratsData) ? gouvernoratsData : []
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


