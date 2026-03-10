// src/lib/auth.ts
import api from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function register(email: string, password: string, fullName: string): Promise<{ token: string; user: User }> {
  const res = await api.post('/auth/register', { email, password, fullName });
  return res.data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function getUser(): User | null {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}