import { NextRequest, NextResponse } from 'next/server';
import { getSOAPClient } from '@/lib/soap-client';

export async function GET(request: NextRequest) {
  try {
    const client = await getSOAPClient();
    
    // Get all available methods
    const methods = Object.keys(client).filter(key => typeof client[key] === 'function');
    
    // Get the WSDL description
    const description = client.describe();
    
    return NextResponse.json({
      success: true,
      methods: methods,
      description: description
    });
  } catch (error: any) {
    console.error('Error getting SOAP methods:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get SOAP methods'
      },
      { status: 500 }
    );
  }
}

