'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { decodeJWT } from '@/lib/utils';
import { setCurrentUser } from '@/lib/storage';
import { getEndpointUrl, TOKEN_KEY } from '@/lib/config';
import '../auth.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar el mensaje de error cuando el usuario escribe
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(getEndpointUrl('LOGIN'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      if (!response.ok) {
        throw new Error('Error al iniciar sesión');
      }

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        const userInfo = decodeJWT(data.token);

        if(!userInfo) {
          setError('Error al decodificar el token');
          return;
        }
                
        const user = {
          email: userInfo.email,
          role: userInfo.role,
          name: userInfo.username,
        };

        if (!user) {
          setError('Error al obtener el usuario');
          return;
        }
        
        setCurrentUser(user);
        
        const rolePath = user.role.toLowerCase();
        rolePath === 'supervisor'
          ? router.push('/supervisor')
          : router.push('/colaborador');
      }

    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div>
          <h2 className="auth-title">
            Iniciar sesión
          </h2>
        </div>
        
        {error && (
          <div className="error-alert" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field top"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field bottom"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}