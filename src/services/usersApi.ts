// Users API Service
// Base URL: https://user-api.builder-io.workers.dev/api

const BASE_URL = "https://user-api.builder-io.workers.dev/api";

export interface UserLocation {
  street: {
    number: number;
    name: string;
  };
  city: string;
  state: string;
  country: string;
  postcode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone?: {
    offset: string;
    description: string;
  };
}

export interface UserName {
  title: string;
  first: string;
  last: string;
}

export interface UserLogin {
  uuid: string;
  username: string;
  password: string;
}

export interface UserDob {
  date: string;
  age: number;
}

export interface UserRegistered {
  date: string;
  age: number;
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
  dob: UserDob;
  registered: UserRegistered;
  phone: string;
  cell: string;
  picture: UserPicture;
  nat: string;
}

export interface UsersListResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

export interface GetUsersParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  span?: string;
}

export interface CreateUserData {
  email: string;
  login: {
    username: string;
    password?: string;
  };
  name: UserName;
  gender?: string;
  location?: Partial<UserLocation>;
}

export interface UpdateUserData {
  name?: Partial<UserName>;
  email?: string;
  location?: Partial<UserLocation>;
  gender?: string;
  phone?: string;
  cell?: string;
}

class UsersApiService {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getUsers(params: GetUsersParams = {}): Promise<UsersListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.perPage) queryParams.append("perPage", params.perPage.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.span) queryParams.append("span", params.span);

    const url = `${this.baseUrl}/users?${queryParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserById(id: string): Promise<User> {
    const url = `${this.baseUrl}/users/${id}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return response.json();
  }

  async createUser(userData: CreateUserData): Promise<{ success: boolean; uuid: string; message: string }> {
    const url = `${this.baseUrl}/users`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    return response.json();
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<{ success: boolean; message: string }> {
    const url = `${this.baseUrl}/users/${id}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const url = `${this.baseUrl}/users/${id}`;
    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }

    return response.json();
  }
}

export const usersApi = new UsersApiService();
