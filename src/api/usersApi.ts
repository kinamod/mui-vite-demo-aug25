/**
 * Users API Module
 *
 * Provides TypeScript interfaces and functions for interacting with the Users API.
 * API Documentation: https://user-api.builder-io.workers.dev/api
 *
 * Features:
 * - List users with pagination, search, and sorting
 * - Get individual user details
 * - Update user information
 * - Delete users
 *
 * All functions include proper error handling and return typed responses.
 */

/** Base URL for the Users API (internal Builder.io service) */
const API_BASE_URL = 'https://user-api.builder-io.workers.dev/api';

/**
 * User interface representing a complete user object from the API
 * Matches the structure returned by the Users API endpoint
 */
export interface User {
  /** Login credentials and unique identifier */
  login: {
    /** Unique user identifier (used for updates/deletes) */
    uuid: string;
    /** User's username */
    username: string;
    /** User's password (optional, typically not returned) */
    password?: string;
  };
  /** User's name information */
  name: {
    /** Title (Mr, Ms, Mrs, etc.) */
    title: string;
    /** First name */
    first: string;
    /** Last name */
    last: string;
  };
  /** Gender identifier */
  gender: string;
  /** Location and address information */
  location: {
    /** Street address details */
    street: {
      /** Street number */
      number: number;
      /** Street name */
      name: string;
    };
    /** City name */
    city: string;
    /** State or province */
    state: string;
    /** Country name */
    country: string;
    /** Postal code */
    postcode: string;
    /** Geographic coordinates (optional) */
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    /** Timezone information (optional) */
    timezone?: {
      /** UTC offset (e.g., "-05:00") */
      offset: string;
      /** Timezone description */
      description: string;
    };
  };
  /** Email address */
  email: string;
  /** Date of birth information */
  dob: {
    /** Birth date as ISO string */
    date: string;
    /** Calculated age in years */
    age: number;
  };
  /** Registration information */
  registered: {
    /** Registration date as ISO string */
    date: string;
    /** Years since registration */
    age: number;
  };
  /** Phone number */
  phone: string;
  /** Cell/mobile number */
  cell: string;
  /** Profile pictures (optional) */
  picture?: {
    /** Large profile picture URL */
    large: string;
    /** Medium profile picture URL */
    medium: string;
    /** Thumbnail profile picture URL */
    thumbnail: string;
  };
  /** Nationality code */
  nat: string;
}

/**
 * Response structure for the list users endpoint
 * Includes pagination metadata and user data array
 */
export interface UsersResponse {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of results per page */
  perPage: number;
  /** Total number of users matching the query */
  total: number;
  /** Time span view ("week" or "month") */
  span: string;
  /** Effective page after span calculation */
  effectivePage: number;
  /** Array of user objects */
  data: User[];
}

/**
 * Parameters for listing users
 * All parameters are optional and have server-side defaults
 */
export interface ListUsersParams {
  /** Page number to fetch (default: 1) */
  page?: number;
  /** Number of results per page (default: 10) */
  perPage?: number;
  /** Search query for filtering by name, email, or city */
  search?: string;
  /** Field to sort results by (e.g., "name.first", "dob.age") */
  sortBy?: string;
  /** Time span view: "week" or "month" (affects page offset) */
  span?: string;
}

/**
 * Fetches a paginated list of users from the API
 *
 * @param params - Optional parameters for pagination, search, and sorting
 * @returns Promise resolving to UsersResponse with pagination metadata and user data
 * @throws Error if the API request fails
 *
 * @example
 * // Fetch first page with default settings (10 users)
 * const response = await listUsers();
 *
 * @example
 * // Fetch page 2 with 20 users, filtered by search
 * const response = await listUsers({
 *   page: 2,
 *   perPage: 20,
 *   search: 'john'
 * });
 *
 * @example
 * // Sort by age
 * const response = await listUsers({
 *   sortBy: 'dob.age'
 * });
 */
export async function listUsers(params: ListUsersParams = {}): Promise<UsersResponse> {
  // Build query string from parameters
  // Only includes parameters that are provided (not undefined)
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.perPage) queryParams.append('perPage', params.perPage.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.span) queryParams.append('span', params.span);

  // Make GET request to /users endpoint
  const response = await fetch(`${API_BASE_URL}/users?${queryParams.toString()}`);

  // Check for HTTP errors (4xx, 5xx status codes)
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  // Parse and return JSON response
  return response.json();
}

/**
 * Fetches a single user by their UUID, username, or email
 *
 * @param id - User UUID, username, or email address
 * @returns Promise resolving to the User object
 * @throws Error if the user is not found or the request fails
 *
 * @example
 * // Fetch by UUID
 * const user = await getUser('test-uuid-1');
 *
 * @example
 * // Fetch by username
 * const user = await getUser('testuser1');
 *
 * @example
 * // Fetch by email
 * const user = await getUser('john.doe@example.com');
 */
export async function getUser(id: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Updates an existing user's information
 *
 * Uses PUT method to update user fields. Only provided fields will be updated.
 * The API preserves nested object structure, so you can update partial nested data.
 *
 * @param id - User UUID, username, or email to identify the user
 * @param data - Partial user object with fields to update
 * @returns Promise resolving to success response
 * @throws Error if the update fails or user is not found
 *
 * @example
 * // Update user's name
 * await updateUser('user-uuid', {
 *   name: {
 *     first: 'Jane',
 *     last: 'Doe',
 *     title: 'Ms'
 *   }
 * });
 *
 * @example
 * // Update email and city
 * await updateUser('testuser1', {
 *   email: 'newemail@example.com',
 *   location: {
 *     ...user.location,
 *     city: 'New York'
 *   }
 * });
 */
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

/**
 * Deletes a user from the system
 *
 * @param id - User UUID, username, or email to identify the user
 * @returns Promise resolving to success response
 * @throws Error if the deletion fails or user is not found
 *
 * @example
 * // Delete user by UUID
 * await deleteUser('user-uuid');
 *
 * @example
 * // Delete user by username
 * await deleteUser('testuser1');
 *
 * WARNING: This operation cannot be undone. Use with caution.
 */
export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.statusText}`);
  }

  return response.json();
}
