import { Logger } from "winston";
import { log, Logging } from "../../config/logging";

export interface HttpRequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'; 
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

export const httpRequest = async (config: HttpRequestConfig) => {
  const { url, method, headers, body, params } = config;

  const queryParams = params ? new URLSearchParams(params).toString() : '';
  const requestUrl = queryParams ? `${url}?${queryParams}` : url;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    ...(body && method !== 'GET' ? { body: JSON.stringify(body) } : {}), // Include body if not a GET request
  };

  try {
    const response = await fetch(requestUrl, fetchOptions);

    if (!response.ok) {
      if(response.status === 500) {
        throw new Error("Failed to fetch data");
      }
      const errorText = await response.json();
      log.warn("Failed to fetching data", {response})
      return { code: response.status, response: errorText};
    }
    return { code: response.status, response: await response.json() };
  } catch (err: any) {
    throw err;
  }
};