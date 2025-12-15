import soap from 'soap';

let cachedClient: any = null;

export async function getSOAPClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.COLISSIMO_WSDL_URL;
  
  if (!url) {
    throw new Error('COLISSIMO_WSDL_URL environment variable is not set');
  }
  
  try {
    const client = await soap.createClientAsync(url);
    
    const username = process.env.COLISSIMO_USERNAME || '';
    const password = process.env.COLISSIMO_PASSWORD || '';
    
    // Add authentication header with proper namespace
    client.addSoapHeader({
      AuthHeader: {
        Uilisateur: username,
        Pass: password
      }
    }, '', 'tns', 'http://tempuri.org/');
    
    
    
    cachedClient = client;
    console.log(client);
    console.log(client.describe());
    return client;
  } catch (error) {
    console.error('Failed to create SOAP client:', error);
    throw new Error('Failed to connect to Colissimo API');
  }
}

export function clearClientCache() {
  cachedClient = null;
}

