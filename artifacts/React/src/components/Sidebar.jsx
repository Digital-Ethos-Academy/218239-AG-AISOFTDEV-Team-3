import React from 'react';
import { MdInventory, MdNotifications, MdPerson, MdAutorenew } from 'react-icons/md';

const SidebarLogo = () => (
  <div className="flex items-center mb-8 mt-2 select-none">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <MdInventory className="w-5 h-5 text-white" />
      </div>
      <span className="font-bold text-xl tracking-tight" style={{ color: '#1e293b' }}>ShelfSense</span>
    </div>
  </div>
);

const SidebarNav = ({ items, onItemClick }) => (
  <nav className="space-y-2">
    {items.map(item => (
      <button 
        key={item.key} 
        onClick={() => onItemClick(item.key)}
        className={`w-full text-left flex items-center px-3 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 ${
          item.active 
            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100" 
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`} 
        aria-current={item.active ? "page" : undefined} 
        style={{ background: item.active ? undefined : 'none', border: item.active ? undefined : 'none' }}
      >
        <span className={item.active ? "text-blue-600" : "text-gray-400"}>
          {item.icon}
        </span>
        <span className="truncate">{item.label}</span>
      </button>
    ))}
  </nav>
);

const UserProfile = () => (
  <div className="flex items-center mt-6 pt-6 border-t border-gray-100">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
        <MdPerson className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="ml-3 min-w-0 flex-1">
      <div className="text-gray-900 font-semibold text-sm truncate">Hi John!</div>
      <div className="text-gray-500 text-xs truncate">Administrator</div>
    </div>
  </div>
);

const Sidebar = ({ currentView, onViewChange, alertCount }) => {
  const menuItems = [
    {
      label: "Inventory",
      key: "inventory",
      icon: <MdInventory className="w-5 h-5 mr-3 flex-shrink-0" />,
      active: currentView === 'inventory',
    },
    {
      label: `Alerts${alertCount > 0 ? ` (${alertCount})` : ''}`,
      key: "alerts",
      icon: <MdNotifications className="w-5 h-5 mr-3 flex-shrink-0" />,
      active: currentView === 'alerts',
    },
    {
      label: "Restock Dashboard",
      key: "restock-dashboard",
      icon: <MdAutorenew className="w-5 h-5 mr-3 flex-shrink-0" />,
      active: currentView === 'restock-dashboard',
    },
  ];

  return (
    <aside className="sidebar">
      <div>
        <SidebarLogo />
        <SidebarNav items={menuItems} onItemClick={onViewChange} />
      </div>
      <UserProfile />
    </aside>
  );
};

export default Sidebar;
