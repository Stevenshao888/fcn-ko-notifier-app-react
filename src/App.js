import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInAnonymously, 
    onAuthStateChanged,
    signInWithCustomToken
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
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {}; 
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

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
    const [showNotificationModal, setShowNotificationModal] = useState(false);
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
                addNotification({ title: `產品可出場: ${product.name}`, message: '所有連結標的皆已觸價！' });
            });
        }
        setPrevProducts(JSON.parse(JSON.stringify(fcnProducts)));
    }, [fcnProducts, addNotification, prevProducts]);

    useEffect(() => {
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
                        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                            await signInWithCustomToken(authInstance, __initial_auth_token);
                        } else {
                            await signInAnonymously(authInstance);
                        }
                    } catch (authError) { console.error("登入失敗:", authError); setError("無法連接到認證服務。"); setIsLoading(false); }
                }
            });
        } catch (e) { console.error("Firebase 初始化失敗:", e); setError("應用程式設定錯誤。"); setIsLoading(false); }
    }, []);

    useEffect(() => {
        if (user && db) {
            const userId = user.uid;
            const collectionPath = `artifacts/${appId}/users/${userId}/fcn_products`;
            const q = query(collection(db, collectionPath));

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const productsData = [];
                querySnapshot.forEach((doc) => {
                    productsData.push({ id: doc.id, ...doc.data() });
                });
                setFcnProducts(productsData);
            }, (err) => { console.error("Firestore 監聽失敗:", err); setError("無法讀取您的 FCN 產品清單。"); });
            return () => unsubscribe();
        }
    }, [user, db]);
    
    const closeForm = () => { setFormMode('hidden'); setEditingProduct(null); };

    const handleAddFCN = async (product) => {
        if (!db || !user) return;
        const initialStocks = product.stocks.map(stock => ({ ...stock, lastClosePrice: parseFloat((Math.random() * (stock.koPrice * 0.8) + (stock.koPrice * 0.1)).toFixed(2)), hasKnockedOut: false }));
        try {
            const userId = user.uid;
            const collectionPath = `artifacts/${appId}/users/${userId}/fcn_products`;
            await addDoc(collection(db, collectionPath), { ...product, stocks: initialStocks, createdAt: new Date(), comparisonNotificationSent: false, maturityNotificationSent: false });
            closeForm();
        } catch (e) { console.error("新增 FCN 失敗:", e); setError("無法新增 FCN 產品。"); }
    };
    
    const handleUpdateFCN = async (product) => {
        if (!db || !user || !editingProduct) return;
        try {
            const userId = user.uid;
            const docPath = `artifacts/${appId}/users/${userId}/fcn_products/${editingProduct.id}`;
            const updatedStocks = product.stocks.map(newStock => {
                const oldStock = editingProduct.stocks.find(s => s.ticker === newStock.ticker);
                return { ...newStock, hasKnockedOut: oldStock ? oldStock.hasKnockedOut : false, lastClosePrice: oldStock ? oldStock.lastClosePrice : 0 };
            });
            
            const finalProductData = { ...product, stocks: updatedStocks };
            if (product.comparisonDate !== editingProduct.comparisonDate) { finalProductData.comparisonNotificationSent = false; }
            if (product.expiryDate !== editingProduct.expiryDate) { finalProductData.maturityNotificationSent = false; }

            await updateDoc(doc(db, docPath), finalProductData);
            closeForm();
        } catch (e) { console.error("更新 FCN 失敗:", e); setError("無法更新 FCN 產品。"); }
    };

    const handleDeleteFCN = async (id) => {
        if (!db || !user) return;
        try {
            const userId = user.uid;
            const docPath = `artifacts/${appId}/users/${userId}/fcn_products/${id}`;
            await deleteDoc(doc(db, docPath));
            addNotification({ title: '操作成功', message: '已成功刪除 FCN 產品。' });
        } catch (e) { console.error("刪除 FCN 失敗:", e); setError("無法刪除 FCN 產品。"); }
    };

    const handleRefreshPrices = async () => {
        if (!db || !user || fcnProducts.length === 0) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTime = today.getTime();

        const updatePromises = [];
        let koSimulated = false;

        // 1. Check for date-based notifications for all products
        fcnProducts.forEach(product => {
            const productUpdates = {};

            // Check for Comparison Date Start
            if (product.comparisonDate && !product.comparisonNotificationSent) {
                const comparisonDate = new Date(product.comparisonDate);
                comparisonDate.setHours(0, 0, 0, 0);
                if (comparisonDate.getTime() === todayTime) {
                    addNotification({ title: '比價開始', message: `產品 "${product.name}" 已到達比價日。`, type: 'info' });
                    productUpdates.comparisonNotificationSent = true;
                }
            }

            // Check for Maturity Date
            if (product.expiryDate && !product.maturityNotificationSent) {
                const expiryDate = new Date(product.expiryDate);
                expiryDate.setHours(0, 0, 0, 0);
                const isAllKO = product.stocks.every(s => s.hasKnockedOut);

                if (expiryDate.getTime() === todayTime && !isAllKO) {
                    addNotification({ title: '產品到期提醒', message: `產品 "${product.name}" 已到期但未完全出場。`, type: 'error' });
                    productUpdates.maturityNotificationSent = true;
                }
            }
            
            if (Object.keys(productUpdates).length > 0) {
                const docPath = `artifacts/${appId}/users/${user.uid}/fcn_products/${product.id}`;
                updatePromises.push(updateDoc(doc(db, docPath), productUpdates));
            }
        });

        // 2. Perform KO Simulation
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
                addNotification({ title: '模擬觸價成功', message: `產品 ${productToUpdateForKO.name} 中的 ${stock.ticker} 已觸價！`, type: 'success' });
                koSimulated = true;
                
                const docPath = `artifacts/${appId}/users/${user.uid}/fcn_products/${productToUpdateForKO.id}`;
                updatePromises.push(updateDoc(doc(db, docPath), { stocks: updatedStocks }));
            }
        } 
        
        if (updatePromises.length === 0 && !koSimulated) {
             addNotification({ title: '提示', message: '沒有可模擬的事件。', type: 'info' });
        }

        // 3. Execute all updates
        if (updatePromises.length > 0) {
            try {
                await Promise.all(updatePromises);
            } catch (e) { console.error("更新失敗:", e); setError("執行每日檢查時發生錯誤。"); }
        }
    };
    
    const handleEditClick = (product) => { setEditingProduct(product); setFormMode('edit'); };

    if (isLoading) return <LoadingScreen />;
    if (error) return <ErrorScreen message={error} />;

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <NotificationArea notifications={notifications} />
            <div className="container mx-auto p-4 md:p-8">
                <Header onRefresh={handleRefreshPrices} onInfo={() => setShowInfoModal(true)} onNotify={() => setShowNotificationModal(true)} />
                {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} userId={user?.uid} />}
                {showNotificationModal && <NotificationSettingsModal onClose={() => setShowNotificationModal(false)} addNotification={addNotification} />}
                <main>
                    {formMode !== 'hidden' ? (
                        <FCNForm mode={formMode} initialData={editingProduct} onSubmit={formMode === 'add' ? handleAddFCN : handleUpdateFCN} onCancel={closeForm} />
                    ) : (
                        <div className="flex justify-end mb-4"><button onClick={() => setFormMode('add')} className="flex items-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"><FiPlus className="mr-2" /> 新增 FCN 產品</button></div>
                    )}
                    <Dashboard products={fcnProducts} onEdit={handleEditClick} onDelete={handleDeleteFCN} />
                </main>
            </div>
        </div>
    );
}

// --- 子組件 ---

const LoadingScreen = () => <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white"><div className="text-center"><CgSpinner className="animate-spin text-5xl text-indigo-400 mx-auto" /><p className="mt-4 text-lg">正在載入應用程式...</p></div></div>;
const ErrorScreen = ({ message }) => <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-400"><div className="text-center p-8 bg-gray-800 rounded-lg shadow-2xl"><FiAlertTriangle className="text-5xl text-red-500 mx-auto" /><h2 className="mt-4 text-2xl font-bold">發生錯誤</h2><p className="mt-2">{message}</p></div></div>;

const Header = ({ onRefresh, onInfo, onNotify }) => (
    <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <div><h1 className="text-3xl md:text-4xl font-bold text-white">FCN 觸價通知</h1><p className="text-gray-400">以產品組合為單位，追蹤記憶式出場條件</p></div>
        <div className="flex items-center space-x-2">
            <button onClick={onNotify} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors relative" title="通知設定"><FiBell className="text-xl" /></button>
            <button onClick={onInfo} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors" title="應用程式資訊"><FiInfo className="text-xl" /></button>
            <button onClick={onRefresh} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors" title="模擬每日檢查"><FiRefreshCw className="mr-2" /><span className="hidden md:inline">模擬每日檢查</span></button>
        </div>
    </header>
);

const InfoModal = ({ onClose, userId }) => <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full p-6 relative animate-fade-in"><button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><FiX size={24} /></button><h2 className="text-2xl font-bold mb-4 text-indigo-400">應用程式資訊</h2><div className="space-y-3 text-gray-300"><p><strong>新功能:</strong></p><ul className="list-disc list-inside space-y-2 pl-2"><li>連結標的已增加為四檔。</li><li>已新增客戶姓名欄位。</li><li>點擊 <span className="font-mono bg-gray-700 px-1 rounded">模擬每日檢查</span> 會觸發當日所有事件。</li></ul><p className="pt-2">您的專屬使用者 ID 為:</p><p className="font-mono bg-gray-900 p-2 rounded text-indigo-300 text-xs break-all">{userId}</p></div></div></div>;

const NotificationSettingsModal = ({ onClose, addNotification }) => {
    const [permission, setPermission] = useState('default');
    const [email, setEmail] = useState('');
    const handleRequestPermission = () => {
        setPermission('granting');
        addNotification({ title: '模擬授權', message: '瀏覽器正在向您請求傳送通知的權限...' });
        setTimeout(() => { setPermission('granted'); addNotification({ title: '授權成功', message: '您已允許瀏覽器推播通知！', type: 'success' }); }, 1500);
    };
    const handleSaveEmail = () => {
        if(email && email.includes('@')) { addNotification({ title: '設定成功', message: `電子郵件通知將發送到 ${email}`, type: 'success' }); onClose(); } 
        else { addNotification({ title: '錯誤', message: '請輸入有效的電子郵件地址。', type: 'error' }); }
    };
    return <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full p-6 relative animate-fade-in"><button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><FiX size={24} /></button><h2 className="text-2xl font-bold mb-4 text-indigo-400">通知設定</h2><div className="space-y-6 text-gray-300"><div><h3 className="text-lg font-semibold mb-2">瀏覽器推播</h3><p className="text-sm text-gray-400 mb-3">允許後，當產品達標時會立即在您的裝置上顯示通知。</p>{permission === 'default' && <button onClick={handleRequestPermission} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">允許瀏覽器通知</button>}{permission === 'granting' && <button className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg cursor-not-allowed" disabled>正在請求...</button>}{permission === 'granted' && <div className="w-full text-center py-2 px-4 rounded-lg bg-green-500/20 text-green-300">已允許</div>}</div><div><h3 className="text-lg font-semibold mb-2">電子郵件通知</h3><p className="text-sm text-gray-400 mb-3">設定後，將同時發送郵件到您的信箱作為備份。</p><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div></div><div className="flex justify-end mt-8"><button onClick={handleSaveEmail} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg">儲存設定</button></div></div></div>;
};

const FCNForm = ({ mode, initialData, onSubmit, onCancel }) => {
    const [name, setName] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [orderDate, setOrderDate] = useState('');
    const [comparisonDate, setComparisonDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [stocks, setStocks] = useState([...Array(4)].map(() => ({ ticker: '', koPrice: '', market: 'US' })));
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setName(initialData.name || '');
            setCustomerName(initialData.customerName || '');
            setOrderDate(initialData.orderDate || '');
            setComparisonDate(initialData.comparisonDate || '');
            setExpiryDate(initialData.expiryDate || '');
            const filledStocks = initialData.stocks.map(s => ({...s}));
            while (filledStocks.length < 4) { filledStocks.push({ ticker: '', koPrice: '', market: 'US' }); }
            setStocks(filledStocks);
        }
    }, [mode, initialData]);

    const handleStockChange = (index, field, value) => { const newStocks = [...stocks]; newStocks[index][field] = value; setStocks(newStocks); };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) { setFormError('FCN 產品名稱為必填項目。'); return; }
        const validStocks = stocks.filter(s => s.ticker.trim() && s.koPrice);
        if (validStocks.length === 0) { setFormError('請至少填寫一組有效的連結標的。'); return; }
        for (const stock of validStocks) { if (isNaN(stock.koPrice) || parseFloat(stock.koPrice) <= 0) { setFormError(`股票 ${stock.ticker} 的 KO 價格必須是正數。`); return; } }
        onSubmit({ name: name.trim(), customerName: customerName.trim(), orderDate, comparisonDate, expiryDate, stocks: validStocks.map(s => ({...s, ticker: s.ticker.toUpperCase().trim(), koPrice: parseFloat(s.koPrice)})) });
    };

    return <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6 animate-fade-in"><h2 className="text-2xl font-bold mb-4">{mode === 'edit' ? '編輯 FCN 產品' : '新增 FCN 產品'}</h2><form onSubmit={handleSubmit}><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"><div className="col-span-1"><label htmlFor="fcnName" className="block text-gray-400 mb-2">FCN 產品名稱</label><input id="fcnName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：我的2025第一季FCN" className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div><div className="col-span-1"><label htmlFor="customerName" className="block text-gray-400 mb-2">客戶姓名</label><input id="customerName" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="例如：王大明" className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"><div className="col-span-1"><label htmlFor="orderDate" className="block text-gray-400 mb-2">下單日期</label><input id="orderDate" type="date" value={orderDate} onChange={e=>setOrderDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div><div className="col-span-1"><label htmlFor="comparisonDate" className="block text-gray-400 mb-2">比價日期</label><input id="comparisonDate" type="date" value={comparisonDate} onChange={e=>setComparisonDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div><div className="col-span-1"><label htmlFor="expiryDate" className="block text-gray-400 mb-2">到期日</label><input id="expiryDate" type="date" value={expiryDate} onChange={e=>setExpiryDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div></div><h3 className="text-lg font-semibold mb-3">連結標的 (最多4檔)</h3><div className="space-y-4">{stocks.map((stock, index) => (<div key={index} className="p-4 bg-gray-700/50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="block text-gray-400 text-sm mb-1">股票代號 {index + 1}</label><input type="text" value={stock.ticker} onChange={(e) => handleStockChange(index, 'ticker', e.target.value)} placeholder="AAPL" className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div><div><label className="block text-gray-400 text-sm mb-1">KO 價格</label><input type="number" value={stock.koPrice} onChange={(e) => handleStockChange(index, 'koPrice', e.target.value)} placeholder="150.5" className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div><div><label className="block text-gray-400 text-sm mb-1">市場</label><select value={stock.market} onChange={(e) => handleStockChange(index, 'market', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="US">美股</option><option value="JP">日股</option></select></div></div>))}</div>{formError && <p className="text-red-400 mt-4">{formError}</p>}<div className="flex justify-end space-x-4 mt-6"><button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">取消</button><button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">{mode === 'edit' ? '確認儲存' : '確認新增'}</button></div></form></div>;
};

const Dashboard = ({ products, onEdit, onDelete }) => {
    if (products.length === 0) return <div className="text-center py-16 px-6 bg-gray-800 rounded-lg shadow-inner"><FiBox className="mx-auto text-5xl text-gray-500" /><h3 className="mt-4 text-2xl font-semibold">您的儀表板是空的</h3><p className="mt-2 text-gray-400">點擊「新增 FCN 產品」來建立您的第一個追蹤組合吧！</p></div>;
    return <div className="space-y-8">{products.map(product => <FCNProductCard key={product.id} product={product} onEdit={() => onEdit(product)} onDelete={() => onDelete(product.id)} />)}</div>;
};

const FCNProductCard = ({ product, onEdit, onDelete }) => {
    const allKnockedOut = useMemo(() => product.stocks.every(s => s.hasKnockedOut), [product.stocks]);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const comparisonDate = product.comparisonDate ? new Date(product.comparisonDate) : null;
    if(comparisonDate) comparisonDate.setHours(0,0,0,0);
    const isBeforeComparisonDate = comparisonDate && comparisonDate > today;

    const expiryDate = product.expiryDate ? new Date(product.expiryDate) : null;
    if (expiryDate) expiryDate.setHours(0, 0, 0, 0);
    const isMatured = expiryDate && expiryDate <= today && !allKnockedOut;


    return <div className={`bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 animate-fade-in ${allKnockedOut ? 'ring-2 ring-green-500 shadow-green-500/20' : ''} ${isMatured ? 'ring-2 ring-red-500 shadow-red-500/20' : ''}`}><div className="p-5 bg-gray-800/40"><div className="flex justify-between items-start gap-4"><div className="flex-1"><h3 className="text-xl font-bold">{product.name}</h3>{product.customerName && <p className="text-sm text-indigo-300 flex items-center mt-1"><FiUser className="mr-2"/>{product.customerName}</p>}</div><div className="flex items-center space-x-2 flex-shrink-0"><button onClick={onEdit} className="flex items-center text-sm bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-lg shadow-md transition-colors"><FiEdit className="mr-2 h-4 w-4"/>重新編輯</button><button onClick={onDelete} className="flex items-center text-sm bg-red-800 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg shadow-md transition-colors"><FiTrash2 className="mr-2 h-4 w-4"/>刪除組合</button></div></div><div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">{product.orderDate && <div className="flex items-center"><FiCalendar className="mr-2"/>下單: {product.orderDate}</div>}{product.comparisonDate && <div className="flex items-center"><FiCalendar className="mr-2"/>比價: {product.comparisonDate}</div>}{product.expiryDate && <div className="flex items-center"><FiCalendar className="mr-2"/>到期: {product.expiryDate}</div>}</div><div className="mt-3 space-y-2">{isBeforeComparisonDate && <div className="flex items-center justify-center text-center p-2 bg-yellow-500/20 text-yellow-300 rounded-lg font-semibold text-sm"><FiClock className="mr-2"/>等待比價日</div>}{isMatured && <div className="flex items-center justify-center text-center p-2 bg-red-500/20 text-red-300 rounded-lg font-semibold text-sm"><FiAlertTriangle className="mr-2"/>已到期未出場</div>}{allKnockedOut && <div className="flex items-center justify-center text-center p-2 bg-green-500/20 text-green-300 rounded-lg font-bold text-lg animate-pulse"><FiCheckCircle className="mr-3 text-2xl"/>所有標的皆已觸價，可以出場！</div>}</div></div><div className="p-5 space-y-4">{product.stocks.map((stock, index) => <UnderlyingStockRow key={index} stock={stock} isBeforeComparisonDate={isBeforeComparisonDate} />)}</div></div>;
};

const UnderlyingStockRow = ({ stock, isBeforeComparisonDate }) => {
    const { ticker, koPrice, lastClosePrice, market, hasKnockedOut } = stock;
    const percentage = useMemo(() => { if (!koPrice || koPrice <= 0) return 0; return Math.min(100, (lastClosePrice / koPrice) * 100); }, [lastClosePrice, koPrice]);
    return <div className={`p-3 rounded-lg transition-colors ${hasKnockedOut ? 'bg-green-500/20' : 'bg-gray-700/50'}`}><div className="flex flex-wrap justify-between items-center gap-4"><div className="flex items-center gap-3">{hasKnockedOut ? <FiCheckCircle className="text-green-400 text-xl flex-shrink-0" /> : <FiTarget className="text-indigo-400 text-xl flex-shrink-0" />}<span className="font-bold text-lg">{ticker}</span><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${market === 'US' ? 'bg-blue-900 text-blue-300' : 'bg-red-900 text-red-300'}`}>{market === 'US' ? '美' : '日'}</span></div><div className="font-mono text-sm text-gray-300"><span>{lastClosePrice.toFixed(2)}</span><span className="text-gray-500 mx-1">/</span><span className="font-bold text-indigo-300">{koPrice.toFixed(2)}</span></div></div><div className="mt-2"><div className="w-full bg-gray-600 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${isBeforeComparisonDate ? 'bg-gray-500' : hasKnockedOut ? 'bg-green-400' : 'bg-indigo-500'}`} style={{ width: `${percentage}%` }}></div></div></div></div>;
};

const NotificationArea = ({ notifications }) => (
    <div className="fixed top-4 right-4 z-50 w-80 space-y-3">
        {notifications.map(n => <NotificationToast key={n.id} {...n} />)}
    </div>
);

const NotificationToast = ({ title, message, type = 'info' }) => {
    const colors = { info: 'bg-blue-500', success: 'bg-green-500', error: 'bg-red-500' };
    return <div className={`flex items-start p-4 rounded-lg shadow-lg text-white ${colors[type]} animate-fade-in`}><div><p className="font-bold">{title}</p><p className="text-sm">{message}</p></div></div>;
};

// CSS 動畫
const style = document.createElement('style');
style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&family=Roboto+Mono&display=swap'); body { font-family: 'Noto Sans TC', 'sans-serif'; } .font-sans { font-family: 'Noto Sans TC', 'sans-serif'; } .font-mono { font-family: 'Roboto Mono', 'monospace'; } @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.5s ease-out forwards; } .bg-gray-700 [type='date']::-webkit-calendar-picker-indicator { filter: invert(1); }`;
document.head.appendChild(style);
