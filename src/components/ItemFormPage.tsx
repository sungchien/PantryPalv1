import React, { useState } from 'react';
import { ArrowLeft, Calendar, Package, Clock } from 'lucide-react';
import { FoodItem, PageState } from '../types';

interface Props {
  page: { name: 'new' } | { name: 'edit', itemId: string };
  items: FoodItem[];
  locations: string[];
  categories: string[];
  navigate: (page: PageState) => void;
  onSave: (item: FoodItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ItemFormPage({ page, items, locations, categories, navigate, onSave, onDelete }: Props) {
  const isEdit = page.name === 'edit';
  const editingItem = isEdit ? items.find(i => i.id === page.itemId) : null;

  const [name, setName] = useState(editingItem?.name || '');
  const [category, setCategory] = useState(editingItem?.category || (categories[0] || ''));
  const [location, setLocation] = useState(editingItem?.location || (locations[0] || ''));
  const [expiryDate, setExpiryDate] = useState(editingItem?.expiry_date || new Date().toISOString().split('T')[0]);
  const [quantityUnopened, setQuantityUnopened] = useState(editingItem?.quantity_unopened || 0);
  const [quantityOpened, setQuantityOpened] = useState(editingItem?.quantity_opened || 0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNameAlert, setShowNameAlert] = useState(false);

  const executeSave = async () => {
    const newItem: FoodItem = {
      id: isEdit ? page.itemId : Math.random().toString(36).substr(2, 9),
      name,
      category,
      location,
      expiry_date: expiryDate,
      quantity_unopened: quantityUnopened,
      quantity_opened: quantityOpened
    };

    await onSave(newItem);
    navigate({ name: 'main' });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setShowNameAlert(true);
      return;
    }

    const totalQuantity = quantityUnopened + quantityOpened;
    
    if (totalQuantity === 0) {
      setShowDeleteConfirm(true);
      return;
    }

    await executeSave();
  };

  const confirmDeleteAndExit = async () => {
    if (isEdit) {
      await onDelete(page.itemId);
    }
    navigate({ name: 'main' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDF5E6]">
      {/* Custom Alert Modal for Name */}
      {showNameAlert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-[#4a4a4a] mb-2 text-center">提示</h3>
            <p className="text-[#8a8060] text-center mb-6 leading-relaxed">
              請輸入食品名稱。
            </p>
            <button 
              onClick={() => setShowNameAlert(false)}
              className="w-full py-4 bg-[#A8D5BA] text-[#2c5c40] font-bold rounded-2xl shadow-sm active:scale-95 transition-transform"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-[#4a4a4a] mb-2 text-center">確認刪除？</h3>
            <p className="text-[#8a8060] text-center mb-6 leading-relaxed">
              未開封和已開封的數量總和為 0，這將會刪除此筆食品資料。
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDeleteAndExit}
                className="w-full py-4 bg-[#e57373] text-white font-bold rounded-2xl shadow-sm active:scale-95 transition-transform"
              >
                確定刪除
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-4 bg-gray-100 text-[#8a8060] font-bold rounded-2xl active:scale-95 transition-transform"
              >
                返回修改
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-[#FDF5E6]/90 backdrop-blur-sm px-4 py-4 flex items-center justify-between border-b border-[#E8E2D2]">
        <button 
          onClick={() => navigate({ name: 'main' })}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors text-[#4a4a4a]"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-[#4a4a4a]">
          {isEdit ? '編輯現有食品' : '新增食品'}
        </h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 space-y-6">
        <section className="space-y-2">
          <label className="block text-base font-bold text-[#4a4a4a] px-1">食品名稱</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例如：牛奶"
            className="w-full bg-white border-none ring-1 ring-[#E8E2D2] rounded-2xl h-14 px-4 text-lg focus:ring-2 focus:ring-[#A8D5BA] shadow-sm"
          />
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-base font-bold text-[#4a4a4a] px-1">類別</label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-white ring-1 ring-[#E8E2D2] border-none rounded-2xl h-14 px-4 text-[#4a4a4a] font-medium focus:ring-2 focus:ring-[#A8D5BA] shadow-sm"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-base font-bold text-[#4a4a4a] px-1">存放位置</label>
            <select 
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-white ring-1 ring-[#E8E2D2] border-none rounded-2xl h-14 px-4 text-[#4a4a4a] font-medium focus:ring-2 focus:ring-[#A8D5BA] shadow-sm"
            >
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </section>

        <section className="space-y-2">
          <label className="block text-base font-bold text-[#4a4a4a] px-1">保存期限</label>
          <div className="relative bg-white rounded-2xl shadow-sm ring-1 ring-[#E8E2D2] h-14 flex items-center px-4 focus-within:ring-2 focus-within:ring-[#A8D5BA]">
            <Calendar size={20} className="text-[#8a8060] mr-3" />
            <input 
              type="date" 
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              className="w-full bg-transparent border-none p-0 text-[#4a4a4a] font-medium focus:ring-0 text-lg"
            />
          </div>
        </section>

        <section className="space-y-2">
          <p className="block text-base font-bold text-[#4a4a4a] px-1">狀態與數量</p>
          <div className="bg-white rounded-3xl shadow-sm p-5 space-y-4 ring-1 ring-[#E8E2D2]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                  <Package size={20} />
                </div>
                <span className="text-base font-bold text-[#4a4a4a]">未開封</span>
              </div>
              <div className="flex items-center gap-3 bg-[#FDF5E6] rounded-full p-1 border border-[#E8E2D2]">
                <button 
                  onClick={() => setQuantityUnopened(Math.max(0, quantityUnopened - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#8a8060] shadow-sm"
                >
                  -
                </button>
                <input 
                  type="number"
                  min="0"
                  value={quantityUnopened}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setQuantityUnopened(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  className="w-12 text-center text-lg font-bold text-[#4a4a4a] bg-transparent border-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button 
                  onClick={() => setQuantityUnopened(quantityUnopened + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#4a4a4a] shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="h-px bg-[#E8E2D2] w-full"></div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <span className="text-base font-bold text-[#4a4a4a]">已開封</span>
              </div>
              <div className="flex items-center gap-3 bg-[#FDF5E6] rounded-full p-1 border border-[#E8E2D2]">
                <button 
                  onClick={() => setQuantityOpened(Math.max(0, quantityOpened - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#8a8060] shadow-sm"
                >
                  -
                </button>
                <input 
                  type="number"
                  min="0"
                  value={quantityOpened}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setQuantityOpened(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  className="w-12 text-center text-lg font-bold text-[#4a4a4a] bg-transparent border-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button 
                  onClick={() => setQuantityOpened(quantityOpened + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#4a4a4a] shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="px-2 pt-1">
            <p className="text-sm font-medium text-[#c25e5e] leading-relaxed">
              如果未開封和已開封的數量總和為0，在按下確定儲存按鈕後，將自動刪除這筆食品資料。
            </p>
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
