import axios from 'axios';

const gatewayApi = axios.create({
  baseURL: import.meta.env.VITE_GATEWAY_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetcher = async <T>(url: string): Promise<T> => {
  try {
    const response = await gatewayApi.get<T>(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // You can add more specific error handling here
      throw new Error(error.response?.data?.message || error.message);
    }
    throw new Error('An unknown error occurred');
  }
};
