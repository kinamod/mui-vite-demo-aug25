export type User = {
  login: { uuid?: string; username: string; password?: string };
  name: { title?: string; first: string; last: string };
  gender?: string;
  location?: {
    street?: { number?: number; name?: string };
    city?: string;
    state?: string;
    country?: string;
    postcode?: string | number;
    coordinates?: { latitude?: number | string; longitude?: number | string };
    timezone?: { offset?: string; description?: string };
  };
  email: string;
  dob?: { date?: string; age?: number };
  registered?: { date?: string; age?: number };
  phone?: string;
  cell?: string;
  picture?: { large?: string; medium?: string; thumbnail?: string };
  nat?: string;
};

export type UsersListResponse = {
  page: number;
  perPage: number;
  total: number;
  span?: string;
  effectivePage?: number;
  data: User[];
};

const BASE_URL = "https://user-api.builder-io.workers.dev/api";

export async function listUsers(params: {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  span?: "week" | "month";
} = {}): Promise<UsersListResponse> {
  const url = new URL(`${BASE_URL}/users`);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.perPage) url.searchParams.set("perPage", String(params.perPage));
  if (params.search) url.searchParams.set("search", params.search);
  if (params.sortBy) url.searchParams.set("sortBy", params.sortBy);
  if (params.span) url.searchParams.set("span", params.span);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Failed to fetch users: ${res.status}`);
  }
  return res.json();
}

export async function updateUser(id: string, payload: Partial<User>): Promise<{ success: boolean; message?: string }>{
  const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) {
    throw new Error((json as any).error || `Failed to update user: ${res.status}`);
  }
  return json as { success: boolean; message?: string };
}
