/**
 * Users API Service
 *
 * This module provides functions for interacting with the Users API.
 * The API provides CRUD operations for user management.
 *
 * API Documentation: https://user-api.builder-io.workers.dev/api
 *
 * Features:
 * - Fetch users with pagination and search
 * - Get individual user by ID/username/email
 * - Update user information
 * - Create new users
 * - Delete users
 *
 * All functions include proper error handling and type safety.
 */

// API Base URL - hosted on Cloudflare Workers
const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

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
  password?: string;
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

export interface UsersResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

export interface UsersQueryParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  span?: "week" | "month";
}

/**
 * Fetch users from the Users API with pagination and search
 */
export async function fetchUsers(
  params: UsersQueryParams = {},
): Promise<UsersResponse> {
  const { page = 1, perPage = 20, search = "", sortBy = "name.first" } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    sortBy,
  });

  if (search) {
    queryParams.append("search", search);
  }

  const url = `${API_BASE_URL}/users?${queryParams.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a single user by UUID, username, or email
 */
export async function fetchUser(id: string): Promise<User> {
  const url = `${API_BASE_URL}/users/${id}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update a user's information
 */
export async function updateUser(
  id: string,
  data: Partial<User>,
): Promise<{ success: boolean; message: string }> {
  const url = `${API_BASE_URL}/users/${id}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new user
 */
export async function createUser(
  data: Partial<User>,
): Promise<{ success: boolean; uuid: string; message: string }> {
  const url = `${API_BASE_URL}/users`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a user
 */
export async function deleteUser(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const url = `${API_BASE_URL}/users/${id}`;

  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.statusText}`);
  }

  return response.json();
}
