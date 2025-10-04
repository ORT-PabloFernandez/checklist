'use client';

import React from 'react';
import './user.css';
import User from './User';

const UserList = ({ users }) => {
  return (
    <div className="users-list-container">
      
      <ul className="users-list">
        {users.map(user => (         
            <User key={user.id} user={user} />
        ))}
      </ul>
    </div>
  );
};

export default UserList;