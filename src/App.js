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

// --- Icon 組件 ---
const CgSpinner = (props) => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" {...props}><path d="M464 256A208 208 0 1 0 48 256a16 16 0 0 1 32 0 176 176 0 1 1 352 0 16 16 0 0 1 32 0z"></path></svg>;
const FiPlus = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const FiTrash2 = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const FiRefreshCw = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
const FiAlertTriangle = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const FiInfo = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const FiX = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const FiCheckCircle = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const FiEdit = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const FiBell = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const FiCalendar = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const FiUser = (props) => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

// Firebase 設定
const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG 
  ? JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG) 
  : null;

// 載入畫面組件
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
          <CgSpinner className="animate-spin text-5xl text-indigo-400 mx-auto" />
          <p className="mt-4 text-lg">正在載入應用程式...</p>
      </div>
  </div>
);

// 錯誤畫面組件
const ErrorScreen = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-400">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-2xl">
          <FiAlertTriangle className="text-5xl text-red-500 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold">發生錯誤</h2>
          <p className="mt-2">{message}</p>
      </div>
  </div>
);

// 通知區域組件
const NotificationArea = ({ notifications }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
          <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
                  notification.type === 'success' ? 'bg-green-600' :
                  notification.type === 'error' ? 'bg-red-600' :
                  'bg-blue-600'
              } text-white`}
          >
              <div className="flex items-start">
                  <FiCheckCircle className="mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                      <h4 className="font-semibold">{notification.title}</h4>
                      <p className="text-sm opacity-90">{notification.message}</p>
                  </div>
              </div>
          </div>
      ))}
  </div>
);

// 標題組件
const Header = ({ onRefresh, onInfo }) => (
  <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
      <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">FCN 觸價通知</h1>
          <p className="text-gray-400">以產品組合為單位，追蹤記憶式出場條件</p>
      </div>
      <div className="flex items-center space-x-2">
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

// 資訊彈窗組件
const InfoModal = ({ onClose, userId }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full p-6 relative">
          <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
              <FiX size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-4 text-indigo-400">應用程式資訊</h2>
          <div className="space-y-3 text-gray-300">
              <p><strong>功能說明:</strong></p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>追蹤 FCN 產品的觸價狀況</li>
                  <li>模擬每日價格檢查</li>
                  <li>自動通知重要事件</li>
              </ul>
              {userId && (
                  <>
                      <p className="pt-2">您的使用者 ID:</p>
                      <p className="font-mono bg-gray-900 p-2 rounded text-indigo-300 text-xs break-all">
                          {userId}
                      </p>
                  </>
              )}
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

// FCN 表單組件
const FCNForm = ({ mode, initialData, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [orderDate, setOrderDate] = useState(initialData?.orderDate || '');
  const [comparisonDate, setComparisonDate] = useState(initialData?.comparisonDate || '');
  const [expiryDate, setExpiryDate] = useState(initialData?.expiryDate || '');
  const [stocks, setStocks] = useState(initialData?.stocks || [
      { ticker: '', koPrice: '' },
      { ticker: '', koPrice: '' },
      { ticker: '', koPrice: '' },
      { ticker: '', koPrice: '' }
  ]);
  const [formError, setFormError] = useState('');

  const handleSubmit = (e) => {
      e.preventDefault();
      setFormError('');
      
      if (!name.trim()) {
          setFormError('FCN 產品名稱為必填項目。');
          return;
      }
      
      const validStocks = stocks.filter(s => s.ticker.trim() && s.koPrice);
      if (validStocks.length === 0) {
          setFormError('請至少填寫一組有效的連結標的。');
          return;
      }
      
      for (const stock of validStocks) {
          if (isNaN(stock.koPrice) || parseFloat(stock.koPrice) <= 0) {
              setFormError(`股票 ${stock.ticker} 的 KO 價格必須是正數。`);
              return;
          }
      }
      
      onSubmit({
          name: name.trim(),
          customerName: customerName.trim(),
          orderDate,
          comparisonDate,
          expiryDate,
          stocks: validStocks.map(s => ({
              ...s,
              ticker: s.ticker.toUpperCase().trim(),
              koPrice: parseFloat(s.koPrice)
          }))
      });
  };

  const handleStockChange = (index, field, value) => {
      const newStocks = [...stocks];
      newStocks[index][field] = value;
      setStocks(newStocks);
  };

  return (
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-indigo-400">
              {mode === 'add' ? '新增 FCN 產品' : '編輯 FCN 產品'}
          </h2>
          
          {formError && (
              <div className="bg-red-600 text-white p-3 rounded-lg mb-4">
                  {formError}
              </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                          FCN 產品名稱 *
                      </label>
                      <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="輸入產品名稱"
                          required
                      />
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                          客戶姓名
                      </label>
                      <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="輸入客戶姓名"
                      />
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                          下單日期
                      </label>
                      <input
                          type="date"
                          value={orderDate}
                          onChange={(e) => setOrderDate(e.target.value)}
                          className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                          比價日期
                      </label>
                      <input
                          type="date"
                          value={comparisonDate}
                          onChange={(e) => setComparisonDate(e.target.value)}
                          className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                          到期日期
                      </label>
                      <input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                  </div>
              </div>
              
              <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-3">連結標的</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stocks.map((stock, index) => (
                          <div key={index} className="bg-gray-700 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-400 mb-2">
                                  標的 {index + 1}
                              </h4>
                              <div className="space-y-2">
                                  <input
                                      type="text"
                                      placeholder="股票代號"
                                      value={stock.ticker}
                                      onChange={(e) => handleStockChange(index, 'ticker', e.target.value)}
                                      className="w-full p-2 bg-gray-600 text-white rounded focus:ring-2 focus:ring-indigo-500"
                                  />
                                  <input
                                      type="number"
                                      placeholder="KO 價格"
                                      step="0.01"
                                      value={stock.koPrice}
                                      onChange={(e) => handleStockChange(index, 'koPrice', e.target.value)}
                                      className="w-full p-2 bg-gray-600 text-white rounded focus:ring-2 focus:ring-indigo-500"
                                  />
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                  <button
                      type="button"
                      onClick={onCancel}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                      取消
                  </button>
                  <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                  >
                      {mode === 'add' ? '新增' : '更新'}
                  </button>
              </div>
          </form>
      </div>
  );
};

// 產品卡片組件
const FCNProductCard = ({ product, onEdit, onDelete }) => {
  const allKnockedOut = product.stocks.every(s => s.hasKnockedOut);
  const knockedOutCount = product.stocks.filter(s => s.hasKnockedOut).length;
  
  return (
      <div className={`bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 ${
          allKnockedOut ? 'border-green-500' : 'border-indigo-500'
      }`}>
          <div className="flex justify-between items-start mb-4">
              <div>
                  <h3 className="text-xl font-bold text-white">{product.name}</h3>
                  {product.customerName && (
                      <p className="text-gray-400 flex items-center mt-1">
                          <FiUser className="mr-1" size={14} />
                          {product.customerName}
                      </p>
                  )}
              </div>
              <div className="flex space-x-2">
                  <button
                      onClick={() => onEdit(product)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      title="編輯"
                  >
                      <FiEdit size={16} />
                  </button>
                  <button
                      onClick={() => onDelete(product.id)}
                      className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                      title="刪除"
                  >
                      <FiTrash2 size={16} />
                  </button>
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
              {product.orderDate && (
                  <div className="flex items-center text-gray-400">
                      <FiCalendar className="mr-2" size={14} />
                      下單: {product.orderDate}
                  </div>
              )}
              {product.comparisonDate && (
                  <div className="flex items-center text-gray-400">
                      <FiCalendar className="mr-2" size={14} />
                      比價: {product.comparisonDate}
                  </div>
              )}
              {product.expiryDate && (
                  <div className="flex items-center text-gray-400">
                      <FiCalendar className="mr-2" size={14} />
                      到期: {product.expiryDate}
                  </div>
              )}
          </div>
          
          <div className="space-y-2">
              <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-300">連結標的狀況</h4>
                  <span className={`px-2 py-1 rounded text-sm ${
                      allKnockedOut ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                      {knockedOutCount}/{product.stocks.length} 已觸價
                  </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {product.stocks.map((stock, index) => (
                      <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                              stock.hasKnockedOut 
                                  ? 'bg-green-900 border-green-500' 
                                  : 'bg-gray-700 border-gray-600'
                          }`}
                      >
                          <div className="flex justify-between items-center">
                              <span className="font-medium">{stock.ticker}</span>
                              <span className={`text-sm ${
                                  stock.hasKnockedOut ? 'text-green-400' : 'text-gray-400'
                              }`}>
                                  {stock.hasKnockedOut ? '已觸價' : '未觸價'}
                              </span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                              KO: ${stock.koPrice} | 現價: ${stock.lastClosePrice || 0}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
};

// 儀表板組件
const Dashboard = ({ products, onEdit, onDelete }) => {
  if (products.length === 0) {
      return (
          <div className="text-center py-12">
              <div className="text-gray-500 text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">尚無 FCN 產品</h3>
              <p className="text-gray-500">點擊上方按鈕新增您的第一個 FCN 產品</p>
          </div>
      );
  }

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((product) => (
              <FCNProductCard
                  key={product.id}
                  product={product}
                  onEdit={onEdit}
                  onDelete={onDelete}
              />
          ))}
      </div>
  );
};

// 主應用程式組件
export default function App() {
  const [db, setDb] = useState(null);
  const [user, setUser] = useState(null);
  const [fcnProducts, setFcnProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formMode, setFormMode] = useState('hidden');
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [prevProducts, setPrevProducts] = useState([]);

  const addNotification = useCallback((notification) => {
      const id = Date.now() + Math.random();
      setNotifications(current => [...current, { ...notification, id }]);
      setTimeout(() => {
          setNotifications(current => current.filter(n => n.id !== id));
      }, 5000);
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
                  productsData.push
