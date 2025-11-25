'use client';

/**
 * Utility for loading checklist data from JSON
 */

import { FIELD_TYPES } from '@/constants/fieldTypes';

/**
 * Loads the checklist package from the JSON file
 * @returns {Promise<Object>} The checklist package data
 */
export async function loadPackage() {
  try {
    const response = await fetch('/data/checklists_oilgas.json');
    if (!response.ok) {
      throw new Error(`Error loading checklists: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to load checklist package:', error);
    throw error;
  }
}

/**
 * Get a specific checklist by name
 * @param {string} name - The name of the checklist to find
 * @returns {Promise<Object|null>} The found checklist or null
 */
export async function getChecklistByName(name) {
  try {
    const data = await loadPackage();
    return data.checklists.find(
      (checklist) => checklist.nombre.toLowerCase() === name.toLowerCase()
    ) || null;
  } catch (error) {
    console.error(`Failed to get checklist by name "${name}":`, error);
    return null;
  }
}

/**
 * Get a specific checklist by slug
 * @param {string} slug - The slug of the checklist to find
 * @returns {Promise<Object|null>} The found checklist or null
 */
export async function getChecklistBySlug(slug) {
  try {
    // Verifica si es una tarea por el id ya que todas las tareas tienen un id y los checklists no
    if (slug.startsWith('task-')) {
      const taskId = slug.replace('task-', '');
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const task = tasks.find(t => t.id === taskId);
      // Si encuentra la tarea, la devuelve en el formato de checklist
      if (task) {
        return {
          nombre: task.nombre,
          objetivo: 'Tarea creada por el supervisor',
          pasos: task.pasos.map(paso => ({
            id: paso.id,
            descripcion: paso.descripcion,
            tipo_campo: paso.type || FIELD_TYPES.TEXT,
            obligatorio: true
          }))
        };
      }
      return null;
    }
    
    // Si no es tarea, busca en los checklists estaticos
    const data = await loadPackage();
    return data.checklists.find(
      (checklist) => slugify(checklist.nombre) === slug
    ) || null;
  } catch (error) {
    console.error(`Failed to get checklist by slug "${slug}":`, error);
    return null;
  }
}

// Helper for slug creation
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}
