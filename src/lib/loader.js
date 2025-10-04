'use client';

/**
 * Utility for loading checklist data from JSON
 */

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
