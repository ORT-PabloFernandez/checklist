'use client';

/**
 * Utilities for handling conditional fields in checklists
 */

/**
 * Determines if a paso (step) should be visible based on its conditional rules and current responses
 * @param {Object} paso - The step object from the checklist
 * @param {Object} respuestas - The current responses, keyed by paso_id
 * @returns {boolean} - Whether the step should be visible
 */
export function isPasoVisible(paso, respuestas) {
  // If the paso has no conditional, it's always visible
  if (!paso.condicional || !paso.condicional.cuando) {
    return true;
  }

  const { paso_id, igual_a } = paso.condicional.cuando;
  
  // Check if we have a response for the controlling paso
  if (!respuestas || !respuestas[paso_id]) {
    // If we have no response for the controlling step, the conditional step is not visible
    return false;
  }

  // Check if the value matches the condition
  return respuestas[paso_id] === igual_a;
}

/**
 * Reprocesses all pasos for visibility based on current responses
 * @param {Array} pasos - All steps from the checklist
 * @param {Object} respuestas - The current responses, keyed by paso_id
 * @returns {Object} - Object containing visible state for each paso ID
 */
export function getVisibilityMap(pasos, respuestas) {
  if (!pasos || !Array.isArray(pasos)) return {};
  
  const visibilityMap = {};
  
  // Set visibility for each paso
  pasos.forEach(paso => {
    visibilityMap[paso.id] = isPasoVisible(paso, respuestas);
  });
  
  return visibilityMap;
}

/**
 * Gets all pasos that should be visible based on current responses
 * @param {Array} pasos - All steps from the checklist
 * @param {Object} respuestas - The current responses, keyed by paso_id
 * @returns {Array} - Array of visible pasos
 */
export function getVisiblePasos(pasos, respuestas) {
  if (!pasos || !Array.isArray(pasos)) return [];
  
  return pasos.filter(paso => isPasoVisible(paso, respuestas));
}
