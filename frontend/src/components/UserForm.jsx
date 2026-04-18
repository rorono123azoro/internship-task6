import { useState } from 'react';

const INITIAL = { name: '', email: '', age: '' };

export default function UserForm({ onSave, editingUser, onCancelEdit }) {
  const [fields, setFields]   = useState(editingUser
    ? { name: editingUser.name, email: editingUser.email, age: String(editingUser.age) }
    : INITIAL
  );
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);

  // Sync form when editingUser changes
  useState(() => {
    if (editingUser) {
      setFields({ name: editingUser.name, email: editingUser.email, age: String(editingUser.age) });
    } else {
      setFields(INITIAL);
    }
    setErrors({});
  });

  const validate = () => {
    const e = {};
    if (!fields.name.trim())                          e.name  = 'Name is required.';
    if (!fields.email.trim())                         e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = 'Invalid email format.';
    if (fields.age === '')                            e.age   = 'Age is required.';
    else if (isNaN(fields.age) || +fields.age < 1 || +fields.age > 150) e.age = 'Enter a valid age (1–150).';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setAlert(null);

    const method  = editingUser ? 'PUT' : 'POST';
    const url     = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const payload = { name: fields.name.trim(), email: fields.email.trim(), age: +fields.age };

    try {
      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Something went wrong.');

      setAlert({ type: 'success', text: editingUser ? 'User updated!' : 'User created!' });
      onSave(data.data, !!editingUser);

      if (!editingUser) setFields(INITIAL);
    } catch (err) {
      setAlert({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFields(INITIAL);
    setErrors({});
    setAlert(null);
    onCancelEdit();
  };

  const isEditing = !!editingUser;

  return (
    <div className="card" id="user-form-card">
      <div className="card-header">
        <h2 className="card-title">
          <span className="card-title-icon">{isEditing ? '✏️' : '➕'}</span>
          {isEditing ? 'Edit Profile' : 'Add New User'}
        </h2>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.type === 'success' ? '✅' : '❌'} {alert.text}
        </div>
      )}

      <form className="user-form" onSubmit={handleSubmit} noValidate>
        {/* Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            className={`form-input${errors.name ? ' error' : ''}`}
            type="text"
            placeholder="e.g. Jane Smith"
            value={fields.name}
            onChange={handleChange}
            autoComplete="off"
          />
          {errors.name && <span className="form-error">⚠ {errors.name}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            className={`form-input${errors.email ? ' error' : ''}`}
            type="email"
            placeholder="e.g. jane@example.com"
            value={fields.email}
            onChange={handleChange}
            autoComplete="off"
          />
          {errors.email && <span className="form-error">⚠ {errors.email}</span>}
        </div>

        {/* Age */}
        <div className="form-group">
          <label className="form-label" htmlFor="age">Age</label>
          <input
            id="age"
            name="age"
            className={`form-input${errors.age ? ' error' : ''}`}
            type="number"
            placeholder="e.g. 28"
            min="1"
            max="150"
            value={fields.age}
            onChange={handleChange}
          />
          {errors.age && <span className="form-error">⚠ {errors.age}</span>}
        </div>

        <div className="form-actions">
          <button
            id={isEditing ? 'btn-update-user' : 'btn-add-user'}
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? '⏳ Saving…' : isEditing ? '💾 Save Changes' : '➕ Add User'}
          </button>
          {isEditing && (
            <button
              id="btn-cancel-edit"
              type="button"
              className="btn btn-ghost"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
