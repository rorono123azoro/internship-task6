import { useState, useEffect, useCallback } from 'react';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import './index.css';

export default function App() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [globalAlert, setGlobalAlert] = useState(null);

  // ── Fetch all users ────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(data.data);
    } catch (err) {
      showAlert('error', `Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Alert helper ───────────────────────────────────────────
  const showAlert = (type, text) => {
    setGlobalAlert({ type, text });
    setTimeout(() => setGlobalAlert(null), 4000);
  };

  // ── After form save ────────────────────────────────────────
  const handleSave = (savedUser, wasUpdate) => {
    if (wasUpdate) {
      setUsers(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
      setEditingUser(null);
    } else {
      setUsers(prev => [savedUser, ...prev]);
    }
    showAlert('success', wasUpdate ? `"${savedUser.name}" updated successfully.` : `"${savedUser.name}" added successfully.`);
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const target = users.find(u => u.id === id);
    try {
      const res  = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(prev => prev.filter(u => u.id !== id));
      if (editingUser?.id === id) setEditingUser(null);
      showAlert('success', `"${target?.name}" deleted.`);
    } catch (err) {
      showAlert('error', `Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="app-shell">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="site-header">
        <div className="container">
          <div className="brand">
            <div className="brand-icon">👤</div>
            <div>
              <div className="brand-name">UserBase</div>
              <span className="brand-sub">Management System</span>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-pill">
              Total <strong>{users.length}</strong> user{users.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="main-content">
        <div className="container">
          {/* Global alert */}
          {globalAlert && (
            <div className={`alert alert-${globalAlert.type}`} style={{ marginBottom: '1.5rem' }}>
              {globalAlert.type === 'success' ? '✅' : '❌'} {globalAlert.text}
            </div>
          )}

          <div className="page-grid">
            {/* Left column — form */}
            <aside>
              <UserForm
                key={editingUser?.id ?? 'new'}
                onSave={handleSave}
                editingUser={editingUser}
                onCancelEdit={() => setEditingUser(null)}
              />
            </aside>

            {/* Right column — list */}
            <section>
              <UserList
                users={users}
                loading={loading}
                onEdit={setEditingUser}
                onDelete={handleDelete}
              />
            </section>
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="container">
          UserBase · Full Stack User Management System · SQLite + Express + React
        </div>
      </footer>
    </div>
  );
}
