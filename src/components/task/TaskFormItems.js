'use client';

import { useState } from 'react';
import TaskFormItemEditor from './TaskFormItemEditor';

export default function TaskFormItems({ items, onItemsChange, errors }) {
  const [editingItem, setEditingItem] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleAddItem = () => {
    setEditingItem(null);
    setShowEditor(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditor(true);
  };

  const handleSaveItem = (item) => {
    if (editingItem) {
      // Actualizar item existente
      const updated = items.map(i => i.id === editingItem.id ? item : i);
      onItemsChange(updated);
    } else {
      // Agregar nuevo item
      onItemsChange([...items, item]);
    }
    setShowEditor(false);
    setEditingItem(null);
  };

  const handleRemoveItem = (itemId) => {
    onItemsChange(items.filter(item => item.id !== itemId));
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingItem(null);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Items de la Tarea *
        </label>
        {!showEditor && (
          <button
            type="button"
            onClick={handleAddItem}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Agregar Item
          </button>
        )}
      </div>

      {/* Lista de items existentes */}
      {items.length > 0 && !showEditor && (
        <div className="mb-4 p-4 bg-gray-50 rounded">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-start justify-between mb-3 p-3 bg-white rounded border">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">Item {index + 1}</p>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {item.type}
                  </span>
                  {item.required && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                      Obligatorio
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-1">{item.text}</p>
                {item.unit && <p className="text-xs text-gray-500">Unidad: {item.unit}</p>}
                {item.options && item.options.length > 0 && (
                  <p className="text-xs text-gray-500">Opciones: {item.options.join(', ')}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEditItem(item)}
                  className="px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor de items */}
      {showEditor && (
        <div className="mb-4">
          <TaskFormItemEditor
            item={editingItem}
            onSave={handleSaveItem}
            onCancel={handleCancelEdit}
            existingItems={items}
          />
        </div>
      )}

      {errors.items && <p className="text-red-600 text-sm mt-2">{errors.items}</p>}
    </div>
  );
}

