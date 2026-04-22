import React from 'react';
import { Search, MoreVertical, Archive, User, Truck, Warehouse as WarehouseIcon } from 'lucide-react';
import { Driver, Warehouse, TeamMember } from '../types';

interface SidebarProps {
  drivers: Driver[];
  warehouses: Warehouse[];
  activeChat: string;
  setActiveChat: (id: string) => void;
}

export default function Sidebar({ drivers, warehouses, activeChat, setActiveChat }: SidebarProps) {
  return (
    <div className="w-[400px] border-r border-gray-200 flex flex-col bg-white">
      {/* Header */}
      <div className="h-16 bg-wa-header px-4 flex items-center justify-between border-b border-gray-200">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
          <User className="text-gray-600" />
        </div>
        <div className="flex gap-4 text-gray-500">
          <Archive className="w-5 h-5 cursor-pointer" />
          <MoreVertical className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      {/* Search */}
      <div className="p-2">
        <div className="bg-wa-bg rounded-lg flex items-center px-3 py-1.5 gap-3">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            className="bg-transparent border-none focus:outline-none text-sm w-full"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 text-wa-teal font-semibold text-xs uppercase tracking-wider">
          Noa AI bridge
        </div>
        <ChatListItem 
          id="noa-bridge"
          name="נועה (Noa AI Bridge)"
          subtitle="מחוברת - כיצד אוכל לעזור?"
          active={activeChat === 'noa-bridge'}
          onClick={() => setActiveChat('noa-bridge')}
          avatar="https://picsum.photos/seed/noa/100/100"
        />

        <div className="px-4 py-2 mt-4 text-wa-teal font-semibold text-xs uppercase tracking-wider">
          Drivers
        </div>
        {drivers.map(driver => (
          <ChatListItem 
            key={driver.id}
            id={driver.id}
            name={driver.name}
            subtitle={driver.currentLocation || "Offline"}
            active={activeChat === driver.id}
            onClick={() => setActiveChat(driver.id)}
            icon={<Truck className="w-4 h-4 text-gray-400" />}
          />
        ))}

        <div className="px-4 py-2 mt-4 text-wa-teal font-semibold text-xs uppercase tracking-wider">
          Warehouses
        </div>
        {warehouses.map(wh => (
          <ChatListItem 
            key={wh.id}
            id={wh.id}
            name={wh.name}
            subtitle={wh.address}
            active={activeChat === wh.id}
            onClick={() => setActiveChat(wh.id)}
            icon={<WarehouseIcon className="w-4 h-4 text-gray-400" />}
          />
        ))}
      </div>
    </div>
  );
}

function ChatListItem({ id, name, subtitle, active, onClick, avatar, icon }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${active ? 'bg-gray-100' : ''}`}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-200 flex-shrink-0 flex items-center justify-center">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          icon || <User className="text-gray-400" />
        )}
      </div>
      <div className="flex-1 border-b border-gray-100 pb-3 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="font-medium text-gray-900 truncate">{name}</h3>
          <span className="text-xs text-gray-500">12:00</span>
        </div>
        <p className="text-sm text-gray-500 truncate">{subtitle}</p>
      </div>
    </div>
  );
}
