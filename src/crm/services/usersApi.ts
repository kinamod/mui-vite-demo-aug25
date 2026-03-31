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

export interface UsersResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

export const usersApi = {
  async getUsers(params: {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
  }): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.perPage) queryParams.append("perPage", params.perPage.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);

    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  },

  async getUser(id: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    return response.json();
  },

  async updateUser(id: string, data: Partial<User>): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    return response.json();
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    return response.json();
  },
};
