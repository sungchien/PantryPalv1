import React, { useState } from 'react';
import { ArrowLeft, X, Plus, Layers, MapPin } from 'lucide-react';
import { PageState } from '../types';

interface Props {
  locations: string[];
  categories: string[];
  onSave: (locations: string[], categories: string[]) => Promise<void>;
  navigate: (page: PageState) => void;
}

export default function SettingsPage({ locations, categories, onSave, navigate }: Props) {
  const [tempLocations, setTempLocations] = useState([...locations]);
  const [tempCategories, setTempCategories] = useState([...categories]);

  const handleAddCategory = () => {
    const newCat = prompt('請輸入新的食品類別名稱：');
    if (newCat && newCat.trim() && !tempCategories.includes(newCat.trim())) {
      setTempCategories([...tempCategories, newCat.trim()]);
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setTempCategories(tempCategories.filter(c => c !== cat));
  };

  const handleAddLocation = () => {
    const newLoc = prompt('請輸入新的存放位置名稱：');
    if (newLoc && newLoc.trim() && !tempLocations.includes(newLoc.trim())) {
      setTempLocations([...tempLocations, newLoc.trim()]);
    }
  };

  const handleRemoveLocation = (loc: string) => {
    setTempLocations(tempLocations.filter(l => l !== loc));
  };

  const handleSave = async () => {
    await onSave(tempLocations, tempCategories);
    navigate({ name: 'main' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDF5E6]">
      <header className="sticky top-0 z-50 bg-[#FDF5E6]/95 backdrop-blur-sm px-4 py-4 flex items-center justify-between border-b border-black/5">
        <button 
          onClick={() => navigate({ name: 'main' })}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors text-[#4a4a4a]"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-[#4a4a4a]">設定類別與存放位置</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 pb-32 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xl font-bold text-[#4a4a4a] flex items-center gap-2">
              <Layers size={24} />
              食品類別
            </h3>
            <span className="text-xs font-medium text-[#8a8060] bg-white/50 px-2 py-1 rounded-full">
              {tempCategories.length} 個類別
            </span>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-white/40">
            <div className="flex flex-wrap gap-3">
              {tempCategories.map(cat => (
                <div key={cat} className="flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-[#F9E076]/30 border border-gray-200">
                  <span className="text-sm font-medium text-[#4a4a4a]">{cat}</span>
                  <button 
                    onClick={() => handleRemoveCategory(cat)}
                    className="flex items-center justify-center w-6 h-6 rounded-full text-[#8a8060] hover:bg-red-100 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-black/5 pt-4">
              <button 
                onClick={handleAddCategory}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F9E076] py-3 text-sm font-bold text-[#4a4a4a] hover:opacity-90 transition-all"
              >
                <Plus size={20} />
                新增食品類別
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xl font-bold text-[#4a4a4a] flex items-center gap-2">
              <MapPin size={24} />
              存放位置
            </h3>
            <span className="text-xs font-medium text-[#8a8060] bg-white/50 px-2 py-1 rounded-full">
              {tempLocations.length} 個位置
            </span>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-white/40">
            <div className="flex flex-wrap gap-3">
              {tempLocations.map(loc => (
                <div key={loc} className="flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-[#F9E076]/30 border border-gray-200">
                  <span className="text-sm font-medium text-[#4a4a4a]">{loc}</span>
                  <button 
                    onClick={() => handleRemoveLocation(loc)}
                    className="flex items-center justify-center w-6 h-6 rounded-full text-[#8a8060] hover:bg-red-100 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-black/5 pt-4">
              <button 
                onClick={handleAddLocation}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F9E076] py-3 text-sm font-bold text-[#4a4a4a] hover:opacity-90 transition-all"
              >
                <Plus size={20} />
                新增存放位置
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-[#E8E2D2] p-4 pb-8 z-40">
        <div className="max-w-md mx-auto flex gap-4">
          <button 
            onClick={() => navigate({ name: 'main' })}
            className="flex-1 h-14 rounded-2xl bg-[#F9E076] text-[#6d6028] font-bold text-lg shadow-sm"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="flex-[2] h-14 rounded-2xl bg-[#A8D5BA] text-[#2c5c40] font-bold text-lg shadow-sm"
          >
            確定儲存
          </button>
        </div>
      </footer>
    </div>
  );
}
