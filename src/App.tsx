import React, { useState, useEffect } from 'react';
import { FoodItem, PageState } from './types';
import MainPage from './components/MainPage';
import ItemFormPage from './components/ItemFormPage';
import SettingsPage from './components/SettingsPage';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc 
} from 'firebase/firestore';

const defaultLocations = ["冷凍庫", "冷藏室上方", "冷藏室下方", "其他"];
const defaultCategories = ["乳製品", "肉類", "海鮮", "蔬菜", "水果", "五穀雜糧", "調味料", "零食飲料", "加工食品", "其他"];

export default function App() {
  const [page, setPage] = useState<PageState>({ name: 'main' });
  const [locations, setLocations] = useState<string[]>(defaultLocations);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);

  // Helper to load from local storage
  const loadLocalData = () => {
    const localItems = localStorage.getItem('pantry_items');
    const localSettings = localStorage.getItem('pantry_settings');
    if (localItems) setItems(JSON.parse(localItems));
    if (localSettings) {
      const settings = JSON.parse(localSettings);
      setLocations(settings.locations);
      setCategories(settings.categories);
    }
    setIsLocalMode(true);
    setLoading(false);
  };

  // Sync Items from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "foods"), 
      (snapshot) => {
        const foodsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FoodItem[];
        setItems(foodsData);
        setLoading(false);
        setIsLocalMode(false);
      },
      (error) => {
        console.error("Firestore foods sync error:", error);
        if (error.code === 'permission-denied') {
          console.warn("Firebase permission denied. Falling back to local storage.");
          loadLocalData();
        } else {
          setLoading(false);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync Settings from Firestore
  useEffect(() => {
    const settingsDoc = doc(db, "config", "settings");
    const unsubscribe = onSnapshot(
      settingsDoc, 
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.locations) setLocations(data.locations);
          if (data.categories) setCategories(data.categories);
        } else {
          setDoc(settingsDoc, {
            locations: defaultLocations,
            categories: defaultCategories
          });
        }
      },
      (error) => {
        console.error("Firestore settings sync error:", error);
        // Fallback already handled by items listener
      }
    );
    return () => unsubscribe();
  }, []);

  const navigate = (newPage: PageState) => setPage(newPage);

  const handleUpdateSettings = async (newLocations: string[], newCategories: string[]) => {
    if (isLocalMode) {
      localStorage.setItem('pantry_settings', JSON.stringify({ locations: newLocations, categories: newCategories }));
      setLocations(newLocations);
      setCategories(newCategories);
    } else {
      const settingsDoc = doc(db, "config", "settings");
      await setDoc(settingsDoc, {
        locations: newLocations,
        categories: newCategories
      });
    }
  };

  const handleSaveItem = async (item: FoodItem) => {
    if (isLocalMode) {
      const newItems = items.some(i => i.id === item.id) 
        ? items.map(i => i.id === item.id ? item : i)
        : [...items, item];
      setItems(newItems);
      localStorage.setItem('pantry_items', JSON.stringify(newItems));
    } else {
      const foodDoc = doc(db, "foods", item.id);
      await setDoc(foodDoc, item);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (isLocalMode) {
      const newItems = items.filter(i => i.id !== id);
      setItems(newItems);
      localStorage.setItem('pantry_items', JSON.stringify(newItems));
    } else {
      const foodDoc = doc(db, "foods", id);
      await deleteDoc(foodDoc);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex items-center justify-center">
        <div className="text-[#8a8060] font-bold text-xl animate-pulse">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF5E6] text-[#4a4a4a] font-sans">
      {isLocalMode && (
        <div className="bg-orange-100 text-orange-800 px-4 py-2 text-xs text-center font-medium border-b border-orange-200">
          ⚠️ Firebase 權限不足，目前正使用「本地儲存模式」。資料將僅保存在此瀏覽器中。
        </div>
      )}
      {page.name === 'main' && (
        <MainPage 
          items={items} 
          locations={locations} 
          navigate={navigate} 
          onDelete={handleDeleteItem}
        />
      )}
      {(page.name === 'new' || page.name === 'edit') && (
        <ItemFormPage 
          page={page}
          items={items}
          locations={locations}
          categories={categories}
          navigate={navigate}
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
        />
      )}
      {page.name === 'settings' && (
        <SettingsPage 
          locations={locations}
          categories={categories}
          onSave={handleUpdateSettings}
          navigate={navigate}
        />
      )}
    </div>
  );
}
