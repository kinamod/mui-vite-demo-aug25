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
 *
 * This is the primary function for retrieving user data. It supports:
 * - Pagination with customizable page size
 * - Search filtering by name, email, or city
 * - Sorting by various fields
 *
 * @param {UsersQueryParams} params - Optional query parameters
 * @param {number} params.page - Page number (1-indexed, default: 1)
 * @param {number} params.perPage - Results per page (default: 20)
 * @param {string} params.search - Search query string (filters by name, email, city)
 * @param {string} params.sortBy - Field to sort by (default: "name.first")
 *
 * @returns {Promise<UsersResponse>} Response object containing users array and pagination info
 * @throws {Error} If the API request fails
 *
 * @example
 * ```typescript
 * // Fetch first page with default settings
 * const response = await fetchUsers();
 *
 * // Fetch with search
 * const response = await fetchUsers({ search: "john", page: 1, perPage: 20 });
 * ```
 */
export async function fetchUsers(
  params: UsersQueryParams = {},
): Promise<UsersResponse> {
  // Destructure parameters with defaults
  const { page = 1, perPage = 20, search = "", sortBy = "name.first" } = params;

  // Build query parameters for the URL
  const queryParams = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    sortBy,
  });

  // Only add search parameter if it's not empty
  if (search) {
    queryParams.append("search", search);
  }

  // Construct the full API URL
  const url = `${API_BASE_URL}/users?${queryParams.toString()}`;

  // Make the API request
  const response = await fetch(url);

  // Check if the request was successful
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  // Parse and return the JSON response
  return response.json();
}

/**
 * Get a single user by UUID, username, or email
 *
 * Retrieves detailed information for a specific user using any of their
 * unique identifiers.
 *
 * @param {string} id - User's UUID, username, or email address
 * @returns {Promise<User>} The complete user object
 * @throws {Error} If the user is not found or the API request fails
 *
 * @example
 * ```typescript
 * // Fetch by UUID
 * const user = await fetchUser("5ed11219-7df8-4f14-b55e-bbcab4030f0a");
 *
 * // Fetch by username
 * const user = await fetchUser("johndoe");
 *
 * // Fetch by email
 * const user = await fetchUser("john@example.com");
 * ```
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
 *
 * Updates one or more fields of an existing user. Only the provided fields
 * will be updated; other fields remain unchanged.
 *
 * @param {string} id - User's UUID, username, or email address
 * @param {Partial<User>} data - Object containing the fields to update
 * @returns {Promise<{success: boolean, message: string}>} Success status and message
 * @throws {Error} If the update fails or user is not found
 *
 * @example
 * ```typescript
 * // Update user's name
 * await updateUser("johndoe", {
 *   name: { first: "John", last: "Doe", title: "Mr" }
 * });
 *
 * // Update multiple fields
 * await updateUser("johndoe", {
 *   email: "newemail@example.com",
 *   location: { ...location, city: "New York" }
 * });
 * ```
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
 *
 * Creates a new user in the system. Required fields are:
 * - email
 * - login.username
 * - name.first
 * - name.last
 *
 * @param {Partial<User>} data - User data object (must include required fields)
 * @returns {Promise<{success: boolean, uuid: string, message: string}>}
 *   Success status, generated UUID, and message
 * @throws {Error} If required fields are missing or creation fails
 *
 * @example
 * ```typescript
 * const result = await createUser({
 *   email: "newuser@example.com",
 *   login: { username: "newuser" },
 *   name: { first: "New", last: "User", title: "Mr" },
 *   gender: "male"
 * });
 * console.log(result.uuid); // Generated UUID for the new user
 * ```
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
 *
 * Permanently removes a user from the system.
 * This action cannot be undone.
 *
 * @param {string} id - User's UUID, username, or email address
 * @returns {Promise<{success: boolean, message: string}>} Success status and message
 * @throws {Error} If the user is not found or deletion fails
 *
 * @example
 * ```typescript
 * await deleteUser("johndoe");
 * // User is permanently deleted
 * ```
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
