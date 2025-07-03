<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FCN 結構型商品追蹤器 (專業版)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.10/dayjs.min.js"></script>
    <style>
        body {
            font-family: 'Inter', 'Noto Sans TC', sans-serif;
            scroll-behavior: smooth;
        }
        .toast {
            visibility: hidden;
            min-width: 250px;
            margin-left: -125px;
            background-color: #333;
            color: #fff;
            text-align: center;
            border-radius: 8px;
            padding: 16px;
            position: fixed;
            z-index: 100;
            left: 50%;
            bottom: 30px;
            opacity: 0;
            transition: visibility 0s, opacity 0.5s linear;
        }
        .toast.show {
            visibility: visible;
            opacity: 1;
        }
        /* 個股 KO 狀態 */
        .stock-ko {
            background-color: #dcfce7; /* Green-100 */
            border-left-width: 4px;
            border-left-color: #22c55e; /* Green-500 */
            transition: all 0.3s ease-in-out;
        }
        .stock-ko .stock-ko-label {
            color: #166534; /* Green-800 */
            font-weight: bold;
        }
        /* 整體 FCN KO 狀態 */
        .fcn-ko {
            border-color: #22c55e;
            box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
        }
        /* FCN 到期狀態 */
        .fcn-expired {
            border-color: #f97316;
            opacity: 0.8;
        }
        /* Modal 樣式 */
        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 50;
        }
    </style>
</head>
<body class="bg-gray-50 text-gray-800">

    <div id="app-container" class="container mx-auto p-4 md:p-8 max-w-7xl">

        <!-- Header -->
        <header class="mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-800">FCN 結構型商品追蹤器 (專業版)</h1>
            <p class="text-gray-500 mt-2">自動追蹤股價，輕鬆管理您的 FCN 產品組合。</p>
            <div class="mt-4 bg-white p-4 rounded-xl shadow-sm border">
                <label for="apiKey" class="block text-sm font-medium text-gray-700">Financial Modeling Prep API Key</label>
                <div class="flex items-center space-x-2 mt-1">
                    <input type="password" id="apiKey" placeholder="請貼上您的免費 API Key" class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <button id="saveApiKeyBtn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition">儲存</button>
                </div>
                 <p class="text-xs text-gray-500 mt-1">您的 API Key 將安全地儲存在雲端，僅供您個人使用。</p>
            </div>
        </header>

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <!-- Add/Edit FCN Form -->
            <div id="fcnFormContainer" class="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg h-fit sticky top-8">
                <h2 id="formTitle" class="text-2xl font-bold mb-4">新增 FCN 產品</h2>
                <form id="addFcnForm" class="space-y-4">
                    <input type="hidden" id="editFcnId">
                    <div>
                        <label for="productId" class="block text-sm font-medium text-gray-700">產品編號</label>
                        <input type="text" id="productId" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="issueDate" class="block text-sm font-medium text-gray-700">發行日</label>
                            <input type="date" id="issueDate" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        </div>
                        <div>
                            <label for="comparisonDate" class="block text-sm font-medium text-gray-700">比價日</label>
                            <input type="date" id="comparisonDate" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        </div>
                    </div>
                    <div>
                        <label for="maturityDate" class="block text-sm font-medium text-gray-700">到期日</label>
                        <input type="date" id="maturityDate" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    </div>

                    <div id="linkedStocksContainer" class="space-y-4">
                        <h3 class="text-lg font-medium text-gray-900 pt-2">連結個股 (最多4檔)</h3>
                    </div>

                    <div class="flex items-center space-x-2">
                        <button type="button" id="addStockBtn" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors">新增個股</button>
                    </div>

                    <div class="flex flex-col space-y-2">
                        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
                            <span id="submitBtnText">新增追蹤</span>
                        </button>
                        <button type="button" id="cancelEditBtn" class="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition hidden">取消編輯</button>
                    </div>
                </form>
            </div>

            <!-- FCN List -->
            <div class="lg:col-span-2">
                 <div class="flex flex-wrap gap-4 justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">追蹤列表</h2>
                    <div class="flex items-center gap-2">
                        <button id="syncPricesBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                            <span id="syncBtnText">同步所有股價</span>
                            <span id="syncSpinner" class="hidden">同步中...</span>
                        </button>
                        <button id="checkMaturityBtn" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">檢查到期</button>
                    </div>
                </div>
                <div id="fcnList" class="space-y-6">
                     <p id="loadingState" class="text-center text-gray-500 py-10">正在從雲端載入資料...</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <div id="deleteConfirmModal" class="modal-backdrop hidden">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 class="text-lg font-bold">確認刪除</h3>
            <p class="text-gray-600 mt-2">您確定要刪除這個 FCN 產品嗎？此操作無法復原。</p>
            <div class="mt-6 flex justify-end space-x-3">
                <button id="cancelDeleteBtn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">取消</button>
                <button id="confirmDeleteBtn" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">確認刪除</button>
            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div id="toast" class="toast"></div>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, collection, doc, addDoc, onSnapshot, query, updateDoc, deleteDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // --- Firebase 設定 ---
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : { apiKey: "YOUR_API_KEY", authDomain: "YOUR_AUTH_DOMAIN", projectId: "YOUR_PROJECT_ID" };
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'fcn-tracker-default';

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);

        let currentUserId = null;
        let fcnCollectionRef = null;
        let unsubscribeFcns = null;
        let fcnToDeleteId = null;
        let allFcnsData = []; // Store all FCN data for API calls

        // --- UI 元素 ---
        const apiKeyInput = document.getElementById('apiKey');
        const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
        const addFcnForm = document.getElementById('addFcnForm');
        const linkedStocksContainer = document.getElementById('linkedStocksContainer');
        const addStockBtn = document.getElementById('addStockBtn');
        const fcnList = document.getElementById('fcnList');
        const loadingState = document.getElementById('loadingState');
        const submitBtnText = document.getElementById('submitBtnText');
        const checkMaturityBtn = document.getElementById('checkMaturityBtn');
        const syncPricesBtn = document.getElementById('syncPricesBtn');
        const syncBtnText = document.getElementById('syncBtnText');
        const syncSpinner = document.getElementById('syncSpinner');
        const deleteConfirmModal = document.getElementById('deleteConfirmModal');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        const formTitle = document.getElementById('formTitle');
        const editFcnIdInput = document.getElementById('editFcnId');
        const cancelEditBtn = document.getElementById('cancelEditBtn');

        // --- 核心功能 ---

        function showToast(message, duration = 3000) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), duration);
        }

        function addStockInput(stock = { symbol: '', koPrice: '' }) {
            const stockCount = linkedStocksContainer.querySelectorAll('.stock-group').length;
            if (stockCount >= 4) {
                showToast("最多只能新增4檔個股");
                return;
            }
            const stockDiv = document.createElement('div');
            stockDiv.className = 'stock-group p-3 border border-gray-200 rounded-lg space-y-2 relative';
            stockDiv.innerHTML = `
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-sm font-medium text-gray-600">股票代號</label>
                        <input type="text" placeholder="AAPL, 7203.T" value="${stock.symbol}" required class="stock-symbol mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600">KO 價格</label>
                        <input type="number" step="any" placeholder="例如: 190.5" value="${stock.koPrice}" required class="stock-ko-price mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm">
                    </div>
                </div>
                <button type="button" class="remove-stock-btn absolute top-1 right-1 text-gray-400 hover:text-red-500 text-xs">&times;</button>
            `;
            linkedStocksContainer.appendChild(stockDiv);
        }

        linkedStocksContainer.addEventListener('click', e => {
            if (e.target && e.target.classList.contains('remove-stock-btn')) {
                e.target.closest('.stock-group').remove();
            }
        });
        
        // --- 渲染與顯示 ---
        function renderFcnCard(fcn) {
            let cardClass = '', statusText = fcn.status, statusColor = 'text-blue-600';
            if (fcn.status === '已提前出場') {
                cardClass = 'fcn-ko';
                statusText = `已提前出場 (${fcn.koDate || ''})`;
                statusColor = 'text-green-600';
            } else if (fcn.status === '已到期') {
                cardClass = 'fcn-expired';
                statusText = `已到期 (${fcn.maturityDate})`;
                statusColor = 'text-orange-600';
            }

            const stocksHtml = fcn.stocks.map(stock => {
                const stockStatusClass = stock.hasHitKO ? 'stock-ko' : '';
                const hitDateText = stock.hasHitKO ? ` (${dayjs(stock.hitKODate).format('YYYY/MM/DD')} 觸及)` : '';
                return `
                    <div class="p-3 rounded-lg ${stockStatusClass} border border-gray-200">
                        <div class="flex justify-between items-center">
                            <p class="font-semibold text-lg">${stock.symbol}</p>
                            <p class="text-sm font-mono stock-ko-label">${stock.hasHitKO ? '已觸及KO' : '未觸及'}</p>
                        </div>
                        <p class="text-sm text-gray-600">KO 價格: <span class="font-medium">${stock.koPrice}</span>${hitDateText}</p>
                    </div>
                `;
            }).join('');

            return `
                <div id="${fcn.id}" class="fcn-card bg-white p-5 rounded-2xl shadow-md border-2 border-transparent transition-all duration-300 ${cardClass}">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-xl font-bold text-gray-800">${fcn.productId}</h3>
                            <p class="text-sm font-bold ${statusColor}">${statusText}</p>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button class="edit-btn p-2 text-gray-400 hover:text-blue-600" data-id="${fcn.id}" title="編輯"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                            <button class="delete-btn p-2 text-gray-400 hover:text-red-600" data-id="${fcn.id}" title="刪除"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" /></svg></button>
                        </div>
                    </div>
                    <div class="text-right text-xs text-gray-500 mb-4">
                        <p>比價日: ${fcn.comparisonDate} | 到期日: ${fcn.maturityDate}</p>
                    </div>
                    <div class="space-y-3">${stocksHtml}</div>
                </div>
            `;
        }

        function resetForm() {
            addFcnForm.reset();
            linkedStocksContainer.innerHTML = '';
            addStockInput();
            editFcnIdInput.value = '';
            formTitle.textContent = '新增 FCN 產品';
            submitBtnText.textContent = '新增追蹤';
            cancelEditBtn.classList.add('hidden');
        }

        // --- Firestore & Data Logic ---
        async function saveApiKey() {
            if (!currentUserId || !apiKeyInput.value) return;
            const apiKeyRef = doc(db, 'artifacts', appId, 'users', currentUserId, 'settings', 'apiKey');
            try {
                await setDoc(apiKeyRef, { key: apiKeyInput.value });
                showToast("API Key 已成功儲存！");
            } catch (error) {
                console.error("Error saving API key:", error);
                showToast("API Key 儲存失敗。");
            }
        }

        async function loadApiKey() {
            if (!currentUserId) return;
            const apiKeyRef = doc(db, 'artifacts', appId, 'users', currentUserId, 'settings', 'apiKey');
            try {
                const docSnap = await getDoc(apiKeyRef);
                if (docSnap.exists()) {
                    apiKeyInput.value = docSnap.data().key;
                }
            } catch (error) {
                console.error("Error loading API key:", error);
            }
        }

        function listenToFcns() {
            if (unsubscribeFcns) unsubscribeFcns();
            fcnCollectionRef = collection(db, 'artifacts', appId, 'users', currentUserId, 'fcns');
            const q = query(fcnCollectionRef);

            unsubscribeFcns = onSnapshot(q, (snapshot) => {
                loadingState.style.display = 'none';
                allFcnsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                checkAllMaturities(allFcnsData, false);

                if (allFcnsData.length === 0) {
                    fcnList.innerHTML = '<p class="text-center text-gray-500 py-10">尚未新增任何 FCN 產品。</p>';
                    return;
                }
                fcnList.innerHTML = allFcnsData
                    .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
                    .map(renderFcnCard).join('');
            }, (error) => {
                console.error("Error listening to FCNs:", error);
                fcnList.innerHTML = '<p class="text-center text-red-500 py-10">讀取資料時發生錯誤。</p>';
            });
        }

        addFcnForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUserId) { showToast("錯誤：無法取得用戶資訊"); return; }

            const stockGroups = linkedStocksContainer.querySelectorAll('.stock-group');
            if (stockGroups.length === 0) { showToast("請至少新增一檔連結個股"); return; }
            
            const stocks = Array.from(stockGroups).map(group => ({
                symbol: group.querySelector('.stock-symbol').value.trim().toUpperCase(),
                koPrice: parseFloat(group.querySelector('.stock-ko-price').value),
                hasHitKO: false,
                hitKODate: null
            }));

            const fcnData = {
                productId: document.getElementById('productId').value,
                issueDate: document.getElementById('issueDate').value,
                comparisonDate: document.getElementById('comparisonDate').value,
                maturityDate: document.getElementById('maturityDate').value,
                stocks: stocks,
                userId: currentUserId,
            };

            const editId = editFcnIdInput.value;
            try {
                if (editId) { // 更新模式
                    // 在更新時，保留現有的 KO 狀態
                    const originalFcn = allFcnsData.find(fcn => fcn.id === editId);
                    if (originalFcn) {
                        fcnData.stocks.forEach(newStock => {
                            const originalStock = originalFcn.stocks.find(os => os.symbol === newStock.symbol);
                            if (originalStock && originalStock.hasHitKO) {
                                newStock.hasHitKO = originalStock.hasHitKO;
                                newStock.hitKODate = originalStock.hitKODate;
                            }
                        });
                    }
                    const fcnRef = doc(db, fcnCollectionRef.path, editId);
                    await updateDoc(fcnRef, fcnData);
                    showToast("FCN 更新成功！");
                } else { // 新增模式
                    fcnData.status = '追蹤中';
                    fcnData.koDate = null;
                    await addDoc(fcnCollectionRef, fcnData);
                    showToast("FCN 新增成功！");
                }
                resetForm();
            } catch (error) {
                console.error("Error saving FCN:", error);
                showToast("儲存失敗，請稍後再試。");
            }
        });

        // --- 事件監聽 ---
        fcnList.addEventListener('click', async (e) => {
            const editBtn = e.target.closest('.edit-btn');
            const deleteBtn = e.target.closest('.delete-btn');

            if (editBtn) {
                const fcnId = editBtn.dataset.id;
                const fcnToEdit = allFcnsData.find(fcn => fcn.id === fcnId);
                if (!fcnToEdit) return;

                formTitle.textContent = '編輯 FCN 產品';
                submitBtnText.textContent = '更新產品';
                editFcnIdInput.value = fcnId;
                document.getElementById('productId').value = fcnToEdit.productId;
                document.getElementById('issueDate').value = fcnToEdit.issueDate;
                document.getElementById('comparisonDate').value = fcnToEdit.comparisonDate;
                document.getElementById('maturityDate').value = fcnToEdit.maturityDate;
                
                linkedStocksContainer.innerHTML = '';
                fcnToEdit.stocks.forEach(stock => addStockInput(stock));
                
                cancelEditBtn.classList.remove('hidden');
                document.getElementById('fcnFormContainer').scrollIntoView();
            }

            if (deleteBtn) {
                fcnToDeleteId = deleteBtn.dataset.id;
                deleteConfirmModal.classList.remove('hidden');
            }
        });

        cancelEditBtn.addEventListener('click', resetForm);
        cancelDeleteBtn.addEventListener('click', () => deleteConfirmModal.classList.add('hidden'));
        confirmDeleteBtn.addEventListener('click', async () => {
            if (!fcnToDeleteId) return;
            try {
                await deleteDoc(doc(db, fcnCollectionRef.path, fcnToDeleteId));
                showToast("產品已刪除");
                fcnToDeleteId = null;
                deleteConfirmModal.classList.add('hidden');
            } catch (error) {
                console.error("Error deleting FCN:", error);
                showToast("刪除失敗");
            }
        });

        // --- 自動化與檢查 ---
        async function syncPrices() {
            const apiKey = apiKeyInput.value;
            if (!apiKey) {
                showToast("請先輸入並儲存您的 API Key。");
                return;
            }
            syncPricesBtn.disabled = true;
            syncBtnText.classList.add('hidden');
            syncSpinner.classList.remove('hidden');

            const today = dayjs().startOf('day');
            const stocksToFetch = new Set();
            const fcnsToUpdate = allFcnsData.filter(fcn => {
                const comparisonDate = dayjs(fcn.comparisonDate);
                return fcn.status === '追蹤中' && (today.isAfter(comparisonDate) || today.isSame(comparisonDate));
            });

            if (fcnsToUpdate.length === 0) {
                showToast("沒有需要同步的追蹤中產品。");
                syncPricesBtn.disabled = false;
                syncBtnText.classList.remove('hidden');
                syncSpinner.classList.add('hidden');
                return;
            }

            fcnsToUpdate.forEach(fcn => {
                fcn.stocks.forEach(stock => {
                    if (!stock.hasHitKO) stocksToFetch.add(stock.symbol);
                });
            });
            
            if (stocksToFetch.size === 0) {
                showToast("所有追蹤中個股均已達KO價。");
                syncPricesBtn.disabled = false;
                syncBtnText.classList.remove('hidden');
                syncSpinner.classList.add('hidden');
                return;
            }

            try {
                const url = `https://financialmodelingprep.com/api/v3/quote/${[...stocksToFetch].join(',')}?apikey=${apiKey}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`API 請求失敗: ${response.statusText}`);
                const priceData = await response.json();
                
                let updatedCount = 0;
                const priceMap = new Map(priceData.map(d => [d.symbol, d.price]));

                for (const fcn of fcnsToUpdate) {
                    let hasUpdates = false;
                    for (let i = 0; i < fcn.stocks.length; i++) {
                        const stock = fcn.stocks[i];
                        if (!stock.hasHitKO && priceMap.has(stock.symbol)) {
                            const currentPrice = priceMap.get(stock.symbol);
                            if (currentPrice >= stock.koPrice) {
                                const updatePath = `stocks.${i}.hasHitKO`;
                                const updateDatePath = `stocks.${i}.hitKODate`;
                                const fcnRef = doc(db, fcnCollectionRef.path, fcn.id);
                                await updateDoc(fcnRef, {
                                    [updatePath]: true,
                                    [updateDatePath]: dayjs().format('YYYY-MM-DD')
                                });
                                hasUpdates = true;
                                updatedCount++;
                            }
                        }
                    }
                    if (hasUpdates) {
                        // 檢查是否所有股票都已 KO
                        const updatedFcnDoc = await getDoc(doc(db, fcnCollectionRef.path, fcn.id));
                        const updatedFcnData = updatedFcnDoc.data();
                        const allHitKO = updatedFcnData.stocks.every(s => s.hasHitKO);
                        if (allHitKO) {
                            await updateDoc(doc(db, fcnCollectionRef.path, fcn.id), {
                                status: '已提前出場',
                                koDate: dayjs().format('YYYY-MM-DD')
                            });
                        }
                    }
                }
                showToast(`同步完成！${updatedCount} 檔個股狀態已更新。`);
            } catch (error) {
                console.error("Error syncing prices:", error);
                showToast("股價同步失敗，請檢查 API Key 或股票代號。");
            } finally {
                syncPricesBtn.disabled = false;
                syncBtnText.classList.remove('hidden');
                syncSpinner.classList.add('hidden');
            }
        }
        
        async function checkAllMaturities(fcns, showMsg = true) {
            const today = dayjs().startOf('day');
            let updatedCount = 0;
            for (const fcn of fcns) {
                if (fcn.status === '追蹤中' && today.isAfter(dayjs(fcn.maturityDate))) {
                    const fcnRef = doc(db, fcnCollectionRef.path, fcn.id);
                    await updateDoc(fcnRef, { status: '已到期' });
                    updatedCount++;
                }
            }
            if (showMsg && updatedCount > 0) {
                showToast(`已將 ${updatedCount} 個產品標示為已到期。`);
            }
        }

        // --- 初始化 ---
        onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUserId = user.uid;
                listenToFcns();
                loadApiKey();
            } else {
                console.log("User is not signed in.");
            }
        });
        
        async function initializeAuth() {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Authentication failed:", error);
            }
        }

        window.onload = () => {
            addStockInput();
            addStockBtn.addEventListener('click', () => addStockInput());
            saveApiKeyBtn.addEventListener('click', saveApiKey);
            syncPricesBtn.addEventListener('click', syncPrices);
            checkMaturityBtn.addEventListener('click', () => checkAllMaturities(allFcnsData, true));
            initializeAuth();
        };
    </script>
</body>
</html>
