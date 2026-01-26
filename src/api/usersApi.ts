const API_BASE_URL = 'https://user-api.builder-io.workers.dev/api';

export interface UserName {
  title: string;
  first: string;
  last: string;
}

export interface UserLocation {
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
}

export interface UserDOB {
  date: string;
  age: number;
}

export interface UserRegistered {
  date: string;
  age: number;
}

export interface UserLogin {
  uuid: string;
  username: string;
  password: string;
}

export interface UserPicture {
  large: string;
  medium: string;
  thumbnail: string;
}

export interface User {
  login: UserLogin;
  name: UserName;
  gender: string;
  location: UserLocation;
  email: string;
  dob: UserDOB;
  registered: UserRegistered;
  phone: string;
  cell: string;
  picture: UserPicture;
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

interface FetchOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

export async function fetchUsers(options: FetchOptions = {}): Promise<UsersResponse> {
  const params = new URLSearchParams();
  
  if (options.page !== undefined) {
    params.append('page', options.page.toString());
  }
  if (options.perPage !== undefined) {
    params.append('perPage', options.perPage.toString());
  }
  if (options.search) {
    params.append('search', options.search);
  }
  if (options.sortBy) {
    params.append('sortBy', options.sortBy);
  }
  
  const url = `${API_BASE_URL}/users${params.size > 0 ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  
  return response.json();
}

export async function updateUser(id: string, data: Partial<User>): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`);
  }
  
  return response.json();
}

export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.statusText}`);
  }
  
  return response.json();
}

export async function createUser(data: Partial<User>): Promise<{ success: boolean; uuid: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.statusText}`);
  }
  
  return response.json();
}
