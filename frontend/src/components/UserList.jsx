import { useState } from 'react';

// Format ISO date → "Apr 18, 2026"
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Avatar initials from name
function initials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('');
}

// Skeleton row for loading state
function SkeletonRow() {
  return (
    <tr className="skeleton-row">
      <td><span className="skeleton" style={{ width: '24px' }} /></td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <span className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
          <span className="skeleton" style={{ width: '120px' }} />
        </div>
      </td>
      <td><span className="skeleton" style={{ width: '160px' }} /></td>
      <td><span className="skeleton" style={{ width: '36px' }} /></td>
      <td><span className="skeleton" style={{ width: '100px' }} /></td>
    </tr>
  );
}

export default function UserList({ users, loading, onEdit, onDelete }) {
  const [search, setSearch]         = useState('');
  const [confirmId, setConfirmId]   = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const confirmUser = users.find(u => u.id === confirmId);

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await onDelete(confirmId);
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  return (
    <>
      <div className="card" id="user-list-card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="card-title-icon">👥</span>
            All Users
            <span style={{ marginLeft: '.5rem', fontSize: '.78rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>
              ({filtered.length}{search ? ` of ${users.length}` : ''})
            </span>
          </h2>
        </div>

        {/* Search */}
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="search-users"
            className="search-input"
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="user-table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-state">
                          <div className="empty-icon">🔎</div>
                          <div className="empty-title">
                            {search ? 'No results found' : 'No users yet'}
                          </div>
                          <div className="empty-desc">
                            {search ? 'Try a different search term.' : 'Add your first user using the form on the left.'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                  : filtered.map(user => (
                    <tr key={user.id}>
                      <td><span className="row-id">{user.id}</span></td>
                      <td>
                        <div className="name-cell">
                          <div className="user-avatar">{initials(user.name)}</div>
                          <div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-since">Since {fmtDate(user.created_at)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="email-cell">{user.email}</td>
                      <td><span className="age-badge">{user.age}</span></td>
                      <td>
                        <div className="action-cell">
                          <button
                            id={`btn-edit-${user.id}`}
                            className="btn btn-edit"
                            onClick={() => onEdit(user)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            id={`btn-delete-${user.id}`}
                            className="btn btn-delete"
                            onClick={() => setConfirmId(user.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmId && (
        <div className="modal-backdrop" onClick={() => setConfirmId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-icon">🗑️</div>
            <div className="modal-title">Delete User?</div>
            <div className="modal-desc">
              You are about to permanently delete{' '}
              <strong>{confirmUser?.name}</strong>. This action cannot be undone.
            </div>
            <div className="modal-actions">
              <button
                id="btn-confirm-delete"
                className="btn btn-delete btn-full"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '⏳ Deleting…' : '🗑️ Yes, Delete'}
              </button>
              <button
                id="btn-cancel-delete"
                className="btn btn-ghost btn-full"
                onClick={() => setConfirmId(null)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
