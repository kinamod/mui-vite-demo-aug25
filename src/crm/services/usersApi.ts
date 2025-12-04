/**
 * Users API Service
 *
 * This module provides integration with the Users API as specified in the PRD.
 * It handles fetching paginated user data, searching, and updating user information.
 *
 * API Documentation: https://user-api.builder-io.workers.dev/api
 */

/** Base URL for the Users API endpoint */
const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

/**
 * User interface representing the complete user object structure
 * returned from the Users API. This matches the API schema exactly.
 */
export interface User {
  /** Login credentials and unique identifier */
  login: {
    /** Unique identifier for the user */
    uuid: string;
    /** Username for login */
    username: string;
    /** Password (should be handled securely in production) */
    password: string;
  };
  /** User's full name information */
  name: {
    /** Title (Mr, Ms, Mrs, etc.) */
    title: string;
    /** First/given name */
    first: string;
    /** Last/family name */
    last: string;
  };
  /** User's gender */
  gender: string;
  /** Complete location information */
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
    /** State/province */
    state: string;
    /** Country name */
    country: string;
    /** Postal/zip code */
    postcode: string;
    /** Geographic coordinates (optional) */
    coordinates?: {
      /** Latitude coordinate */
      latitude: number;
      /** Longitude coordinate */
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
    /** Birth date in ISO format */
    date: string;
    /** Current age in years */
    age: number;
  };
  /** Registration information */
  registered: {
    /** Registration date in ISO format */
    date: string;
    /** Years since registration */
    age: number;
  };
  /** Primary phone number */
  phone: string;
  /** Cell/mobile phone number */
  cell: string;
  /** Profile picture URLs in various sizes */
  picture: {
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
 * Response structure from the Users API when fetching user lists
 * Includes pagination metadata and the actual user data
 */
export interface UsersResponse {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  perPage: number;
  /** Total number of users available */
  total: number;
  /** Time span view ("week" or "month") */
  span: string;
  /** Effective page number after adjustments */
  effectivePage: number;
  /** Array of user objects for the current page */
  data: User[];
}

/**
 * Users API client object
 * Provides methods for interacting with the Users API endpoints
 */
export const usersApi = {
  /**
   * Fetch a paginated list of users with optional search and sorting
   *
   * Per PRD section 3.1.2: Table displays 20 users by default
   * Per PRD section 3.1.3: Search functionality filters by user names
   *
   * @param params - Query parameters for the API request
   * @param params.page - Page number to fetch (default: 1)
   * @param params.perPage - Number of users per page (PRD specifies 20)
   * @param params.search - Search query to filter users by name, email, or city
   * @param params.sortBy - Field to sort results by (e.g., "name.first", "location.city")
   * @returns Promise resolving to UsersResponse with paginated user data
   * @throws Error if the API request fails
   */
  async getUsers(params: {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
  }): Promise<UsersResponse> {
    // Build query string from provided parameters
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.perPage)
      queryParams.append("perPage", params.perPage.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);

    // Make GET request to fetch users
    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return response.json();
  },

  /**
   * Update user information via PUT request
   *
   * Per PRD section 3.1.4: Each row has an "Edit" button that opens
   * a modal for editing user information, specifically the name field.
   *
   * @param userId - Unique identifier (UUID) of the user to update
   * @param data - Partial user data containing fields to update (currently supports name)
   * @param data.name - Name object with optional first and last name
   * @param data.name.first - Updated first name
   * @param data.name.last - Updated last name
   * @returns Promise that resolves when the update is successful
   * @throws Error if the API request fails
   */
  async updateUser(
    userId: string,
    data: { name?: { first?: string; last?: string } }
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to update user");
    }
  },
};
