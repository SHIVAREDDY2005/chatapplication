export default function Sidebar({ users, groups, onlineUsers, selectedChat, onSelect, onCreateGroup }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Chats</h3>
        <button onClick={onCreateGroup}>+ Group</button>
      </div>

      <p className="section-title">Direct messages</p>
      {users.map((user) => (
        <button
          key={user._id}
          className={`chat-item ${selectedChat?.type === 'user' && selectedChat?._id === user._id ? 'active' : ''}`}
          onClick={() => onSelect({ ...user, type: 'user' })}
        >
          <span>{user.name}</span>
          <div>
            {onlineUsers.includes(user._id) ? <small className="online">Online</small> : <small>Last seen: {new Date(user.lastSeen).toLocaleTimeString()}</small>}
            {user.unreadCount > 0 && <strong className="badge">{user.unreadCount}</strong>}
          </div>
        </button>
      ))}

      <p className="section-title">Groups</p>
      {groups.map((group) => (
        <button
          key={group._id}
          className={`chat-item ${selectedChat?.type === 'group' && selectedChat?._id === group._id ? 'active' : ''}`}
          onClick={() => onSelect({ ...group, type: 'group' })}
        >
          <span>#{group.name}</span>
          {group.unreadCount > 0 && <strong className="badge">{group.unreadCount}</strong>}
        </button>
      ))}
    </aside>
  );
}
