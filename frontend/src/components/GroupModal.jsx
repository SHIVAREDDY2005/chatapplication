import { useState } from 'react';

export default function GroupModal({ users, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);

  const toggleUser = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]));
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Create Group</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" />
        <div className="user-picks">
          {users.map((u) => (
            <label key={u._id}>
              <input type="checkbox" checked={selected.includes(u._id)} onChange={() => toggleUser(u._id)} /> {u.name}
            </label>
          ))}
        </div>
        <div className="actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => onSubmit({ name, members: selected })}>Create</button>
        </div>
      </div>
    </div>
  );
}
