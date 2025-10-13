export interface User {
  login: {
    uuid: string;
    username: string;
    password: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  gender: string;
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    timezone: {
      offset: string;
      description: string;
    };
  };
  email: string;
  dob: {
    date: string;
    age: number;
  };
  registered: {
    date: string;
    age: number;
  };
  phone: string;
  cell: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}

export interface UsersResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

export interface UserCreateRequest {
  email: string;
  login: {
    username: string;
    password?: string;
  };
  name: {
    first: string;
    last: string;
    title?: string;
  };
  gender?: string;
  location?: {
    street?: {
      number: number;
      name: string;
    };
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface UserUpdateRequest {
  name?: {
    first?: string;
    last?: string;
    title?: string;
  };
  email?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  uuid?: string;
  data?: T;
}

const BASE_URL = 'https://user-api.builder-io.workers.dev/api';

class UsersApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      } catch {
        errorMessage = `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  }

  async getUsers({
    page = 1,
    perPage = 20,
    search = '',
    sortBy = 'name.first',
    span = 'week'
  }: {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    span?: string;
  } = {}): Promise<UsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: perPage.toString(),
      ...(search && { search }),
      sortBy,
      span
    });

    const response = await fetch(`${BASE_URL}/users?${params}`);
    return this.handleResponse<UsersResponse>(response);
  }

  async getUser(id: string): Promise<User> {
    const response = await fetch(`${BASE_URL}/users/${encodeURIComponent(id)}`);
    return this.handleResponse<User>(response);
  }

  async createUser(userData: UserCreateRequest): Promise<ApiResponse> {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return this.handleResponse<ApiResponse>(response);
  }

  async updateUser(id: string, userData: UserUpdateRequest): Promise<ApiResponse> {
    const response = await fetch(`${BASE_URL}/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return this.handleResponse<ApiResponse>(response);
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    const response = await fetch(`${BASE_URL}/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return this.handleResponse<ApiResponse>(response);
  }
}

export const usersApiService = new UsersApiService();
