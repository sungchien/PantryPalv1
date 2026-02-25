import React, { useState, useEffect } from 'react';
import { FoodItem, PageState } from './types';
import MainPage from './components/MainPage';
import ItemFormPage from './components/ItemFormPage';
import SettingsPage from './components/SettingsPage';
import { db, auth, googleProvider } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  query
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { LogIn, LogOut } from 'lucide-react';

const defaultLocations = ["冷凍庫", "冷藏室上方", "冷藏室下方", "其他"];
const defaultCategories = ["乳製品", "肉類", "海鮮", "蔬菜", "水果", "五穀雜糧", "調味料", "零食飲料", "加工食品", "其他"];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<PageState>({ name: 'main' });
  const [locations, setLocations] = useState<string[]>(defaultLocations);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Items from Firestore (User-specific path)
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const pantryRef = collection(db, "users", user.uid, "pantryItems");
    const unsubscribe = onSnapshot(
      pantryRef, 
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
  }, [user]);

  // Sync Settings from Firestore (User-specific path)
  useEffect(() => {
    if (!user) return;

    const settingsDoc = doc(db, "users", user.uid, "config", "settings");
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
          }).catch(err => console.warn("Failed to init settings:", err));
        }
      },
      (error) => {
        console.error("Firestore settings sync error:", error);
        if (error.code === 'permission-denied') {
          console.warn("Settings permission denied. Using default/local settings.");
          // If we have local settings, use them as fallback
          const localSettings = localStorage.getItem('pantry_settings');
          if (localSettings) {
            const settings = JSON.parse(localSettings);
            setLocations(settings.locations);
            setCategories(settings.categories);
          }
        }
      }
    );
    return () => unsubscribe();
  }, [user]);

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

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  const navigate = (newPage: PageState) => setPage(newPage);

  const handleUpdateSettings = async (newLocations: string[], newCategories: string[]) => {
    if (isLocalMode) {
      localStorage.setItem('pantry_settings', JSON.stringify({ locations: newLocations, categories: newCategories }));
      setLocations(newLocations);
      setCategories(newCategories);
    } else if (user) {
      const settingsDoc = doc(db, "users", user.uid, "config", "settings");
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
    } else if (user) {
      const foodDoc = doc(db, "users", user.uid, "pantryItems", item.id);
      await setDoc(foodDoc, item);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (isLocalMode) {
      const newItems = items.filter(i => i.id !== id);
      setItems(newItems);
      localStorage.setItem('pantry_items', JSON.stringify(newItems));
    } else if (user) {
      const foodDoc = doc(db, "users", user.uid, "pantryItems", id);
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

  if (!user && !isLocalMode) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-[#A8D5BA] rounded-3xl flex items-center justify-center mb-6 shadow-lg">
          <LogIn size={48} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[#4a4a4a] mb-2">歡迎來到 PantryPal</h1>
        <p className="text-[#8a8060] mb-8">登入以開始管理您的家庭食品庫存</p>
        <button 
          onClick={handleLogin}
          className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all font-bold text-[#4a4a4a]"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          使用 Google 帳號登入
        </button>
        <button 
          onClick={loadLocalData}
          className="mt-6 text-sm text-[#8a8060] underline"
        >
          暫不登入，使用本地模式測試
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF5E6] text-[#4a4a4a] font-sans">
      {isLocalMode && (
        <div className="bg-orange-100 text-orange-800 px-4 py-2 text-xs text-center font-medium border-b border-orange-200">
          ⚠️ 目前正使用「本地儲存模式」。登入以同步資料至雲端。
        </div>
      )}
      {user && page.name === 'main' && (
        <div className="bg-[#A8D5BA]/10 px-4 py-2 flex items-center justify-between border-b border-[#A8D5BA]/20">
          <div className="flex items-center gap-2">
            <img src={user.photoURL || ''} className="w-6 h-6 rounded-full" alt="avatar" />
            <span className="text-xs font-medium text-[#4a4a4a]">{user.displayName}</span>
          </div>
          <button onClick={handleLogout} className="text-xs text-[#c25e5e] flex items-center gap-1 font-bold">
            <LogOut size={14} /> 登出
          </button>
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
