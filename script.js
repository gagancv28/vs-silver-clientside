/* ==========================================================================
   V.S German Silver Gift House - JavaScript Database Engine (Supabase Integrated)
   ========================================================================== */

// 1. Supabase Connection Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 2. DOM Elements
    // ==========================================
    const mainHeader = document.getElementById('mainHeader');
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Cart Elements
    const cartTrigger = document.getElementById('cartTrigger');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCart = document.getElementById('closeCart');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartBadge = document.getElementById('cartBadge');
    const emptyCartState = document.getElementById('emptyCartState');
    const cartDrawerFooter = document.getElementById('cartDrawerFooter');
    const cartPromoCallout = document.getElementById('cartPromoCallout');
    const promoText = document.getElementById('promoText');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Search, Filter & Sort elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const productGrid = document.getElementById('productGrid');
    let productCards = [];
    const productSearchInput = document.getElementById('productSearch');
    const clearSearchBtn = document.getElementById('clearSearch');
    const productSortSelect = document.getElementById('productSort');
    const noProductsFound = document.getElementById('noProductsFound');
    
    // Checkout Modal Elements
    const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
    const closeCheckoutModal = document.getElementById('closeCheckoutModal');
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutNameInput = document.getElementById('checkoutName');
    const checkoutEmailInput = document.getElementById('checkoutEmail');
    const promoCodeInput = document.getElementById('promoCode');
    const applyPromoBtn = document.getElementById('applyPromoBtn');
    const promoFeedback = document.getElementById('promoFeedback');
    
    // Checkout Summary Elements
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryDiscountRow = document.getElementById('summaryDiscountRow');
    const summaryDiscount = document.getElementById('summaryDiscount');
    const summaryTotal = document.getElementById('summaryTotal');
    
    // Order Confirmation Modal Elements
    const confirmModalOverlay = document.getElementById('confirmModalOverlay');
    const confirmOrderId = document.getElementById('confirmOrderId');
    const confirmOrderAmount = document.getElementById('confirmOrderAmount');
    const closeConfirmModal = document.getElementById('closeConfirmModal');
    
    // Testimonials Elements
    const testimonialTrack = document.getElementById('testimonialTrack');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const sliderDots = document.querySelectorAll('.dot');
    
    // FAQ Elements
    const faqItems = document.querySelectorAll('.faq-item');
    
    // Floating WhatsApp Widget Elements
    const whatsappChatWidget = document.getElementById('whatsappChatWidget');
    const whatsappFloatBtn = document.getElementById('whatsappFloatBtn');
    const chatBubble = document.getElementById('chatBubble');
    const closeChatWidget = document.getElementById('closeChatWidget');

    // Special Offer Card
    const specialOfferCard = document.getElementById('specialOfferCard');
    
    // Notification Toast
    const notificationToast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');

    // State Variables
    let products = [];
    let cart = [];
    let activePromo = null; // Stores currently applied discount object
    let originalProductOrder = [];
    
    // Fallback static products in case database is empty or connection fails
    const localFallbackProducts = [
        {
            id: "silver-kalash-fallback",
            title: "Premium German Silver Kalash with Gift Box",
            description: "Traditional German Silver Kalash set with an elegant velvet box. Perfect for pooja and gifting.",
            regular_price: 2500,
            sale_price: 1850,
            stock_status: true,
            image_url: "product1.jpg",
            category: "pooja",
            featured: true
        },
        {
            id: "silver-diya-fallback",
            title: "Elegant German Silver Diya with Gift Box",
            description: "Beautiful pair of German Silver diyas with high-quality polish and matching velvet gift box.",
            regular_price: 1750,
            sale_price: 1250,
            stock_status: true,
            image_url: "product2.jpg",
            category: "pooja",
            featured: true
        }
    ];

    // ==========================================
    // 3. Dynamic Products Fetching & Grid Builder
    // ==========================================
    async function fetchProducts() {
        try {
            // Fetch from Supabase products table
            const { data, error } = await supabase
                .from('products')
                .select('*');
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Map database objects to guarantee correct fields
                products = data.map(p => ({
                    id: p.id,
                    title: p.title || "German Silver Item",
                    description: p.description || "",
                    regular_price: parseFloat(p.regular_price) || 0,
                    sale_price: p.sale_price ? parseFloat(p.sale_price) : null,
                    stock_status: p.stock_status !== undefined ? p.stock_status : true,
                    image_url: p.image_url || "product1.jpg",
                    category: p.category || "pooja",
                    featured: p.featured || false
                }));
                console.log("Successfully fetched products from Supabase:", products);
            } else {
                console.warn("Supabase products table is empty. Loading fallback items.");
                products = localFallbackProducts;
            }
        } catch (err) {
            console.error("Supabase connection error. Using local fallbacks:", err);
            products = localFallbackProducts;
        }
        renderProductsGrid();
    }

    // ==========================================
    // 3.5 Dynamic Store Settings Fetcher (Offers)
    // ==========================================
    async function fetchStoreSettings() {
        const offerSection = document.getElementById('special-offer');
        const offerTitleEl = document.getElementById('offerSectionTitle');
        const offerDescEl = document.getElementById('offerSectionDesc');
        
        try {
            const { data, error } = await supabase
                .from('store_settings')
                .select('offer_title, offer_description')
                .limit(1);
            
            if (error) throw error;
            
            if (data && data.length > 0 && data[0].offer_title && data[0].offer_description) {
                if (offerTitleEl) offerTitleEl.textContent = data[0].offer_title;
                if (offerDescEl) offerDescEl.textContent = data[0].offer_description;
                if (offerSection) offerSection.style.display = 'block';
                console.log("Successfully fetched dynamic offer text from Supabase:", data[0]);
            } else {
                console.log("Store settings is empty or offer deleted. Hiding special offer section.");
                if (offerSection) offerSection.style.display = 'none';
            }
        } catch (err) {
            console.error("Error fetching store settings from Supabase:", err);
            if (offerSection) offerSection.style.display = 'none';
        }
    }

    function renderProductsGrid() {
        if (!productGrid) return;
        productGrid.innerHTML = '';
        
        products.forEach(p => {
            const card = document.createElement('div');
            card.className = `product-card ${p.stock_status ? '' : 'out-of-stock'}`;
            card.setAttribute('data-category', p.category);
            
            // Set dynamic price attribute for sorting (prefers sale_price)
            const activePrice = p.sale_price !== null ? p.sale_price : p.regular_price;
            card.setAttribute('data-price', activePrice);
            card.setAttribute('data-rating', p.rating || "4.8");
            card.setAttribute('data-featured', p.featured ? 'true' : 'false');
            
            // Build rating stars (5-star default or random for mock aesthetics)
            let starsHtml = '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>';
            starsHtml += (p.rating && p.rating % 1 === 0) ? '<i class="fas fa-star"></i>' : '<i class="fas fa-star-half-alt"></i>';
            const ratingText = p.rating || "4.8";

            // Out of stock overlay badge
            const stockBadgeHtml = p.stock_status ? '' : '<span class="out-of-stock-badge">Out of Stock</span>';
            const buttonState = p.stock_status ? '' : 'disabled';
            const buttonText = p.stock_status ? '<i class="fa-solid fa-cart-plus"></i> Add to Cart' : 'Out of Stock';

            // Check if price is 0 (Price on Request)
            const isPriceOnRequest = (activePrice === 0 || activePrice === "0" || activePrice === 0.0);
            
            // Build price html
            let priceHtml = '';
            if (isPriceOnRequest) {
                priceHtml = `<span class="card-price">Price on Request</span>`;
            } else {
                priceHtml = `<span class="card-price">₹${activePrice.toLocaleString('en-IN')}</span>`;
                if (p.sale_price !== null) {
                    priceHtml += `<span class="card-old-price">₹${p.regular_price.toLocaleString('en-IN')}</span>`;
                }
            }

            // Build CTA button html
            let buttonHtml = '';
            if (isPriceOnRequest) {
                const waUrl = `https://wa.me/918105556894?text=${encodeURIComponent(`Hi, I would like to know the price of ${p.title}`)}`;
                buttonHtml = `
                    <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-block" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #25d366; border-color: #25d366; color: #ffffff;">
                        <i class="fa-brands fa-whatsapp"></i> Inquire on WhatsApp
                    </a>
                `;
            } else {
                buttonHtml = `
                    <button class="btn btn-primary add-to-cart-btn" data-id="${p.id}" data-title="${p.title}" data-price="${activePrice}" data-img="${p.image_url}" ${buttonState}>
                        ${buttonText}
                    </button>
                `;
            }

            card.innerHTML = `
                <div class="card-img-wrapper">
                    ${stockBadgeHtml}
                    <img src="${p.image_url}" alt="${p.title}" class="card-img" onerror="this.src='product1.jpg'">
                    <span class="card-category-label">${p.category === 'pooja' ? 'Pooja Essentials' : p.category === 'plates' ? 'Plates & Trays' : 'Home Decor'}</span>
                </div>
                <div class="card-info">
                    <h3 class="card-title">${p.title}</h3>
                    <p class="card-desc" style="display:none;">${p.description}</p>
                    <div class="card-rating">
                        ${starsHtml}
                        <span>(${ratingText})</span>
                    </div>
                    <div class="card-price-row">
                        ${priceHtml}
                    </div>
                    ${buttonHtml}
                </div>
            `;
            productGrid.appendChild(card);
        });

        // Re-query productCards array for filtering & sorting logic
        productCards = Array.from(document.querySelectorAll('.product-card'));
        originalProductOrder = [...productCards];
        
        // Apply active filters or search if already inputted
        applyFiltering();
    }

    // ==========================================
    // 4. Sticky Header & Active Nav on Scroll
    // ==========================================
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
        highlightActiveNavLink();
    });

    function highlightActiveNavLink() {
        const scrollPosition = window.scrollY + 100;
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ==========================================
    // 5. Mobile Navigation Menu
    // ==========================================
    mobileNavToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileNavToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileNavToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
        });
    });

    // ==========================================
    // 6. Shopping Cart State Management
    // ==========================================
    function loadCart() {
        const storedCart = localStorage.getItem('vsg_cart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
        renderCart();
    }

    function saveCart() {
        localStorage.setItem('vsg_cart', JSON.stringify(cart));
        renderCart();
    }

    function addToCart(id, title, price, img) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({
                id,
                title,
                price: parseFloat(price),
                img,
                qty: 1
            });
        }
        
        saveCart();
        showToast(`"${title}" added to cart!`);
        animateCartBadge();
        openCartDrawer();
    }

    function changeQty(id, delta) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) {
                cart = cart.filter(cartItem => cartItem.id !== id);
            }
            saveCart();
        }
    }

    function removeItem(id) {
        cart = cart.filter(cartItem => cartItem.id !== id);
        saveCart();
        showToast("Item removed from cart.");
    }

    function renderCart() {
        const totalItems = cart.reduce((total, item) => total + item.qty, 0);
        cartBadge.textContent = totalItems;
        
        if (cart.length === 0) {
            cartItemsList.style.display = 'none';
            emptyCartState.style.display = 'flex';
            cartDrawerFooter.style.display = 'none';
        } else {
            cartItemsList.style.display = 'flex';
            emptyCartState.style.display = 'none';
            cartDrawerFooter.style.display = 'block';
            
            cartItemsList.innerHTML = '';
            let subtotal = 0;
            
            cart.forEach(item => {
                const itemTotal = item.price * item.qty;
                subtotal += itemTotal;
                
                const li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML = `
                    <img src="${item.img}" alt="${item.title}" class="cart-item-img" onerror="this.src='product1.jpg'">
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.title}</h4>
                        <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
                        <div class="cart-item-controls">
                            <button class="qty-btn qty-minus" data-id="${item.id}"><i class="fas fa-minus"></i></button>
                            <span class="qty-number">${item.qty}</span>
                            <button class="qty-btn qty-plus" data-id="${item.id}"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}" aria-label="Remove item">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                cartItemsList.appendChild(li);
            });
            
            cartSubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
            
            // Special Dhamaka threshold checking
            if (subtotal >= 3000) {
                cartPromoCallout.classList.add('eligible');
                cartPromoCallout.innerHTML = `<i class="fa-solid fa-gift animated-bounce"></i> <span><strong>FREE GIFT ACTIVE!</strong> You qualified for a Free Vastu Kamadhenu Set! 🕉️✨</span>`;
            } else {
                cartPromoCallout.classList.remove('eligible');
                const remaining = 3000 - subtotal;
                cartPromoCallout.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Add <strong>₹${remaining.toLocaleString('en-IN')}</strong> more to get a FREE Vastu Kamadhenu Set!</span>`;
            }
        }
    }

    function animateCartBadge() {
        cartTrigger.classList.add('btn-glow');
        cartBadge.style.transform = 'scale(1.4)';
        setTimeout(() => {
            cartTrigger.classList.remove('btn-glow');
            cartBadge.style.transform = 'scale(1)';
        }, 300);
    }

    // ==========================================
    // 7. Cart Drawer Slide-out Mechanics
    // ==========================================
    function openCartDrawer() {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCartDrawer() {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    cartTrigger.addEventListener('click', openCartDrawer);
    closeCart.addEventListener('click', closeCartDrawer);
    cartOverlay.addEventListener('click', closeCartDrawer);
    
    // Bind browse products link inside empty cart
    document.querySelector('.close-cart-link').addEventListener('click', closeCartDrawer);

    // Event delegation inside cart drawer
    cartItemsList.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        
        const id = button.dataset.id;
        
        if (button.classList.contains('qty-minus')) {
            changeQty(id, -1);
        } else if (button.classList.contains('qty-plus')) {
            changeQty(id, 1);
        } else if (button.classList.contains('remove-item-btn')) {
            removeItem(id);
        }
    });

    // ==========================================
    // 8. Add to Cart delegation
    // ==========================================
    document.body.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-to-cart-btn');
        if (addBtn) {
            // Prevent multiple rapid clicks during the feedback window
            if (addBtn.classList.contains('adding')) return;

            const id = addBtn.dataset.id;
            const title = addBtn.dataset.title || addBtn.dataset.name; // Fallback to support both database and static card attribute mappings
            const price = addBtn.dataset.price;
            const img = addBtn.dataset.img;
            addToCart(id, title, price, img);

            // Visual success feedback: change text and style temporarily
            addBtn.classList.add('adding');
            const originalHtml = addBtn.innerHTML;
            addBtn.innerHTML = '<i class="fa-solid fa-check"></i> Added to Cart';
            addBtn.style.background = '#2e7d32';
            addBtn.style.borderColor = '#2e7d32';
            addBtn.style.color = '#ffffff';

            setTimeout(() => {
                addBtn.innerHTML = originalHtml;
                addBtn.style.background = '';
                addBtn.style.borderColor = '';
                addBtn.style.color = '';
                addBtn.classList.remove('adding');
            }, 2000);
        }
    });

    // ==========================================
    // 9. Catalog Filtering, Search & Sorting
    // ==========================================
    let activeFilter = 'all';

    function applyFiltering() {
        const searchQuery = productSearchInput.value.toLowerCase().trim();
        clearSearchBtn.style.display = searchQuery.length > 0 ? 'block' : 'none';

        let visibleCount = 0;

        productCards.forEach(card => {
            const category = card.dataset.category;
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            
            const matchesCategory = activeFilter === 'all' || category === activeFilter;
            const matchesSearch = title.includes(searchQuery);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                visibleCount++;
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    if (card.style.opacity === '0') {
                        card.style.display = 'none';
                    }
                }, 300);
            }
        });

        setTimeout(() => {
            if (visibleCount === 0) {
                noProductsFound.style.display = 'flex';
                productGrid.style.display = 'none';
            } else {
                noProductsFound.style.display = 'none';
                productGrid.style.display = 'grid';
            }
        }, 300);
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            activeFilter = button.dataset.filter;
            applyFiltering();
        });
    });

    productSearchInput.addEventListener('input', applyFiltering);
    
    clearSearchBtn.addEventListener('click', () => {
        productSearchInput.value = '';
        applyFiltering();
    });

    // Sorting algorithm
    productSortSelect.addEventListener('change', () => {
        const method = productSortSelect.value;
        
        if (method === 'featured') {
            originalProductOrder.forEach(card => productGrid.appendChild(card));
            return;
        }

        const sorted = [...productCards].sort((a, b) => {
            const priceA = parseFloat(a.dataset.price);
            const priceB = parseFloat(b.dataset.price);
            const ratingA = parseFloat(a.dataset.rating);
            const ratingB = parseFloat(b.dataset.rating);

            if (method === 'price-low') return priceA - priceB;
            if (method === 'price-high') return priceB - priceA;
            if (method === 'rating') return ratingB - ratingA;
            return 0;
        });

        sorted.forEach(card => productGrid.appendChild(card));
    });

    // ==========================================
    // 10. Checkout Modal & Supabase Order Logic
    // ==========================================
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        closeCartDrawer();
        openCheckoutModal();
    });

    function openCheckoutModal() {
        checkoutModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Reset promo field
        promoCodeInput.value = '';
        promoFeedback.className = 'promo-feedback';
        promoFeedback.textContent = '';
        activePromo = null;
        summaryDiscountRow.style.display = 'none';

        updateCheckoutSummary();
    }

    function closeCheckoutModalWindow() {
        checkoutModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeCheckoutModal.addEventListener('click', closeCheckoutModalWindow);

    function updateCheckoutSummary() {
        let subtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
        let discount = 0;

        if (activePromo) {
            if (activePromo.type === 'percentage') {
                discount = subtotal * (parseFloat(activePromo.discount_value) / 100);
            } else if (activePromo.type === 'fixed') {
                discount = parseFloat(activePromo.discount_value);
            }
        }

        const grandTotal = Math.max(0, subtotal - discount);

        summarySubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        
        if (discount > 0) {
            summaryDiscountRow.style.display = 'flex';
            summaryDiscount.textContent = `- ₹${discount.toLocaleString('en-IN')}`;
        } else {
            summaryDiscountRow.style.display = 'none';
        }
        
        summaryTotal.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
    }

    // Coupon discount verification querying the Supabase 'discounts' table
    applyPromoBtn.addEventListener('click', async () => {
        const code = promoCodeInput.value.toUpperCase().trim();
        if (!code) return;

        applyPromoBtn.disabled = true;
        applyPromoBtn.textContent = 'Verifying...';
        
        try {
            const { data, error } = await supabase
                .from('discounts')
                .select('*')
                .eq('code_name', code)
                .eq('is_active', true)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                activePromo = data;
                promoFeedback.className = 'promo-feedback success';
                
                const valText = data.type === 'percentage' ? `${data.discount_value}%` : `₹${data.discount_value}`;
                promoFeedback.textContent = `Promo code "${code}" applied successfully (${valText} discount)!`;
                
                updateCheckoutSummary();
            } else {
                activePromo = null;
                promoFeedback.className = 'promo-feedback error';
                promoFeedback.textContent = 'Invalid or expired discount coupon code.';
                updateCheckoutSummary();
            }
        } catch (err) {
            console.error("Discount lookup failed:", err);
            // Local fallback values for testing offline
            if (code === 'WELCOME10') {
                activePromo = { code_name: 'WELCOME10', type: 'percentage', discount_value: 10 };
                promoFeedback.className = 'promo-feedback success';
                promoFeedback.textContent = 'Offline Fallback code "WELCOME10" applied (10% off)!';
                updateCheckoutSummary();
            } else {
                activePromo = null;
                promoFeedback.className = 'promo-feedback error';
                promoFeedback.textContent = 'Error connecting to database. Use promo WELCOME10.';
                updateCheckoutSummary();
            }
        } finally {
            applyPromoBtn.disabled = false;
            applyPromoBtn.textContent = 'Apply';
        }
    });

    // Submit checkout order to Supabase
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent page refresh before asynchronous insertion completes
        
        const customer_name_val = checkoutNameInput.value.trim();
        const customer_email = checkoutEmailInput.value.trim();
        const customer_phone = document.getElementById('customer_phone').value.trim();
        
        // Combine name and phone to fit schema without adding tables/columns
        const customer_name = `${customer_name_val} (${customer_phone})`;
        
        let subtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
        let discount = 0;
        
        if (activePromo) {
            if (activePromo.type === 'percentage') {
                discount = subtotal * (parseFloat(activePromo.discount_value) / 100);
            } else if (activePromo.type === 'fixed') {
                discount = parseFloat(activePromo.discount_value);
            }
        }
        
        const total_amount = parseFloat(Math.max(0, subtotal - discount));
        
        // Map order items to strict schema formatting
        const order_items_array = cart.map(item => ({
            product_id: item.id,
            title: item.title,
            quantity: item.qty,
            price: item.price
        }));

        const submitBtn = document.getElementById('placeOrderBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing Secure Order...';

        try {
            // Stringify array payload for jsonb columns as required by Supabase configurations
            const order_items = JSON.stringify(order_items_array);

            // Write order record to Supabase
            const { data, error } = await supabase
                .from('orders')
                .insert([{
                    customer_name,
                    customer_email,
                    total_amount,
                    status: 'pending',
                    order_items // stringified JSON array
                }])
                .select();

            if (error) {
                console.error("Supabase insertion error returned:", error);
                alert(`Supabase Database Insertion Error:\n\nMessage: ${error.message}\nCode: ${error.code}\nDetails: ${error.details}`);
                throw error;
            }

            console.log("Order written to Supabase orders table successfully:", data);
            
            // Extract order ID returned from Supabase
            const generatedId = (data && data[0]) ? data[0].id : 'N/A';
            
            // Success Modal trigger
            closeCheckoutModalWindow();
            openConfirmationModal(generatedId, total_amount);

            // Clear Cart State
            cart = [];
            saveCart();
            checkoutForm.reset();
            activePromo = null;

        } catch (err) {
            console.error("Order submission failed with exception:", err);
            alert(`Order Insertion Failed!\n\nDetails: ${err.message || err}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Silverware Order';
        }
    });

    function openConfirmationModal(orderId, amount) {
        confirmOrderId.textContent = orderId;
        confirmOrderAmount.textContent = `₹${amount.toLocaleString('en-IN')}`;
        confirmModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeConfirmModal.addEventListener('click', () => {
        confirmModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // ==========================================
    // 11. Testimonials Slider Carousel
    // ==========================================
    let currentSlide = 0;
    
    function showSlide(index) {
        testimonialCards.forEach(card => card.classList.remove('active'));
        sliderDots.forEach(dot => dot.classList.remove('active'));
        
        testimonialCards[index].classList.add('active');
        sliderDots[index].classList.add('active');
        
        // Slide track horizontally
        const offset = -index * 100;
        testimonialTrack.style.transform = `translateX(${offset}%)`;
    }

    sliderDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            currentSlide = parseInt(e.target.dataset.index);
            showSlide(currentSlide);
        });
    });

    // Autoplay testimonials
    setInterval(() => {
        currentSlide = (currentSlide + 1) % testimonialCards.length;
        showSlide(currentSlide);
    }, 6000);

    // ==========================================
    // 12. FAQ Accordion Functions
    // ==========================================
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(faq => faq.classList.remove('active'));
            
            // If was not active, open it
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ==========================================
    // 13. Floating WhatsApp Widget & Click sparks
    // ==========================================
    whatsappFloatBtn.addEventListener('click', () => {
        whatsappChatWidget.classList.toggle('active');
    });

    closeChatWidget.addEventListener('click', () => {
        whatsappChatWidget.classList.remove('active');
    });

    // Sparkle hint gold dust click sparkles on Dhamaka Card
    if (specialOfferCard) {
        specialOfferCard.addEventListener('click', (e) => {
            const rect = specialOfferCard.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                particle.className = 'click-particle';
                particle.style.left = `${clickX}px`;
                particle.style.top = `${clickY}px`;
                
                // Random drift values
                const driftX = (Math.random() - 0.5) * 80;
                const driftY = (Math.random() - 0.5) * 80;
                particle.style.setProperty('--drift-x', `${driftX}px`);
                particle.style.setProperty('--drift-y', `${driftY}px`);
                
                specialOfferCard.appendChild(particle);
                
                // Remove particle after animation
                setTimeout(() => {
                    particle.remove();
                }, 1000);
            }
        });
    }

    // ==========================================
    // 14. Incense Stick (Agarbatti) Smoke Generator
    // ==========================================
    const canvas = document.getElementById('smokeCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const particles = [];
        
        class SmokeParticle {
            constructor() {
                this.x = canvas.width / 2;
                this.y = canvas.height - 5;
                this.vx = (Math.random() - 0.5) * 0.35;
                this.vy = -(Math.random() * 0.35 + 0.45);
                this.alpha = 0.85; // Solid starting opacity for high visibility
                this.size = Math.random() * 2.5 + 1.5;
                this.growth = Math.random() * 0.07 + 0.04;
                this.decay = Math.random() * 0.0006 + 0.0004; // Slower fade so smoke rises higher
                this.swaySpeed = Math.random() * 0.015 + 0.008;
                this.swayOffset = Math.random() * 100;
            }

            update() {
                this.x += this.vx + Math.sin(this.y * this.swaySpeed + this.swayOffset) * 0.15;
                this.y += this.vy;
                this.size += this.growth;
                this.alpha -= this.decay;
            }

            draw() {
                ctx.save();
                const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                // Center core: Soft translucent gold (matches the luxury brand accent)
                grad.addColorStop(0, `rgba(212, 175, 55, ${this.alpha * 0.22})`);
                // Middle body: Warm champagne-beige
                grad.addColorStop(0.3, `rgba(235, 220, 195, ${this.alpha * 0.14})`);
                // Outer halo: Very soft white
                grad.addColorStop(0.6, `rgba(255, 250, 240, ${this.alpha * 0.07})`);
                grad.addColorStop(1, 'rgba(255, 250, 240, 0)');
                
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        function animateSmoke() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (Math.random() < 0.16 && particles.length < 80) {
                particles.push(new SmokeParticle());
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.update();
                p.draw();

                if (p.alpha <= 0 || p.y < 0) {
                    particles.splice(i, 1);
                }
            }

            animationFrameId = requestAnimationFrame(animateSmoke);
        }

        setTimeout(() => {
            animateSmoke();
        }, 1000);
    }

    // ==========================================
    // 15. Customer Feedback Form Handler
    // ==========================================
    const feedbackForm = document.getElementById('feedbackForm');
    const starRatingSelector = document.getElementById('starRatingSelector');
    const feedbackRatingInput = document.getElementById('feedbackRating');
    
    if (starRatingSelector && feedbackRatingInput) {
        const starButtons = starRatingSelector.querySelectorAll('.star-btn');
        
        starButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = parseInt(e.currentTarget.dataset.value);
                feedbackRatingInput.value = val;
                
                starButtons.forEach(sBtn => {
                    const sVal = parseInt(sBtn.dataset.value);
                    const icon = sBtn.querySelector('i');
                    icon.className = sVal <= val ? 'fa-solid fa-star' : 'fa-regular fa-star';
                });
            });
        });
    }

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('feedbackName').value.trim();
            const phone = document.getElementById('feedbackPhone').value.trim();
            const rating = parseInt(feedbackRatingInput.value);
            const message = document.getElementById('feedbackMessage').value.trim();
            
            if (rating === 0) {
                showToast("Please select a rating star!");
                return;
            }
            
            const feedbackData = {
                name,
                phone,
                rating,
                message,
                created_at: new Date().toISOString()
            };

            try {
                // Write feedback submission to Supabase feedback table if it exists
                const { error } = await supabase
                    .from('feedback')
                    .insert([feedbackData]);
                
                if (error) throw error;
                console.log("Feedback written successfully to Supabase!");
            } catch (err) {
                console.warn("Saving feedback locally. Error connecting to Supabase feedback table:", err);
            }

            let storedFeedback = JSON.parse(localStorage.getItem('vsg_feedback') || '[]');
            storedFeedback.push(feedbackData);
            localStorage.setItem('vsg_feedback', JSON.stringify(storedFeedback));

            showToast("Thank you for your feedback! 🙏");
            
            feedbackForm.reset();
            feedbackRatingInput.value = 0;
            if (starRatingSelector) {
                starRatingSelector.querySelectorAll('.star-btn i').forEach(icon => {
                    icon.className = 'fa-regular fa-star';
                });
            }
        });
    }

    // ==========================================
    // 15.5 Toast Notification Handler
    // ==========================================
    function showToast(message) {
        if (!notificationToast || !toastMessage) return;
        toastMessage.textContent = message;
        notificationToast.classList.add('active');
        
        setTimeout(() => {
            notificationToast.classList.remove('active');
        }, 3000);
    }

    // ==========================================
    // 16. Scroll Reveal Observer Init
    // ==========================================
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.scroll-reveal, .fade-in-up').forEach(element => {
        scrollObserver.observe(element);
    });

    // ==========================================
    // 17. Initialization
    // ==========================================
    // Render fallback products immediately to guarantee instant page painting
    products = localFallbackProducts;
    renderProductsGrid();

    // Load dynamic updates asynchronously from Supabase
    fetchProducts();
    fetchStoreSettings();
    loadCart();

});
