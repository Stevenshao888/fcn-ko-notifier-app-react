import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  updateDoc,
  query,
  setLogLevel
} from 'firebase/firestore';

// --- Icon 組件 (本地化) ---
const CgSpinner = (props) => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" {...props}><path d="M464 256A208 208 0 1 0 48 256a16 16 0 0 1 32 0 176 176 0 1 1 352 0 16 16 0 0 1 32 0z"></path></svg>;
const FiPlus = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const FiTrash2 = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const FiRefreshCw = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
const FiAlertTriangle = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const FiBox = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const FiTarget = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const FiInfo = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const FiX = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const FiCheckCircle = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const FiEdit = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const FiBell = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const FiCalendar = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const FiClock = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const FiUser = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

// --- Firebase 設定 ---
const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG 
  ? JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG) 
  : null;

// --- 主應用程式組件 ---
export default function App() {
  const [db, setDb] = useState(null);
  const [user, setUser] = useState(null);
  const [fcnProducts, setFcnProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formMode, setFormMode] = useState('hidden');
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [prevProducts, setPrevProducts] = useState([]);

  const addNotification = useCallback((notification) => {
      const id = Date.now() + Math.random();
      setNotifications(current => [...current, { ...notification, id }]);
      const timeoutId = setTimeout(() => {
          setNotifications(current => current.filter(n => n.id !== id));
      }, 5000);
      return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
      const newlyKnockedOutProducts = fcnProducts.filter(product => {
          const prev = prevProducts.find(p => p.id === product.id);
          if (!prev) return false;
          const wasAllKO = prev.stocks.every(s => s.hasKnockedOut);
          const isAllKO = product.stocks.every(s => s.hasKnockedOut);
          return isAllKO && !wasAllKO;
      });

      if (newlyKnockedOutProducts.length > 0) {
          newlyKnockedOutProducts.forEach(product => {
              addNotification({ 
                  title: `產品可出場: ${product.name}`, 
                  message: '所有連結標的皆已觸價！', 
                  type: 'success' 
              });
          });
      }
      setPrevProducts(JSON.parse(JSON.stringify(fcnProducts)));
  }, [fcnProducts, addNotification]);

  useEffect(() => {
      if (!firebaseConfig || !firebaseConfig.apiKey) {
          if (process.env.NODE_ENV === 'production') {
              setError("Firebase 設定未載入。請確認 Vercel 環境變數已正確設定。");
          }
          setIsLoading(false);
          return;
      }
      try {
          const app = initializeApp(firebaseConfig);
          const authInstance = getAuth(app);
          const dbInstance = getFirestore(app);
          setLogLevel('debug');
          setDb(dbInstance);

          onAuthStateChanged(authInstance, async (currentUser) => {
              if (currentUser) {
                  setUser(currentUser);
                  setIsLoading(false);
              } else {
                  try {
                      await signInAnonymously(authInstance);
                  } catch (authError) { 
                      console.error("登入失敗:", authError); 
                      setError("無法連接到認證服務。"); 
                      setIsLoading(false); 
                  }
              }
          });
      } catch (e) { 
          console.error("Firebase 初始化失敗:", e); 
          setError("應用程式設定錯誤。"); 
          setIsLoading(false); 
      }
  }, []);

  useEffect(() => {
      if (user && db) {
          const userId = user.uid;
          const collectionPath = `users/${userId}/fcn_products`;
          const q = query(collection(db, collectionPath));

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
              const productsData = [];
              querySnapshot.forEach((doc) => {
                  productsData.push({ id: doc.id, ...doc.data() });
              });
              setFcnProducts(productsData);
          }, (err) => { 
              console.error("Firestore 監聽失敗:", err); 
              setError("無法讀取您的 FCN 產品清單。"); 
          });
          return () => unsubscribe();
      }
  }, [user, db]);
  
  const closeForm = () => { 
      setFormMode('hidden'); 
      setEditingProduct(null); 
  };

  const handleAddFCN = async (product) => {
      if (!db || !user) {
          setError("資料庫連接失敗，請重新整理頁面。");
          return;
      }
      
      const initialStocks = product.stocks.map(stock => ({ 
          ...stock, 
          lastClosePrice: parseFloat((Math.random() * (stock.koPrice * 0.8) + (stock.koPrice * 0.1)).toFixed(2)), 
          hasKnockedOut: false 
      }));
      
      try {
          const userId = user.uid;
          const collectionPath = `users/${userId}/fcn_products`;
          await addDoc(collection(db, collectionPath), { 
              ...product, 
              stocks: initialStocks, 
              createdAt: new Date(), 
              comparisonNotificationSent: false, 
              maturityNotificationSent: false 
          });
          
          addNotification({ 
              title: '新增成功', 
              message: `FCN 產品 "${product.name}" 已成功新增！`, 
              type: 'success' 
          });
          closeForm();
      } catch (e) { 
          console.error("新增 FCN 失敗:", e); 
          setError(`無法新增 FCN 產品：${e.message}`);
          addNotification({ 
              title: '新增失敗', 
              message: '請稍後再試或聯繫技術支援。', 
              type: 'error' 
          });
      }
  };
  
  const handleUpdateFCN = async (product) => {
      if (!db || !user || !editingProduct) return;
      try {
          const userId = user.uid;
          const docPath = `users/${userId}/fcn_products/${editingProduct.id}`;
          const updatedStocks = product.stocks.map(newStock => {
              const oldStock = editingProduct.stocks.find(s => s.ticker === newStock.ticker);
              return { 
                  ...newStock, 
                  hasKnockedOut: oldStock ? oldStock.hasKnockedOut : false, 
                  lastClosePrice: oldStock ? oldStock.lastClosePrice : 0 
              };
          });
          
          const finalProductData = { ...product, stocks: updatedStocks };
          if (product.comparisonDate !== editingProduct.comparisonDate) { 
              finalProductData.comparisonNotificationSent = false; 
          }
          if (product.expiryDate !== editingProduct.expiryDate) { 
              finalProductData.maturityNotificationSent = false; 
          }

          await updateDoc(doc(db, docPath), finalProductData);
          addNotification({ 
              title: '更新成功', 
              message: `FCN 產品 "${product.name}" 已成功更新！`, 
              type: 'success' 
          });
          closeForm();
      } catch (e) { 
          console.error("更新 FCN 失敗:", e); 
          setError(`無法更新 FCN 產品：${e.message}`);
          addNotification({ 
              title: '更新失敗', 
              message: '請稍後再試或聯繫技術支援。', 
              type: 'error' 
          });
      }
  };

  const handleDeleteFCN = async (id) => {
      if (!db || !user) return;
      try {
          const userId = user.uid;
          const docPath = `users/${userId}/fcn_products/${id}`;
          await deleteDoc(doc(db, docPath));
          addNotification({ 
              title: '刪除成功', 
              message: '已成功刪除 FCN 產品。', 
              type: 'success' 
          });
      } catch (e) { 
          console.error("刪除 FCN 失敗:", e); 
          setError(`無法刪除 FCN 產品：${e.message}`);
          addNotification({ 
              title: '刪除失敗', 
              message: '請稍後再試或聯繫技術支援。', 
              type: 'error' 
          });
      }
  };

  const handleRefreshPrices = async () => {
      if (!db || !user) return;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTime = today.getTime();

      const updatePromises = [];
      let koSimulated = false;

      for (const product of fcnProducts) {
          const productUpdates = {};
          const isAllKO = product.stocks.every(s => s.hasKnockedOut);
          
          if (product.comparisonDate && !product.comparisonNotificationSent) {
              const comparisonDate = new Date(product.comparisonDate);
              comparisonDate.setHours(0, 0, 0, 0);
              if (comparisonDate.getTime() === todayTime) {
                  addNotification({ 
                      title: '比價開始', 
                      message: `產品 "${product.name}" 已到達比價日。`, 
                      type: 'info' 
                  });
                  productUpdates.comparisonNotificationSent = true;
              }
          }

          if (product.expiryDate && !product.maturityNotificationSent && !isAllKO) {
              const expiryDate = new Date(product.expiryDate);
              expiryDate.setHours(0, 0, 0, 0);
              if (expiryDate.getTime() === todayTime) {
                  addNotification({ 
                      title: '產品到期提醒', 
                      message: `產品 "${product.name}" 已到期但未完全出場。`, 
                      type: 'error' 
                  });
                  productUpdates.maturityNotificationSent = true;
              }
          }
          
          if (Object.keys(productUpdates).length > 0) {
              const docPath = `users/${user.uid}/fcn_products/${product.id}`;
              updatePromises.push(updateDoc(doc(db, docPath), productUpdates));
          }
      }

      const productToUpdateForKO = fcnProducts.find(p => {
          if (!p.comparisonDate) return false;
          const comparisonDate = new Date(p.comparisonDate);
          comparisonDate.setHours(0, 0, 0, 0);
          const isReadyForCheck = comparisonDate <= today;
          const hasPendingKO = p.stocks.some(s => !s.hasKnockedOut);
          return isReadyForCheck && hasPendingKO;
      });

      if (productToUpdateForKO) {
          const updatedStocks = JSON.parse(JSON.stringify(productToUpdateForKO.stocks));
          const stockIndexToKO = updatedStocks.findIndex(s => !s.hasKnockedOut);
          if (stockIndexToKO !== -1) {
              const stock = updatedStocks[stockIndexToKO];
              stock.lastClosePrice = parseFloat((stock.koPrice * 1.05).toFixed(2));
              stock.hasKnockedOut = true;
              addNotification({ 
                  title: '模擬觸價成功', 
                  message: `產品 ${productToUpdateForKO.name} 中的 ${stock.ticker} 已觸價！`, 
                  type: 'success' 
              });
              koSimulated = true;
              
              const docPath = `users/${user.uid}/fcn_products/${productToUpdateForKO.id}`;
              updatePromises.push(updateDoc(doc(db, docPath), { stocks: updatedStocks }));
          }
      } 
      
      if (updatePromises.length === 0 && !koSimulated) {
           addNotification({ 
              title: '提示', 
              message: '今日無任何事件發生。', 
              type: 'info' 
          });
      }

      if (updatePromises.length > 0) {
          try {
              await Promise.all(updatePromises);
          } catch (e) { 
              console.error("更新失敗:", e); 
              setError("執行每日檢查時發生錯誤。"); 
          }
      }
  };
  
  const handleEditClick = (product) => { 
      setEditingProduct(product); 
      setFormMode('edit'); 
  };

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
      <div className="bg-gray-900 text-white min-h-screen font-sans">
          <NotificationArea notifications={notifications} />
          <div className="container mx-auto p-4 md:p-8">
              <Header 
                  onRefresh={handleRefreshPrices} 
                  onInfo={() => setShowInfoModal(true)} 
                  onNotify={() => setShowNotificationModal(true)} 
              />
              {showInfoModal && (
                  <InfoModal 
                      onClose={() => setShowInfoModal(false)} 
                      userId={user?.uid} 
                  />
              )}
              {showNotificationModal && (
                  <NotificationSettingsModal 
                      onClose={() => setShowNotificationModal(false)} 
                      addNotification={addNotification} 
                  />
              )}
              <main>
                  {formMode !== 'hidden' ? (
                      <FCNForm 
                          mode={formMode} 
                          initialData={editingProduct} 
                          onSubmit={formMode === 'add' ? handleAddFCN : handleUpdateFCN} 
                          onCancel={closeForm} 
                      />
                  ) : (
                      <div className="flex justify-end mb-4">
                          <button 
                              onClick={() => setFormMode('add')} 
                              className="flex items-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                          >
                              <FiPlus className="mr-2" /> 新增 FCN 產品
                          </button>
                      </div>
                  )}
                  <Dashboard 
                      products={fcnProducts} 
                      onEdit={handleEditClick} 
                      onDelete={handleDeleteFCN} 
                  />
              </main>
          </div>
      </div>
  );
}

// --- 子組件 ---

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
          <CgSpinner className="animate-spin text-5xl text-indigo-400 mx-auto" />
          <p className="mt-4 text-lg">正在載入應用程式...</p>
      </div>
  </div>
);

const ErrorScreen = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-400">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-2xl">
          <FiAlertTriangle className="text-5xl text-red-500 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold">發生錯誤</h2>
          <p className="mt-2">{message}</p>
      </div>
  </div>
);

const Header = ({ onRefresh, onInfo, onNotify }) => (
  <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
      <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">FCN 觸價通知</h1>
          <p className="text-gray-400">以產品組合為單位，追蹤記憶式出場條件</p>
      </div>
      <div className="flex items-center space-x-2">
          <button 
              onClick={onNotify} 
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors relative" 
              title="通知設定"
          >
              <FiBell className="text-xl" />
          </button>
          <button 
              onClick={onInfo} 
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors" 
              title="應用程式資訊"
          >
              <FiInfo className="text-xl" />
          </button>
          <button 
              onClick={onRefresh} 
              className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors" 
              title="模擬每日檢查"
          >
              <FiRefreshCw className="mr-2" />
              <span className="hidden md:inline">模擬每日檢查</span>
          </button>
      </div>
  </header>
);

const InfoModal = ({ onClose, userId }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full p-6 relative animate-fade-in">
          <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
              <FiX size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-4 text-indigo-400">應用程式資訊</h2>
          <div className="space-y-3 text-gray-300">
              <p><strong>新功能:</strong></p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>連結標的已擴充至四檔。</li>
                  <li>新增客戶姓名欄位。</li>
                  <li>資訊視窗已加入明確的「關閉」按鈕。</li>
              </ul>
              <p className="pt-2">您的專屬使用者 ID 為:</p>
              <p className="font-mono bg-gray-900 p-2 rounded text-indigo-300 text-xs break-all">
                  {userId}
              </p>
          </div>
          <div className="mt-6 text-right">
              <button 
                  onClick={onClose} 
                  className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
              >
                  關閉
              </button>
          </div>
      </div>
  </div>
);

const NotificationSettingsModal = ({ onClose, addNotification }) => {
  const [permission, setPermission] = useState('default');
  const [email, setEmail] = useState('');
  
  const handleRequestPermission = () => {
      setPermission('granting');
      addNotification({ 
          title: '模擬授權', 
          message: '瀏覽器正在向您請求傳送通知的權限...' 
      });
      setTimeout(() => { 
          setPermission('granted'); 
          addNotification({ 
              title: '授權成功', 
              message: '您已允許瀏覽器推播通知！', 
              type: 'success' 
          }); 
      }, 1500);
  };
  
  const handleSaveEmail = () => {
      if(email && email.includes('@')) { 
          addNotification({ 
              title: '設定成功', 
              message: `電子郵件通知將發送到 ${email}`, 
              type: 'success' 
          }); 
          onClose(); 
      } else { 
          addNotification({ 
              title: '格式錯誤', 
              message: '請輸入有效的電子郵件地址', 
              type: 'error' 
          }); 
      }
  };

  return (
      <div className="fixe
