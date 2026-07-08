import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export default function CustomersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    adminApi.getUsers().then(setUsers).catch(console.error);
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2>Customers</h2>
      <table style={{ width: '100%', textAlign: 'left', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
