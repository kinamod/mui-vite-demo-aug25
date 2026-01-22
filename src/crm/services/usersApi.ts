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

/**
 * User Location Interface
 * Contains address and geographical information for a user
 */
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

/**
 * User Name Interface
 * Contains the user's title and full name
 */
export interface UserName {
  title: string; // e.g., "Mr", "Ms", "Mrs", "Dr"
  first: string; // First name
  last: string; // Last name
}

/**
 * User Login Interface
 * Contains authentication and identification information
 */
export interface UserLogin {
  uuid: string; // Unique identifier for the user
  username: string; // Username for login
  password?: string; // Password (optional, usually not returned from API)
}

/**
 * User Date of Birth Interface
 * Contains birth date and calculated age
 */
export interface UserDob {
  date: string; // ISO date string
  age: number; // Calculated age in years
}

/**
 * User Registration Interface
 * Contains registration date and account age
 */
export interface UserRegistered {
  date: string; // ISO date string when user registered
  age: number; // Account age in years
}

/**
 * User Picture Interface
 * Contains URLs to different sizes of user profile pictures
 */
export interface UserPicture {
  large: string; // URL to large profile picture
  medium: string; // URL to medium profile picture
  thumbnail: string; // URL to thumbnail profile picture
}

/**
 * Main User Interface
 * Represents a complete user object from the Users API
 */
export interface User {
  login: UserLogin; // Login and identification info
  name: UserName; // User's full name
  gender: string; // Gender (e.g., "male", "female")
  location: UserLocation; // Address and location info
  email: string; // Email address
  dob: UserDob; // Date of birth and age
  registered: UserRegistered; // Registration date and account age
  phone: string; // Phone number
  cell: string; // Mobile/cell phone number
  picture: UserPicture; // Profile picture URLs
  nat: string; // Nationality code
}

/**
 * Users API Response Interface
 * Structure of the response when fetching a list of users
 */
export interface UsersResponse {
  page: number; // Current page number
  perPage: number; // Number of items per page
  total: number; // Total number of users matching the query
  span: string; // Time span filter ("week" or "month")
  effectivePage: number; // Actual page returned (may differ from requested)
  data: User[]; // Array of user objects
}

/**
 * Users Query Parameters Interface
 * Optional parameters for filtering and paginating user queries
 */
export interface UsersQueryParams {
  page?: number; // Page number (default: 1)
  perPage?: number; // Results per page (default: 10, we use 20)
  search?: string; // Search query for filtering by name, email, or city
  sortBy?: string; // Field to sort by (e.g., "name.first", "dob.age")
  span?: "week" | "month"; // Time span view
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
