import api from "./apiHandler";

// Generic wrapper around axios
export async function httpPost<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload
): Promise<TResponse> {
  const response = await api.post<TResponse>(url, payload);
  return response.data;
}

export async function httpGet<TResponse>(url: string): Promise<TResponse> {
  const response = await api.get<TResponse>(url);
  return response.data;
}

export async function httpDelete<TResponse>(url: string): Promise<TResponse> {
  const response = await api.delete<TResponse>(url);
  return response.data;
}

export async function httpPut<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload
): Promise<TResponse> {
  const response = await api.put<TResponse>(url, payload);
  return response.data;
}

export async function httpPatch<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload
): Promise<TResponse> {
  const response = await api.patch<TResponse>(url, payload);
  return response.data;
}
