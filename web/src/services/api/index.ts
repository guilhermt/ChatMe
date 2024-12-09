/* eslint-disable no-param-reassign */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL,
});

const handleRequest = (config: InternalAxiosRequestConfig) => {
  const cookies = document.cookie.split('; ');

  const tokenCookie = cookies.find((token) => token.startsWith('accessToken'));

  const token = tokenCookie?.split('=').at(-1);

  config.headers.Authorization = `Bearer ${token}`;

  return config;
};

const handleResponse = (res: AxiosError) => {
  if (res.response?.status === 401) {
    const cookies = document.cookie.split(';');

    cookies.forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  }

  return Promise.reject(res);
};

api.interceptors.request.use(handleRequest);

api.interceptors.response.use(undefined, handleResponse);
