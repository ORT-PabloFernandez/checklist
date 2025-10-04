'use client';

/**
 * Validation utilities for various field types in checklists
 */

/**
 * Validates a numeric input
 * @param {number|string} value - The value to validate
 * @param {Object} validationRules - The validation rules with min/max
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateNumero(value, validationRules = {}) {
  const errors = [];
  let isValid = true;
  const numberValue = Number(value);

  // Check if it's a valid number
  if (isNaN(numberValue)) {
    errors.push('El valor debe ser un número válido');
    isValid = false;
  } else {
    // Check min value if specified
    if (validationRules.min !== undefined && numberValue < validationRules.min) {
      errors.push(`El valor debe ser mayor o igual a ${validationRules.min}`);
      isValid = false;
    }

    // Check max value if specified
    if (validationRules.max !== undefined && numberValue > validationRules.max) {
      errors.push(`El valor debe ser menor o igual a ${validationRules.max}`);
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Validates a text input
 * @param {string} value - The value to validate
 * @param {Object} validationRules - The validation rules with max_len
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateTexto(value, validationRules = {}) {
  const errors = [];
  let isValid = true;
  
  if (!value) {
    return { isValid, errors };
  }
  
  // Check max length if specified
  if (validationRules.max_len && value.length > validationRules.max_len) {
    errors.push(`El texto debe tener máximo ${validationRules.max_len} caracteres`);
    isValid = false;
  }

  return { isValid, errors };
}

/**
 * Validates a select input
 * @param {string} value - The selected value
 * @param {Array} validValues - The list of valid values
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateSelect(value, validValues = []) {
  const errors = [];
  let isValid = true;

  // If validValues is provided, check if the value is in the list
  if (validValues && validValues.length > 0 && !validValues.includes(value)) {
    errors.push('El valor seleccionado no es válido');
    isValid = false;
  }

  return { isValid, errors };
}

/**
 * Validates a checkbox input
 * @param {boolean} value - The checkbox value
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateCheckbox(value) {
  // For checkboxes, any value is valid (checked or unchecked)
  return { isValid: true, errors: [] };
}

/**
 * Validates a date input
 * @param {string} value - The date value in ISO format
 * @param {Object} validationRules - The validation rules
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateFecha(value, validationRules = {}) {
  const errors = [];
  let isValid = true;
  
  if (!value) {
    return { isValid, errors };
  }

  const date = new Date(value);
  const today = new Date();
  
  // Check if it's a valid date
  if (isNaN(date.getTime())) {
    errors.push('La fecha no es válida');
    isValid = false;
    return { isValid, errors };
  }
  
  // Check if future dates are not allowed
  if (validationRules.no_futuras && date > today) {
    errors.push('No se permiten fechas futuras');
    isValid = false;
  }
  
  // Check max age in days
  if (validationRules.max_antiguedad_dias) {
    const maxAgeDate = new Date();
    maxAgeDate.setDate(today.getDate() - validationRules.max_antiguedad_dias);
    
    if (date < maxAgeDate) {
      errors.push(`La fecha no puede ser más antigua de ${validationRules.max_antiguedad_dias} días`);
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Validates a file (foto/archivo) input
 * @param {string|Object} value - The file input value
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateFile(value) {
  const errors = [];
  let isValid = true;

  // Check if file is provided (can be a URL string or File object)
  if (!value) {
    isValid = false;
    errors.push('Se requiere un archivo');
  }

  return { isValid, errors };
}

/**
 * Validates a signature input
 * @param {string} value - The signature data (usually base64)
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateFirma(value) {
  const errors = [];
  let isValid = true;

  // Check if signature data is provided
  if (!value) {
    isValid = false;
    errors.push('Se requiere una firma');
  }

  return { isValid, errors };
}

/**
 * Validates a group of fields
 * @param {Object} groupValues - Values for each subfield in the group
 * @param {Array} subfields - Definitions of the subfields
 * @returns {Object} - Validation result with isValid, errors and detailed results for subfields
 */
export function validateGrupo(groupValues, subfields) {
  let isValid = true;
  const errors = [];
  const subfieldResults = {};
  
  if (!groupValues || !subfields) {
    return { isValid: false, errors: ['Grupo inválido'], subfieldResults: {} };
  }

  // Validate each subfield
  subfields.forEach(field => {
    const value = groupValues[field.nombre];
    let fieldResult;
    
    switch(field.tipo_campo) {
      case 'numero':
        fieldResult = validateNumero(value, field.validacion);
        break;
      case 'texto':
        fieldResult = validateTexto(value, field.validacion);
        break;
      case 'select':
        fieldResult = validateSelect(value, field.valores);
        break;
      case 'checkbox':
        fieldResult = validateCheckbox(value);
        break;
      case 'fecha':
        fieldResult = validateFecha(value, field.validacion);
        break;
      case 'foto':
      case 'archivo':
        fieldResult = validateFile(value);
        break;
      case 'firma':
        fieldResult = validateFirma(value);
        break;
      default:
        fieldResult = { isValid: true, errors: [] };
    }
    
    subfieldResults[field.nombre] = fieldResult;
    
    if (!fieldResult.isValid) {
      isValid = false;
      errors.push(`Error en ${field.nombre}: ${fieldResult.errors.join(', ')}`);
    }
  });

  return { isValid, errors, subfieldResults };
}

/**
 * Validates any field based on its type
 * @param {any} value - The field value
 * @param {Object} field - The field definition
 * @returns {Object} - Validation result
 */
export function validateField(value, field) {
  if (!field) return { isValid: false, errors: ['Campo indefinido'] };
  
  switch(field.tipo_campo) {
    case 'numero':
      return validateNumero(value, field.validacion);
    case 'texto':
      return validateTexto(value, field.validacion);
    case 'select':
      return validateSelect(value, field.valores);
    case 'checkbox':
      return validateCheckbox(value);
    case 'fecha':
      return validateFecha(value, field.validacion);
    case 'foto':
    case 'archivo':
      return validateFile(value);
    case 'firma':
      return validateFirma(value);
    case 'grupo':
      return validateGrupo(value, field.campos);
    default:
      return { isValid: true, errors: [] };
  }
}
