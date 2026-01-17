
import { Report } from '../types';

// In a real app, this would be an actual URL. 
// For this demo, we use a simulated delay to mimic network latency.
const API_BASE_URL = 'https://api.resilient-connect.example/v1';

/**
 * Simulates a backend request.
 */
const mockFetch = async (endpoint: string, options: RequestInit): Promise<any> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // 1 in 10 chance of server failure to test robustness
  if (Math.random() < 0.1) {
    throw new Error('Internal Server Error (Simulated)');
  }

  if (endpoint === '/reports' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    return { ...body, serverId: `srv_${Date.now()}` };
  }

  if (endpoint === '/reports' && options.method === 'GET') {
    // This is handled by retrieving both local and server data in the app
    return []; 
  }

  throw new Error('Not Found');
};

export const apiService = {
  async submitReport(report: Report): Promise<Report> {
    const response = await mockFetch('/reports', {
      method: 'POST',
      body: JSON.stringify(report),
      headers: { 'Content-Type': 'application/json' }
    });
    return response;
  }
};
