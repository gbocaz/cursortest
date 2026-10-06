// MiniPOS - Sistema de Control de Inventario y Ventas
// =====================================================

class MiniPOS {
    constructor() {
        this.currentSale = [];
        this.inventory = [];
        this.sales = [];
        this.config = {
            minStockAlert: 5
        };
        this.scanner = null;
        this.isScanning = false;

        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateUI();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        this.checkLowStock();
    }

    // ==================== DATA MANAGEMENT ====================
    
    loadData() {
        try {
            this.inventory = JSON.parse(localStorage.getItem('minipos_inventory')) || [];
            this.sales = JSON.parse(localStorage.getItem('minipos_sales')) || [];
            this.config = JSON.parse(localStorage.getItem('minipos_config')) || { minStockAlert: 5 };
        } catch (e) {
            console.error('Error loading data:', e);
            this.showToast('Error al cargar datos', 'error');
        }
    }

    saveData() {
        try {
            localStorage.setItem('minipos_inventory', JSON.stringify(this.inventory));
            localStorage.setItem('minipos_sales', JSON.stringify(this.sales));
            localStorage.setItem('minipos_config', JSON.stringify(this.config));
        } catch (e) {
            console.error('Error saving data:', e);
            this.showToast('Error al guardar datos', 'error');
        }
    }

    // ==================== SCANNER ====================
    
    startScanner() {
        const readerElement = document.getElementById('scanner-reader');
        const statusElement = document.getElementById('scanner-status');
        const btnStart = document.getElementById('btn-start-scan');

        if (this.isScanning) {
            this.stopScanner();
            return;
        }

        readerElement.style.display = 'block';
        btnStart.textContent = '⏸️ Detener Escaneo';
        btnStart.classList.remove('btn-primary');
        btnStart.classList.add('btn-secondary');

        this.scanner = new Html5QrcodeScanner('scanner-reader', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            supportedScanTypes: [
                Html5QrcodeScanType.SCAN_TYPE_CAMERA
            ]
        });

        this.scanner.render(
            (decodedText) => {
                this.onScanSuccess(decodedText);
            },
            (error) => {
                // Ignorar errores de escaneo continuo
            }
        );

        this.isScanning = true;
    }

    stopScanner() {
        if (this.scanner) {
            this.scanner.clear();
            this.scanner = null;
        }

        const readerElement = document.getElementById('scanner-reader');
        const btnStart = document.getElementById('btn-start-scan');
        
        readerElement.style.display = 'none';
        btnStart.textContent = '📷 Iniciar Escaneo';
        btnStart.classList.remove('btn-secondary');
        btnStart.classList.add('btn-primary');
        
        this.isScanning = false;
    }

    onScanSuccess(code) {
        // Buscar producto por código
        const product = this.inventory.find(p => p.code === code);
        
        if (product) {
            if (product.stock > 0) {
                this.addToSale(product);
                this.showToast(`✓ ${product.name} agregado`, 'success');
                
                // Vibrar si está disponible
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
            } else {
                this.showToast(`⚠️ ${product.name} sin stock`, 'error');
            }
        } else {
            this.showToast(`❌ Producto no encontrado: ${code}`, 'error');
            
            // Ofrecer agregarlo
            if (confirm(`¿Desear agregar el producto con código ${code} al inventario?`)) {
                this.openProductModal(null, code);
            }
        }
    }

    // ==================== SALES ====================
    
    addToSale(product) {
        const existingItem = this.currentSale.find(item => item.id === product.id);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity++;
            } else {
                this.showToast('Stock insuficiente', 'error');
                return;
            }
        } else {
            this.currentSale.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                maxStock: product.stock
            });
        }
        
        this.renderSaleItems();
        this.updateSaleTotal();
    }

    removeFromSale(productId) {
        this.currentSale = this.currentSale.filter(item => item.id !== productId);
        this.renderSaleItems();
        this.updateSaleTotal();
    }

    updateSaleItemQuantity(productId, delta) {
        const item = this.currentSale.find(i => i.id === productId);
        if (!item) return;

        const newQuantity = item.quantity + delta;
        
        if (newQuantity <= 0) {
            this.removeFromSale(productId);
        } else if (newQuantity <= item.maxStock) {
            item.quantity = newQuantity;
            this.renderSaleItems();
            this.updateSaleTotal();
        } else {
            this.showToast('Stock insuficiente', 'error');
        }
    }

    renderSaleItems() {
        const container = document.getElementById('sale-items');
        
        if (this.currentSale.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No hay productos en la venta actual</p>
                    <p class="text-muted">Escanea un código o busca manualmente</p>
                </div>
            `;
            document.getElementById('btn-complete-sale').disabled = true;
            return;
        }

        document.getElementById('btn-complete-sale').disabled = false;

        container.innerHTML = this.currentSale.map(item => `
            <div class="sale-item">
                <div class="sale-item-info">
                    <div class="sale-item-name">${item.name}</div>
                    <div class="sale-item-details">$${item.price.toFixed(2)} c/u</div>
                </div>
                <div class="sale-item-quantity">
                    <button class="quantity-btn" onclick="app.updateSaleItemQuantity('${item.id}', -1)">−</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="app.updateSaleItemQuantity('${item.id}', 1)">+</button>
                </div>
                <div class="sale-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');
    }

    updateSaleTotal() {
        const subtotal = this.currentSale.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        document.getElementById('sale-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('sale-total').textContent = `$${subtotal.toFixed(2)}`;
    }

    clearSale() {
        if (this.currentSale.length === 0) return;
        
        if (confirm('¿Limpiar la venta actual?')) {
            this.currentSale = [];
            this.renderSaleItems();
            this.updateSaleTotal();
            this.showToast('Venta limpiada', 'success');
        }
    }

    completeSale() {
        if (this.currentSale.length === 0) return;

        const total = this.currentSale.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Actualizar stock
        this.currentSale.forEach(item => {
            const product = this.inventory.find(p => p.id === item.id);
            if (product) {
                product.stock -= item.quantity;
            }
        });

        // Guardar venta
        this.sales.push({
            id: Date.now().toString(),
            date: new Date().toISOString(),
            items: [...this.currentSale],
            total: total
        });

        this.saveData();
        this.showToast(`✓ Venta completada: $${total.toFixed(2)}`, 'success');
        
        this.currentSale = [];
        this.renderSaleItems();
        this.updateSaleTotal();
        this.updateInventoryView();
        this.updateReportsView();
        this.checkLowStock();
        
        // Vibrar si está disponible
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    // ==================== INVENTORY ====================
    
    addProduct(productData) {
        const product = {
            id: productData.id || Date.now().toString(),
            code: productData.code,
            name: productData.name,
            price: parseFloat(productData.price),
            stock: parseInt(productData.stock),
            category: productData.category || 'Sin categoría',
            createdAt: productData.createdAt || new Date().toISOString()
        };

        const existingIndex = this.inventory.findIndex(p => p.id === product.id);
        
        if (existingIndex >= 0) {
            this.inventory[existingIndex] = product;
            this.showToast('Producto actualizado', 'success');
        } else {
            this.inventory.push(product);
            this.showToast('Producto agregado', 'success');
        }

        this.saveData();
        this.updateInventoryView();
        this.checkLowStock();
    }

    deleteProduct(productId) {
        if (!confirm('¿Eliminar este producto?')) return;

        this.inventory = this.inventory.filter(p => p.id !== productId);
        this.saveData();
        this.updateInventoryView();
        this.showToast('Producto eliminado', 'success');
    }

    updateInventoryView() {
        const filterValue = document.getElementById('filter-inventory').value.toLowerCase();
        const filtered = this.inventory.filter(p => 
            p.name.toLowerCase().includes(filterValue) ||
            p.code.toLowerCase().includes(filterValue) ||
            p.category.toLowerCase().includes(filterValue)
        );

        // Update stats
        document.getElementById('total-products').textContent = this.inventory.length;
        
        const lowStockCount = this.inventory.filter(p => p.stock <= this.config.minStockAlert).length;
        document.getElementById('low-stock-count').textContent = lowStockCount;
        
        const totalValue = this.inventory.reduce((sum, p) => sum + (p.price * p.stock), 0);
        document.getElementById('inventory-value').textContent = `$${totalValue.toFixed(2)}`;

        // Render list
        const container = document.getElementById('inventory-list');
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No hay productos en el inventario</p>
                    <p class="text-muted">Agrega productos para comenzar</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(product => {
            const isLowStock = product.stock <= this.config.minStockAlert;
            return `
                <div class="inventory-item">
                    <div class="inventory-item-header">
                        <div class="inventory-item-name">${product.name}</div>
                        <div class="inventory-item-actions">
                            <button class="icon-btn" onclick="app.openProductModal('${product.id}')" title="Editar">✏️</button>
                            <button class="icon-btn" onclick="app.deleteProduct('${product.id}')" title="Eliminar">🗑️</button>
                        </div>
                    </div>
                    <div class="inventory-item-details">
                        <div class="detail-item">
                            <span class="detail-label">Código</span>
                            <span class="detail-value">${product.code}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Precio</span>
                            <span class="detail-value">$${product.price.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Categoría</span>
                            <span class="detail-value">${product.category}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Stock</span>
                            <span class="detail-value">
                                <span class="stock-badge ${isLowStock ? 'stock-low' : 'stock-ok'}">
                                    ${product.stock} unidades
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    checkLowStock() {
        const lowStockProducts = this.inventory.filter(p => p.stock <= this.config.minStockAlert);
        const alertBanner = document.getElementById('low-stock-alert');
        const message = document.getElementById('low-stock-message');

        if (lowStockProducts.length > 0) {
            alertBanner.style.display = 'flex';
            message.textContent = `${lowStockProducts.length} producto(s) con stock bajo: ${lowStockProducts.map(p => p.name).join(', ')}`;
        } else {
            alertBanner.style.display = 'none';
        }
    }

    // ==================== REPORTS ====================
    
    updateReportsView() {
        const today = new Date().toDateString();
        const todaySales = this.sales.filter(s => new Date(s.date).toDateString() === today);
        
        const totalSalesCount = todaySales.length;
        const totalSalesAmount = todaySales.reduce((sum, s) => sum + s.total, 0);
        const avgSale = totalSalesCount > 0 ? totalSalesAmount / totalSalesCount : 0;

        document.getElementById('total-sales-count').textContent = totalSalesCount;
        document.getElementById('total-sales-amount').textContent = `$${totalSalesAmount.toFixed(2)}`;
        document.getElementById('avg-sale').textContent = `$${avgSale.toFixed(2)}`;

        // Render sales history
        const container = document.getElementById('sales-list');
        
        if (this.sales.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No hay ventas registradas</p>
                </div>
            `;
            return;
        }

        const sortedSales = [...this.sales].reverse();
        
        container.innerHTML = sortedSales.map(sale => {
            const date = new Date(sale.date);
            const itemCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
            
            return `
                <div class="sale-record">
                    <div class="sale-record-header">
                        <div class="sale-record-time">
                            ${date.toLocaleDateString()} ${date.toLocaleTimeString()}
                        </div>
                        <div class="sale-record-total">$${sale.total.toFixed(2)}</div>
                    </div>
                    <div class="sale-record-items">
                        ${itemCount} producto(s): ${sale.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </div>
                </div>
            `;
        }).join('');
    }

    clearSalesHistory() {
        if (!confirm('¿Eliminar todo el historial de ventas? Esta acción no se puede deshacer.')) return;

        this.sales = [];
        this.saveData();
        this.updateReportsView();
        this.showToast('Historial limpiado', 'success');
    }

    // ==================== SEARCH ====================
    
    setupManualSearch() {
        const searchInput = document.getElementById('manual-search');
        const resultsContainer = document.getElementById('search-results');

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                resultsContainer.classList.remove('show');
                return;
            }

            const results = this.inventory.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.code.toLowerCase().includes(query)
            ).slice(0, 5);

            if (results.length === 0) {
                resultsContainer.innerHTML = '<div class="search-result-item">No se encontraron productos</div>';
                resultsContainer.classList.add('show');
                return;
            }

            resultsContainer.innerHTML = results.map(product => `
                <div class="search-result-item" onclick="app.addToSale(app.inventory.find(p => p.id === '${product.id}')); document.getElementById('manual-search').value = ''; document.getElementById('search-results').classList.remove('show');">
                    <div class="search-result-name">${product.name}</div>
                    <div class="search-result-details">
                        ${product.code} - $${product.price.toFixed(2)} - Stock: ${product.stock}
                    </div>
                </div>
            `).join('');

            resultsContainer.classList.add('show');
        });

        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.classList.remove('show');
            }
        });
    }

    // ==================== MODAL ====================
    
    openProductModal(productId = null, prefilledCode = '') {
        const modal = document.getElementById('modal-product');
        const form = document.getElementById('product-form');
        const title = document.getElementById('modal-title');

        form.reset();

        if (productId) {
            const product = this.inventory.find(p => p.id === productId);
            if (product) {
                title.textContent = 'Editar Producto';
                document.getElementById('product-id').value = product.id;
                document.getElementById('product-code').value = product.code;
                document.getElementById('product-name').value = product.name;
                document.getElementById('product-price').value = product.price;
                document.getElementById('product-stock').value = product.stock;
                document.getElementById('product-category').value = product.category;
            }
        } else {
            title.textContent = 'Agregar Producto';
            if (prefilledCode) {
                document.getElementById('product-code').value = prefilledCode;
            }
        }

        modal.classList.add('show');
    }

    closeProductModal() {
        document.getElementById('modal-product').classList.remove('show');
    }

    // ==================== CONFIG ====================
    
    updateConfig() {
        const minStockValue = parseInt(document.getElementById('min-stock-alert').value);
        this.config.minStockAlert = minStockValue;
        this.saveData();
        this.checkLowStock();
        this.updateInventoryView();
    }

    loadSampleData() {
        if (this.inventory.length > 0) {
            if (!confirm('Esto agregará productos de ejemplo. ¿Continuar?')) return;
        }

        const sampleProducts = [
            { code: '7501234567890', name: 'Coca-Cola 600ml', price: 1.50, stock: 24, category: 'Bebidas' },
            { code: '7501234567891', name: 'Pan Blanco', price: 0.80, stock: 15, category: 'Panadería' },
            { code: '7501234567892', name: 'Leche Entera 1L', price: 1.20, stock: 12, category: 'Lácteos' },
            { code: '7501234567893', name: 'Huevos x12', price: 2.50, stock: 8, category: 'Lácteos' },
            { code: '7501234567894', name: 'Arroz 1kg', price: 1.80, stock: 20, category: 'Abarrotes' },
            { code: '7501234567895', name: 'Papel Higiénico x4', price: 3.00, stock: 10, category: 'Limpieza' },
            { code: '7501234567896', name: 'Jabón Líquido', price: 2.20, stock: 6, category: 'Limpieza' },
            { code: '7501234567897', name: 'Galletas Chocolate', price: 1.50, stock: 3, category: 'Snacks' },
            { code: '7501234567898', name: 'Agua 1.5L', price: 0.60, stock: 30, category: 'Bebidas' },
            { code: '7501234567899', name: 'Café Instantáneo', price: 4.50, stock: 5, category: 'Abarrotes' }
        ];

        sampleProducts.forEach(p => this.addProduct(p));
        this.showToast('Productos de ejemplo cargados', 'success');
        this.updateInventoryView();
    }

    exportData() {
        const data = {
            inventory: this.inventory,
            sales: this.sales,
            config: this.config,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `minipos-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Datos exportados', 'success');
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.inventory) this.inventory = data.inventory;
                if (data.sales) this.sales = data.sales;
                if (data.config) this.config = data.config;

                this.saveData();
                this.updateUI();
                this.showToast('Datos importados correctamente', 'success');
            } catch (error) {
                this.showToast('Error al importar datos', 'error');
            }
        };
        reader.readAsText(file);
    }

    resetAll() {
        if (!confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los datos (inventario, ventas, configuración). ¿Estás seguro?')) return;
        if (!confirm('Esta acción no se puede deshacer. ¿Realmente deseas continuar?')) return;

        localStorage.removeItem('minipos_inventory');
        localStorage.removeItem('minipos_sales');
        localStorage.removeItem('minipos_config');

        this.inventory = [];
        this.sales = [];
        this.config = { minStockAlert: 5 };
        this.currentSale = [];

        this.updateUI();
        this.showToast('Todos los datos han sido eliminados', 'success');
    }

    // ==================== UI HELPERS ====================
    
    updateTime() {
        const now = new Date();
        document.getElementById('currentTime').textContent = now.toLocaleString('es-ES', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    updateUI() {
        this.renderSaleItems();
        this.updateSaleTotal();
        this.updateInventoryView();
        this.updateReportsView();
        this.checkLowStock();
        
        // Update config inputs
        document.getElementById('min-stock-alert').value = this.config.minStockAlert;
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ==================== EVENT LISTENERS ====================
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.dataset.view;
                
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(`view-${view}`).classList.add('active');

                // Update views when switching
                if (view === 'inventario') this.updateInventoryView();
                if (view === 'reportes') this.updateReportsView();
            });
        });

        // Scanner
        document.getElementById('btn-start-scan').addEventListener('click', () => this.startScanner());

        // Sale
        document.getElementById('btn-clear-sale').addEventListener('click', () => this.clearSale());
        document.getElementById('btn-complete-sale').addEventListener('click', () => this.completeSale());
        this.setupManualSearch();

        // Inventory
        document.getElementById('btn-add-product').addEventListener('click', () => this.openProductModal());
        document.getElementById('filter-inventory').addEventListener('input', () => this.updateInventoryView());

        // Product Modal
        document.getElementById('btn-close-modal').addEventListener('click', () => this.closeProductModal());
        document.getElementById('btn-cancel-product').addEventListener('click', () => this.closeProductModal());
        
        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const productData = {
                id: document.getElementById('product-id').value || null,
                code: document.getElementById('product-code').value,
                name: document.getElementById('product-name').value,
                price: document.getElementById('product-price').value,
                stock: document.getElementById('product-stock').value,
                category: document.getElementById('product-category').value
            };

            this.addProduct(productData);
            this.closeProductModal();
        });

        // Close modal on outside click
        document.getElementById('modal-product').addEventListener('click', (e) => {
            if (e.target.id === 'modal-product') {
                this.closeProductModal();
            }
        });

        // Reports
        document.getElementById('btn-clear-history').addEventListener('click', () => this.clearSalesHistory());

        // Config
        document.getElementById('min-stock-alert').addEventListener('change', () => this.updateConfig());
        document.getElementById('btn-export-data').addEventListener('click', () => this.exportData());
        document.getElementById('btn-import-data').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        document.getElementById('import-file').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.importData(e.target.files[0]);
            }
        });
        document.getElementById('btn-load-sample').addEventListener('click', () => this.loadSampleData());
        document.getElementById('btn-reset-all').addEventListener('click', () => this.resetAll());
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MiniPOS();
});
