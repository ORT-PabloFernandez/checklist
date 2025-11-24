// Eliminar la función normalizeFieldType y dejar solo las constantes
export const FIELD_TYPES = {
  TEXT: 'texto',
  NUMBER: 'numero',
  SELECT: 'select',
  DATE: 'fecha',
  CHECKBOX: 'checkbox',
  FILE: 'archivo',
  PHOTO: 'foto',
  SIGNATURE: 'firma',
  GROUP: 'grupo'
};

export const FIELD_TYPE_LABELS = {
  [FIELD_TYPES.TEXT]: 'Texto',
  [FIELD_TYPES.NUMBER]: 'Número',
  [FIELD_TYPES.SELECT]: 'Select',
  [FIELD_TYPES.DATE]: 'Fecha',
  [FIELD_TYPES.CHECKBOX]: 'Checkbox',
  [FIELD_TYPES.FILE]: 'Archivo',
  [FIELD_TYPES.PHOTO]: 'Foto',
  [FIELD_TYPES.SIGNATURE]: 'Firma',
  [FIELD_TYPES.GROUP]: 'Grupo'
};

export const DEFAULT_FIELD_TYPE = FIELD_TYPES.TEXT;