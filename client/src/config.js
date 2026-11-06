/**
 * Vite exposes env vars prefixed with VITE_ to the client bundle.
 * See client/.env.example
 */
const raw = import.meta.env.VITE_API_BASE_URL ?? 'https://dalle-4yj8.onrender.com';

export const API_BASE_URL = raw.replace(/\/$/, '');
