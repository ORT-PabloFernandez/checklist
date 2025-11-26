'use client';

export default function TaskFormFields({ formData, errors, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <>
      {/* Nombre */}
      <div className="mb-4">
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la Tarea *
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          placeholder="Ingresa el nombre de la tarea"
        />
        {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
      </div>

      {/* Descripción */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          placeholder="Describe el objetivo o propósito de la tarea"
          rows="3"
        />
      </div>

      {/* Categoría */}
      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Categoría
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Selecciona una categoría</option>
          <option value="Inspección">Inspección</option>
          <option value="Mantenimiento">Mantenimiento</option>
          <option value="Seguridad">Seguridad</option>
          <option value="Calidad">Calidad</option>
          <option value="Operaciones">Operaciones</option>
          <option value="Administrativo">Administrativo</option>
          <option value="Otro">Otro</option>
        </select>
      </div>
    </>
  );
}

