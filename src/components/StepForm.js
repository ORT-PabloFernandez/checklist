// app/components/StepForm.jsx

const FIELD_TYPES = [
  { value: 'texto', label: 'Texto' },
  { value: 'numero', label: 'Número' },
  { value: 'fecha', label: 'Fecha' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'select', label: 'Select' },
  { value: 'foto', label: 'Foto' },
  { value: 'archivo', label: 'Archivo' },
  { value: 'firma', label: 'Firma' }
];

export default function StepForm({
  paso,
  index,
  stepOptions,
  onChange,
  onRemove
}) 
  {
  const handleFieldChange = (field, value) => {
    onChange(paso.localId, field, value);
  };

  const availableConditionSteps = stepOptions.filter(
    (option) => Number(option.value) < index + 1
  );

  return (
    <div className="border rounded-lg p-4 bg-gray-50 relative">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h5 className="text-sm font-semibold text-gray-700">Paso {index + 1}</h5>
          <p className="text-xs text-gray-500">Configure la información de este paso.</p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(paso.localId)}
          className="text-xs text-red-600 hover:text-red-700"
        >
          Eliminar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Descripción <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={paso.descripcion}
            onChange={(event) => handleFieldChange('descripcion', event.target.value)}
            className="w-full border rounded p-2"
            placeholder="Ej: Verificar temperatura del equipo"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Tipo de campo
          </label>
          <select
            value={paso.tipo_campo}
            onChange={(event) => handleFieldChange('tipo_campo', event.target.value)}
            className="w-full border rounded p-2"
          >
            {FIELD_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 mt-6 md:mt-0">
          <input
            id={`obligatorio-${paso.localId}`}
            type="checkbox"
            checked={paso.obligatorio}
            onChange={(event) => handleFieldChange('obligatorio', event.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor={`obligatorio-${paso.localId}`}
            className="text-sm text-gray-700"
          >
            ¿Es obligatorio?
          </label>
        </div>
      </div>

      {['select', 'checkbox'].includes(paso.tipo_campo) && (
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Opciones (una por línea)
          </label>
          <textarea
            value={paso.opcionesTexto}
            onChange={(event) => handleFieldChange('opcionesTexto', event.target.value)}
            className="w-full border rounded p-2 text-sm"
            rows="3"
            placeholder={'Ej:\nOpción 1\nOpción 2'}
          />
        </div>
      )}

      {paso.tipo_campo === 'numero' && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Valor mínimo
            </label>
            <input
              type="number"
              value={paso.numeroMin}
              onChange={(event) => handleFieldChange('numeroMin', event.target.value)}
              className="w-full border rounded p-2"
              placeholder="Sin mínimo"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Valor máximo
            </label>
            <input
              type="number"
              value={paso.numeroMax}
              onChange={(event) => handleFieldChange('numeroMax', event.target.value)}
              className="w-full border rounded p-2"
              placeholder="Sin máximo"
            />
          </div>
        </div>
      )}

      {paso.tipo_campo === 'texto' && (
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Máximo de caracteres
          </label>
          <input
            type="number"
            value={paso.textoMaxLen}
            onChange={(event) => handleFieldChange('textoMaxLen', event.target.value)}
            className="w-full border rounded p-2"
            placeholder="Sin límite"
            min="1"
          />
        </div>
      )}

      <div className="mt-4 border-t border-dashed pt-4">
        <div className="flex items-center space-x-2">
          <input
            id={`condicion-${paso.localId}`}
            type="checkbox"
            checked={paso.condicionActiva}
            onChange={(event) => handleFieldChange('condicionActiva', event.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor={`condicion-${paso.localId}`}
            className="text-sm text-gray-700"
          >
            Agregar condición de visibilidad
          </label>
        </div>

        {paso.condicionActiva && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Mostrar cuando el paso
              </label>
              <select
                value={paso.condicionPasoId}
                onChange={(event) => handleFieldChange('condicionPasoId', event.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="">Seleccione un paso</option>
                {availableConditionSteps.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Sea igual a
              </label>
              <input
                type="text"
                value={paso.condicionValor}
                onChange={(event) => handleFieldChange('condicionValor', event.target.value)}
                className="w-full border rounded p-2"
                placeholder="Valor esperado"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
