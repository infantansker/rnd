
// src/config.js
const isProduction = process.env.NODE_ENV === 'production';

export const API_BASE = isProduction ? '/api' : 'http://localhost:5001';
