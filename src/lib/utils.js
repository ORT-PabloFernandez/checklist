'use client';

import { jwtDecode } from 'jwt-decode';

/**
 * General utility functions for the application
 */

/**
 * Converts a string to slug format (kebab-case)
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * Converts a string to kebab-case
 * @param {string} str - String to convert
 * @returns {string} Kebab-cased string
 */
export function kebabCase(str) {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map(x => x.toLowerCase())
    ?.join('-') || '';
}

/**
 * Get current ISO formatted date-time
 * @returns {string} Current date-time in ISO format
 */
export function nowIso() {
  return new Date().toISOString();
}

/**
 * Format a date to a human-readable format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) return 'Fecha inválida';
  
  return new Intl.DateTimeFormat('es', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d);
}

/**
 * Format a date to a short format (DD/MM/YYYY)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatShortDate(date) {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) return 'Fecha inválida';
  
  return d.toLocaleDateString('es', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Format a datetime to include time
 * @param {string|Date} datetime - Datetime to format
 * @returns {string} Formatted datetime
 */
export function formatDateTime(datetime) {
  if (!datetime) return '';
  
  const d = datetime instanceof Date ? datetime : new Date(datetime);
  
  if (isNaN(d.getTime())) return 'Fecha inválida';
  
  return d.toLocaleDateString('es', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Check if a date is overdue (passed)
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export function isOverdue(date) {
  if (!date) return false;
  
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();
  
  // Set time to midnight for proper comparison
  today.setHours(0, 0, 0, 0);
  
  return d < today;
}

/**
 * Convert assignment priority to display text
 * @param {string} priority - Priority code
 * @returns {string} Display text
 */
export function formatPriority(priority) {
  switch(priority?.toLowerCase()) {
    case 'alta':
      return 'Alta';
    case 'media':
      return 'Media';
    case 'baja':
      return 'Baja';
    default:
      return 'No definida';
  }
}

/**
 * Format assignment status for display
 * @param {string} status - Status code
 * @param {string|Date} dueDate - Due date for overdue check
 * @returns {Object} Formatted status with text and color class
 */
export function formatStatus(status, dueDate) {
  // Check for overdue first
  if (dueDate && isOverdue(dueDate) && status !== 'aprobada') {
    return { text: 'Vencida', class: 'text-red-600 font-bold' };
  }
  
  switch(status?.toLowerCase()) {
    case 'asignada':
      return { text: 'Asignada', class: 'text-blue-500' };
    case 'en ejecución':
    case 'en ejecucion':
      return { text: 'En ejecución', class: 'text-amber-500' };
    case 'enviada':
    case 'en revisión':
    case 'en revision':
      return { text: 'En revisión', class: 'text-violet-500' };
    case 'aprobada':
      return { text: 'Aprobada', class: 'text-green-600' };
    case 'rechazada':
      return { text: 'Rechazada', class: 'text-red-500' };
    default:
      return { text: 'Desconocido', class: 'text-gray-500' };
  }
}

/**
 * Generate a simple yet unique ID without external dependencies
 * @returns {string} Unique ID
 */
export function generateId() {
  return crypto.randomUUID ? 
    crypto.randomUUID() : 
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}


/**
 * Decode a JWT token using jwt-decode library
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function decodeJWT(token) {
  if (!token) return null;
  
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}