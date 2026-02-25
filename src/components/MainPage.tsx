import React, { useState, useMemo } from 'react';
import { Settings, Search, MapPin, Edit2, Trash2, Plus } from 'lucide-react';
import { FoodItem, PageState } from '../types';

interface Props {
  items: FoodItem[];
  locations: string[];
  navigate: (page: PageState) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function MainPage({ items, locations, navigate, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('全部');

  const filteredItems = useMemo(() => {
    return items
      .filter(item => selectedLocation === '全部' || item.location === selectedLocation)
      .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
  }, [items, search, selectedLocation]);

  const handleDelete = async (id: string) => {
    if (confirm('確定要刪除這個食品嗎？')) {
      await onDelete(id);
    }
  };

  const getDaysRemaining = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="px-5 pt-12 pb-4 bg-[#FDF5E6] sticky top-0 z-10">
        <div className="flex items-center justify-center mb-4 relative">
          <h1 className="text-2xl font-bold tracking-tight text-[#4a4a4a]">PantryPal</h1>
          <button 
            onClick={() => navigate({ name: 'settings' })}
            className="absolute right-0 text-[#8a8060] hover:text-[#4a4a4a] transition-colors"
          >
            <Settings size={24} />
          </button>
        </div>
        <div className="relative w-full mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-[#8a8060]" />
          </div>
          <input 
            type="text" 
            placeholder="搜尋食材..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl text-[#4a4a4a] placeholder-[#8a8060] focus:ring-2 focus:ring-[#A8D5BA] shadow-sm text-base"
          />
        </div>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MapPin size={20} className="text-[#A8D5BA]" />
          </div>
          <select 
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="block w-full pl-12 pr-10 py-3 bg-white border-none rounded-2xl text-[#4a4a4a] font-medium shadow-sm focus:ring-2 focus:ring-[#A8D5BA] text-base appearance-none"
          >
            <option value="全部">全部</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-24 space-y-4">
        {filteredItems.map(item => {
          const daysRemaining = getDaysRemaining(item.expiry_date);
          const isExpiringSoon = daysRemaining < 3;

          return (
            <div 
              key={item.id} 
              className={`bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between transition-all ${isExpiringSoon ? 'border-l-4 border-[#e57373]' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <h3 className={`text-lg font-bold leading-tight ${isExpiringSoon ? 'text-[#e57373]' : 'text-[#4a4a4a]'}`}>
                    {item.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                      {item.category}
                    </span>
                    <span className="text-xs font-medium text-[#8a8060]">
                      數量: {item.quantity_unopened + item.quantity_opened}
                    </span>
                    <p className={`text-sm font-bold ${isExpiringSoon ? 'text-[#e57373]' : 'text-[#8a8060]'}`}>
                      {isExpiringSoon ? `剩餘 ${daysRemaining} 天` : `${item.expiry_date} 到期`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate({ name: 'edit', itemId: item.id })}
                  className="text-gray-400 hover:text-[#A8D5BA] transition-colors p-2 rounded-full hover:bg-gray-50"
                >
                  <Edit2 size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-gray-400 hover:text-[#e57373] transition-colors p-2 rounded-full hover:bg-gray-50"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="text-center text-[#8a8060] mt-10">
            沒有找到符合的食品
          </div>
        )}
      </main>

      <div className="fixed bottom-8 right-5 z-20">
        <button 
          onClick={() => navigate({ name: 'new' })}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#A8D5BA] text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus size={32} />
        </button>
      </div>
    </div>
  );
}
