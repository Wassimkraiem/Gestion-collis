import { Colis } from '@/types/colissimo';

/**
 * Parse SOAP API response to extract colis array
 * SOAP responses can have various nested structures
 */
export function parseColisResponse(data: any): Colis[] {
  if (!data) {
    return [];
  }

  // If it's already an array, return it
  if (Array.isArray(data)) {
    return data;
  }

  // If it's an object, try to extract the array from various possible properties
  if (typeof data === 'object') {
    // First check if ListeColisResult exists and is an object with result_type
    if (data.ListeColisResult) {
      const result = data.ListeColisResult;
      
      // Check if it's an error response
      if (result.result_type === 'erreur') {
        console.error('API Error:', result);
        return [];
      }
      
      // Check if it has a success result with data
      if (result.result_type === 'success' || result.result_type === 'succes') {
        // Check result_content first (most common structure)
        if (result.result_content) {
          // If result_content.colis is an array
          if (Array.isArray(result.result_content.colis)) {
            return result.result_content.colis;
          }
          // If result_content itself is an array
          if (Array.isArray(result.result_content)) {
            return result.result_content;
          }
        }
        // Fallback checks
        if (Array.isArray(result.data)) {
          return result.data;
        }
        if (Array.isArray(result.colis)) {
          return result.colis;
        }
      }
      
      // If ListeColisResult is an array directly
      if (Array.isArray(result)) {
        return result;
      }
    }
    
    // Common SOAP response structures
    const possibleArrays = [
      data.colis,
      data.RechercherColisResult,
      data.return,
      data.result,
      data.data,
      data.items,
      data.list,
    ];

    for (const possibleArray of possibleArrays) {
      if (Array.isArray(possibleArray)) {
        return possibleArray;
      }
      
      // Check if it's an object with result_content
      if (possibleArray && typeof possibleArray === 'object') {
        if (possibleArray.result_type === 'success' || possibleArray.result_type === 'succes') {
          if (Array.isArray(possibleArray.result_content)) {
            return possibleArray.result_content;
          }
        }
      }
    }

    // Sometimes SOAP returns a single object instead of an array
    // Check if the data itself looks like a Colis object
    if (data.reference || data.client || data.id) {
      return [data];
    }

    // Try to find any property that is an array
    for (const key in data) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
  }

  // If we couldn't find an array, return empty array
  return [];
}

/**
 * Parse single colis detail response
 */
export function parseColisDetail(data: any): Colis | null {
  if (!data) {
    return null;
  }

  // If it's directly a colis object
  if (typeof data === 'object' && (data.reference || data.client || data.id)) {
    return data;
  }

  // Try common response structures
  const possibleColis = [
    data.colis,
    data.DetailColisResult,
    data.return,
    data.result,
    data.data,
  ];

  for (const possible of possibleColis) {
    if (possible && typeof possible === 'object') {
      return possible;
    }
  }

  return null;
}

