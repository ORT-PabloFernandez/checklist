'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser } from '../lib/state';

/**
 * Component for switching between user roles
 */
export default function RoleSwitcher() {
  const { currentUser, updateCurrentUser, defaultUsers } = useCurrentUser();
  const [selectedUser, setSelectedUser] = useState('');
  
  useEffect(() => {
    if (currentUser?.email) {
      setSelectedUser(currentUser.email);
    }
  }, [currentUser]);

  const handleUserChange = (e) => {
    const email = e.target.value;
    const selectedUserData = defaultUsers.find(user => user.email === email);
    
    if (selectedUserData) {
      updateCurrentUser(selectedUserData);
      setSelectedUser(email);
    }
  };

  return (
    <div className="bg-gray-100 p-3 mb-4 rounded-lg shadow-sm">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center mb-2 sm:mb-0">
          <span className="text-sm font-semibold text-gray-600 mr-3">Usuario Actual:</span>
          <select
            value={selectedUser}
            onChange={handleUserChange}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="" disabled>Seleccionar usuario</option>
            {defaultUsers.map((user) => (
              <option key={user.email} value={user.email}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>
        
        {currentUser && (
          <div className="bg-blue-100 px-3 py-1 rounded-full text-xs font-medium text-blue-800">
            Rol: {currentUser.role}
          </div>
        )}
      </div>
    </div>
  );
}
