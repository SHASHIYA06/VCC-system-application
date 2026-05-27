const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

export async function getStats() {
  try {
    return await fetchAPI('/api/stats');
  } catch {
    return null;
  }
}

export async function getCarTypes() {
  try {
    return await fetchAPI('/api/cars?stats=true');
  } catch {
    return null;
  }
}

export async function getSystems() {
  try {
    return await fetchAPI('/api/systems');
  } catch {
    return null;
  }
}

export async function getDrawings(params?: { car?: string; system?: string }) {
  try {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return await fetchAPI(`/api/drawings?${query}`);
  } catch {
    return null;
  }
}

export async function getEquipment(params?: { car?: string; system?: string; connectors?: boolean }) {
  try {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return await fetchAPI(`/api/equipment?${query}`);
  } catch {
    return null;
  }
}

export async function getWires(params?: { search?: string; voltage?: string; limit?: number }) {
  try {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return await fetchAPI(`/api/wires?${query}`);
  } catch {
    return null;
  }
}

export async function getWireDetails(wireNo: string) {
  try {
    return await fetchAPI(`/api/wires/${encodeURIComponent(wireNo)}`);
  } catch {
    return null;
  }
}

export async function getTrainlines() {
  try {
    return await fetchAPI('/api/trainlines');
  } catch {
    return null;
  }
}

export async function getTrainlineDetails(trainlineNo: number) {
  try {
    return await fetchAPI(`/api/trainlines/${trainlineNo}`);
  } catch {
    return null;
  }
}

export async function getTCMS() {
  try {
    return await fetchAPI('/api/tcms');
  } catch {
    return null;
  }
}

export async function getConnectors(params?: { equipment?: string }) {
  try {
    const query = params ? new URLSearchParams(params).toString() : '';
    return await fetchAPI(`/api/connectors?${query}`);
  } catch {
    return null;
  }
}

export async function getSearch(query: string, type?: string, car?: string) {
  try {
    const params = new URLSearchParams({ q: query, ...(type && { type }), ...(car && { car }) }).toString();
    return await fetchAPI(`/api/search?${params}`);
  } catch {
    return null;
  }
}

export default {
  getStats,
  getCarTypes,
  getSystems,
  getDrawings,
  getEquipment,
  getWires,
  getWireDetails,
  getTrainlines,
  getTrainlineDetails,
  getTCMS,
  getConnectors,
  getSearch,
};