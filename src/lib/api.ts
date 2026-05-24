const BASE_URL = import.meta.env.VITE_GATEWAY_BASE_URL || 'http://localhost:8080';

export const fetcher = async <T>(url: string): Promise<T> => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let message = `HTTP error! Status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          message = errorData.message;
        }
      } catch {
        // Fallback if response is not JSON
      }
      throw new Error(message);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
};

export const postJson = async <TResp, TBody = unknown>(url: string, body: TBody): Promise<TResp> => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let message = `HTTP error! Status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          message = errorData.message;
        }
      } catch {
        // Fallback if response is not JSON
      }
      throw new Error(message);
    }

    return (await response.json()) as TResp;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
};
