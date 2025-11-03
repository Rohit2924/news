interface ApiResponse<T> {
  data: T;
  error?: string;
}

export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: 'include', // This is important for handling cookies
    ...options,
  };

  try {
    const response = await fetch(endpoint, defaultOptions);
    
    if (response.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login?expired=true';
      throw new Error('Unauthorized access');
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      data: data.data || data,
      error: data.error
    };

  } catch (error) {
    console.error('API Error:', error);
    return{
      data: null as T,
      error: error instanceof Error ? error.message : 'API call failed'
    };
  }
};