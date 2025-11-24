'use client';

import { useState } from 'react';
import { useCurrentUser } from '../../lib/state';
import { useDropzone } from 'react-dropzone';
import { setCurrentUser, updateAvatar } from '@/lib/storage';
import UserDetails from '../users/components/UserDetails';

export default function EditUserData() {
  const { currentUser, updateCurrentUser } = useCurrentUser();
  const [errors, setErrors] = useState({
    avatar: ''
  });
  const [preview, setPreview] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // funcion para convertir el archivo a base64 
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  const onDrop = (file) => {
    const f = file[0];
    setSelected(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setErrors({ avatar: '' });
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false, 
  });
  // console.log(currentUser);
  // Mostrar pantalla de carga si no tenemos usuario aún
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-500">Cargando usuario...</div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    // Evito que se recargue la página
    e.preventDefault();
    // Si no se selecciona una imagen, muestro un error
    if (!selected) {
      setErrors({ avatar: 'Por favor selecciona una imagen' });
      return;
    }

    setIsUpdating(true);
    try {
      const user = await updateAvatar(await fileToBase64(selected), currentUser.id);
      const updatedUser = {
        ...currentUser, 
        avatar: user.avatar
      };
      setCurrentUser(updatedUser);
      updateCurrentUser(updatedUser);
      // Disparar evento para actualizar el navbar
      window.dispatchEvent(new CustomEvent('userUpdate', { detail: { user: updatedUser } }));
      setPreview(null);
      setSelected(null);
      setErrors({ avatar: '' });
    } catch(error) {
      setErrors({ avatar: error.message || 'Error al actualizar el avatar' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <UserDetails user={currentUser} showBackButton={false} />
      
      <div className="user-details-container">
        <div className="user-details-card">
          <form onSubmit={handleSubmit}>
            <div className="user-details-info">
              <div className="user-details-item">
                <strong>Cambiar Avatar</strong>
                <div {...getRootProps()} className="mt-4 p-4 border-2 border-gray-300 rounded-md cursor-pointer text-center">
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Suelta la imagen aquí ...</p>
                  ) : (
                    <p>Arrastrá una imagen o clickeá para seleccionar</p>
                  )}
                  {preview && (
                    <div style={{ marginTop: '1rem' }}>
                      <img 
                        src={preview} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '200px', 
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  )}
                  {errors.avatar && (
                    <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      {errors.avatar}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="user-details-footer">
              <button
                type="submit"
                disabled={!selected || isUpdating}
                className="back-button"
                style={{ 
                  backgroundColor: '#10b981', 
                  color: 'white',
                  cursor: (!selected || isUpdating) ? 'not-allowed' : 'pointer'
                }}
              >
                {isUpdating ? 'Actualizando...' : 'Actualizar Avatar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}