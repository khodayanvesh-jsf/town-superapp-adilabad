import React, { useState } from 'react';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_FUNCTION_HALLS,
  DECORATION_SERVICE_MODULES,
  REJECTION_REASONS
} from './data';

export default function App() {
  // Global Portal Switcher
  const [activePortal, setActivePortal] = useState('customer'); // 'customer' | 'merchant' | 'rider' | 'admin' | 'register' | 'split'
  const [isPrimeCustomer, setIsPrimeCustomer] = useState(true);

  // Master Data State
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [functionHalls, setFunctionHalls] = useState(INITIAL_FUNCTION_HALLS);

  // Commission Sliders (Founder Admin)
  const [merchantCommissionPct, setMerchantCommissionPct] = useState(0);
  const [consumerFeePct, setConsumerFeePct] = useState(0);

  // Selected Category & Carts (Rule 22: Isolated Category Carts)
  const [selectedCategory, setSelectedCategory] = useState('daily_needs');
  const [activeCustomerSection, setActiveCustomerSection] = useState('shop'); // 'shop' | 'events' | 'taxi'
  const [selectedVariantMap, setSelectedVariantMap] = useState({});
  const [categoryCarts, setCategoryCarts] = useState({
    daily_needs: [],
    construction: [],
    medicines: []
  });
  const [showCartWindow, setShowCartWindow] = useState(false);

  // Google Maps Pinpoint Modal (Rules 2, 3, 11)
  const [mapModal, setMapModal] = useState({
    open: false,
    mode: 'consumer_pin', // 'consumer_pin' | 'taxi_pickup' | 'taxi_drop'
    lat: 19.6641,
    lng: 78.5320,
    addressLabel: 'Collectorate Chowk, Adilabad (19.6641° N, 78.5320° E)',
    distanceKm: 2.2
  });
  const [mapType, setMapType] = useState('street');
  const [taxiRoute, setTaxiRoute] = useState({
    pickup: 'Adilabad Bus Stand (19.6668° N, 78.5310° E)',
    drop: 'RIMS Hospital Gate (19.6580° N, 78.5250° E)',
    distanceKm: 3.4,
    mode: '2w_taxi'
  });

  // Active Order Queue (Supports Concurrent Orders via '+ New Order')
  const [orders, setOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [riderOtpInput, setRiderOtpInput] = useState('');
  const [reviewText, setReviewText] = useState('');

  // Decoration & Function Hall State (Rules 4, 5, 7, 8, 9, 10 & 35%/85% Escrow)
  const [eventDate, setEventDate] = useState('2026-10-26'); // Default <5 days from Oct 23, 2026 -> tests 85% rule!
  const [eventTime, setEventTime] = useState('18:00');
  const [decorCart, setDecorCart] = useState([]);
  const [decorBids, setDecorBids] = useState([]);
  const [biddingStatus, setBiddingStatus] = useState('IDLE'); // 'IDLE' | 'BROADCASTED' | 'BID_ACCEPTED_AWAITING_MERCHANT' | 'DEAL_FINALIZED_PAYMENT_DUE' | 'ADVANCE_PAID'
  const [selectedWinningBid, setSelectedWinningBid] = useState(null);
  const [merchantBidForm, setMerchantBidForm] = useState({ price: 21500, notes: 'Includes complimentary welcome gate + extra 2 LED warm spotlights' });
  const [hallBookingState, setHallBookingState] = useState(null);

  // Merchant Sub-Category & Product Creation + Founder Approval Queue (Rules 8, 9, 10, 21)
  const [pendingMerchants, setPendingMerchants] = useState([
    { id: 'pm_1', businessName: 'Balaji Steel & Cement Traders', phone: '9848011223', categoryId: 'construction', eSigned: true, status: 'pending' }
  ]);
  const [pendingSubCategories, setPendingSubCategories] = useState([
    {
      id: 'ps_1',
      categoryId: 'daily_needs',
      subCategoryBrand: 'Amul Taaza Homogenised Milk',
      shopName: 'Adilabad Dairy Parlour',
      distanceKm: 0.9,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80',
      status: 'pending',
      variants: [
        { id: 'mv1', label: '500 ml Pack', price: 28, weightGrams: 500 },
        { id: 'mv2', label: '1 Litre Carton', price: 56, weightGrams: 1000 },
        { id: 'mv3', label: '6 x 1L Family Crate', price: 330, weightGrams: 6000 }
      ]
    }
  ]);
  const [rejectedItems, setRejectedItems] = useState([]);
  const [rejectModal, setRejectModal] = useState({ open: false, item: null, reason: REJECTION_REASONS[0], comment: '' });

  // Merchant Product Creator Form (Multi-Measurement Variants)
  const [newProdForm, setNewProdForm] = useState({
    categoryId: 'daily_needs',
    subCategoryBrand: '',
    shopName: 'Sri Laxmi Supermart',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
    variants: [
      { label: '500 g', price: 45, weightGrams: 500 },
      { label: '1 kg', price: 85, weightGrams: 1000 },
      { label: '5 kg', price: 410, weightGrams: 5000 }
    ]
  });

  // Registration Hub State (Point 12)
  const [regRole, setRegRole] = useState('merchant');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCategory, setRegCategory] = useState('daily_needs');
  const [regServiceMode, setRegServiceMode] = useState('single');
  const [regESign, setRegESign] = useState(false);

  // Active Order Helper
  const activeOrder = orders.find((o) => o.id === activeOrderId) || orders[0] || null;
  const isCustomerLockedWaitingForMerchantBill =
    activeOrder && activeOrder.status === 'ORDER_PLACED_MERCHANT_POPUP' && activeOrder.categoryId === selectedCategory;

  // Weight & Distance Vehicle Auto-Dispatcher
  const calculateLogistics = (weightGrams, distanceKm, heavyTransportFee = 0, laborFee = 0) => {
    let vehicle = '2-Wheeler Rider (Up to 45kg)';
    let baseDelivery = 25;
    if (weightGrams <= 45000) {
      vehicle = '2-Wheeler Rider (Up to 45kg)';
      baseDelivery = 25;
      if (distanceKm > 2.5) {
        baseDelivery += Math.ceil((distanceKm - 2.5) / 0.5) * 3;
      }
    } else if (weightGrams <= 300000) {
      vehicle = '3-Wheeler Auto (Up to 3 Quintals / ₹150 Cap)';
      const quintals = Math.ceil(weightGrams / 100000);
      baseDelivery = Math.min(quintals * 50, 150);
    } else {
      vehicle = 'Merchant Heavy Transport (Steel/Cement)';
      baseDelivery = 0;
    }
    return {
      vehicle,
      deliveryFee: baseDelivery + Number(heavyTransportFee || 0) + Number(laborFee || 0)
    };
  };

  // Add Item to Category Cart OR Silent Prime Merge into Active Order (Points 1 & 2)
  const handleAddToCart = (product) => {
    const chosenVariantId = selectedVariantMap[product.id] || product.variants[0].id;
    const variant = product.variants.find((v) => v.id === chosenVariantId) || product.variants[0];

    // Hidden Prime Merge: If Prime member has an active order in this category BEFORE token handover to rider
    const mergeableOrder = orders.find(
      (o) =>
        o.categoryId === product.categoryId &&
        ['ORDER_PLACED_MERCHANT_POPUP', 'MERCHANT_CONFIRMED_WAIT_PAYMENT', 'PAYMENT_DONE_PACKING_STARTED', 'READY_FOR_PICKUP_AGENT_ALERTED'].includes(o.status) &&
        !o.tokenHandedOver
    );

    if (isPrimeCustomer && mergeableOrder) {
      const updatedItems = [...mergeableOrder.items];
      const existingIdx = updatedItems.findIndex((i) => i.productId === product.id && i.variantId === variant.id);
      if (existingIdx > -1) {
        updatedItems[existingIdx].qty += 1;
      } else {
        updatedItems.push({
          productId: product.id,
          name: `${product.subCategoryBrand} (${variant.label})`,
          price: variant.price,
          weightGrams: variant.weightGrams,
          qty: 1,
          variantId: variant.id
        });
      }
      const newWeight = updatedItems.reduce((s, i) => s + i.weightGrams * i.qty, 0);
      const newItemsTotal = updatedItems.reduce((s, i) => s + i.price * i.qty, 0);
      const newDistance = Number((mergeableOrder.distanceKm + 0.3).toFixed(1));
      const { vehicle, deliveryFee } = calculateLogistics(newWeight, newDistance, mergeableOrder.heavyTransportFee, mergeableOrder.laborFee);
      const gst = Number(((newItemsTotal + deliveryFee) * 0.05).toFixed(2));

      setOrders(
        orders.map((o) =>
          o.id === mergeableOrder.id
            ? {
                ...o,
                items: updatedItems,
                totalWeightGrams: newWeight,
                distanceKm: newDistance,
                vehicle,
                itemsTotal: newItemsTotal,
                deliveryFee,
                gst,
                grandTotal: Number((newItemsTotal + deliveryFee + gst).toFixed(2)),
                status: 'ORDER_PLACED_MERCHANT_POPUP' // Resets merchant confirmation so merchant re-confirms updated order
              }
            : o
        )
      );
      return;
    }

    // Standard Isolated Category Cart Addition
    const currentCart = categoryCarts[product.categoryId] || [];
    const existing = currentCart.find((item) => item.productId === product.id && item.variantId === variant.id);
    let updated;
    if (existing) {
      updated = currentCart.map((item) =>
        item.productId === product.id && item.variantId === variant.id ? { ...item, qty: item.qty + 1 } : item
      );
    } else {
      updated = [
        ...currentCart,
        {
          productId: product.id,
          variantId: variant.id,
          name: `${product.subCategoryBrand} (${variant.label})`,
          shopName: product.shopName,
          price: variant.price,
          weightGrams: variant.weightGrams,
          image: product.image,
          qty: 1
        }
      ];
    }
    setCategoryCarts({ ...categoryCarts, [product.categoryId]: updated });
  };

  // Cart Quantity Modification & Removal (Point 1)
  const handleUpdateCartQty = (catId, productId, variantId, delta) => {
    const currentCart = categoryCarts[catId] || [];
    const updated = currentCart
      .map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, qty: item.qty + delta };
        }
        return item;
      })
      .filter((item) => item.qty > 0);
    setCategoryCarts({ ...categoryCarts, [catId]: updated });
  };

  // Place Order from Category Cart
  const handlePlaceCategoryOrder = (catId) => {
    const currentCart = categoryCarts[catId] || [];
    if (currentCart.length === 0) return;

    const totalWeightGrams = currentCart.reduce((s, i) => s + i.weightGrams * i.qty, 0);
    const itemsTotal = currentCart.reduce((s, i) => s + i.price * i.qty, 0);
    const { vehicle, deliveryFee } = calculateLogistics(totalWeightGrams, mapModal.distanceKm, 0, 0);
    const gst = Number(((itemsTotal + deliveryFee) * 0.05).toFixed(2));
    const secretOtp = String(Math.floor(1000 + Math.random() * 9000));

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: catId,
      categoryName: categories.find((c) => c.id === catId)?.name || 'Store Order',
      customerName: isPrimeCustomer ? 'Anvesh (👑 Prime)' : 'Customer #101',
      address: mapModal.addressLabel,
      distanceKm: mapModal.distanceKm,
      items: currentCart,
      totalWeightGrams,
      vehicle,
      itemsTotal,
      heavyTransportFee: 0, // Point 6: Default 0
      laborFee: 0, // Point 6: Default 0
      deliveryFee,
      gst,
      grandTotal: Number((itemsTotal + deliveryFee + gst).toFixed(2)),
      status: 'ORDER_PLACED_MERCHANT_POPUP',
      tokenHandedOver: false,
      secretOtp
    };

    setOrders([newOrder, ...orders]);
    setActiveOrderId(newOrder.id);
    setCategoryCarts({ ...categoryCarts, [catId]: [] });
    setShowCartWindow(false);
  };

  // Point 5: '+ New Order' Button in Merchant Portal for Concurrent Workflow
  const handleCreateConcurrentNewOrder = () => {
    const sampleItem = products[0];
    const v = sampleItem.variants[1];
    const secretOtp = String(Math.floor(1000 + Math.random() * 9000));
    const newOrd = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: 'daily_needs',
      categoryName: 'Daily Home Needs',
      customerName: `Walk-in App Consumer #${orders.length + 2}`,
      address: 'Vidya Nagar Colony, Adilabad (1.8 km)',
      distanceKm: 1.8,
      items: [{ productId: sampleItem.id, variantId: v.id, name: `${sampleItem.subCategoryBrand} (${v.label})`, price: v.price, weightGrams: v.weightGrams, qty: 1 }],
      totalWeightGrams: v.weightGrams,
      vehicle: '2-Wheeler Rider (Up to 45kg)',
      itemsTotal: v.price,
      heavyTransportFee: 0,
      laborFee: 0,
      deliveryFee: 25,
      gst: Number(((v.price + 25) * 0.05).toFixed(2)),
      grandTotal: Number(((v.price + 25) * 1.05).toFixed(2)),
      status: 'ORDER_PLACED_MERCHANT_POPUP',
      tokenHandedOver: false,
      secretOtp
    };
    setOrders([newOrd, ...orders]);
    setActiveOrderId(newOrd.id);
  };

  // Point 3: Cancel Order Before Packing Handed Over to Delivery Person (₹10 Fee)
  const handleCancelOrderBeforeHandover = (orderId) => {
    setOrders(orders.filter((o) => o.id !== orderId));
    if (activeOrderId === orderId) setActiveOrderId(null);
    alert('Order cancelled prior to rider token handover. Minimal cancellation charge of ₹10 applied.');
  };

  // Merchant Confirms Order & Pushes Final Bill
  const handleMerchantConfirmBill = (orderId, heavyFee, laborCost) => {
    setOrders(
      orders.map((o) => {
        if (o.id !== orderId) return o;
        const { vehicle, deliveryFee } = calculateLogistics(o.totalWeightGrams, o.distanceKm, heavyFee, laborCost);
        const gst = Number(((o.itemsTotal + deliveryFee) * 0.05).toFixed(2));
        return {
          ...o,
          heavyTransportFee: Number(heavyFee || 0),
          laborFee: Number(laborCost || 0),
          vehicle,
          deliveryFee,
          gst,
          grandTotal: Number((o.itemsTotal + deliveryFee + gst).toFixed(2)),
          status: 'MERCHANT_CONFIRMED_WAIT_PAYMENT'
        };
      })
    );
  };

  // Customer Pays Final Bill -> Unlocks Merchant for Concurrent Orders & Starts Packing Timer
  const handleCustomerPayOrder = (orderId) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: 'PAYMENT_DONE_PACKING_STARTED' } : o)));
  };

  // Merchant Clicks Ready to Dispatch -> Alerts Rider (5-10m Pickup Timer)
  const handleMerchantDispatchAlert = (orderId) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: 'READY_FOR_PICKUP_AGENT_ALERTED' } : o)));
  };

  // Rider Accepts Pickup Token at Merchant -> Locks Reorders & Cancellation (Rules 12, 13, 19)
  const handleRiderAcceptPickupToken = (orderId) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: 'OUT_FOR_DELIVERY_LIVE_MAP', tokenHandedOver: true } : o))
    );
  };

  // Rider Verifies Masked Consumer OTP at Doorstep (Rule 17 & Point 7)
  const handleVerifyDeliveryOtp = (orderId) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;
    if (riderOtpInput.trim() === target.secretOtp) {
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: 'DELIVERED_REVIEW_POPUP' } : o)));
      setRiderOtpInput('');
    } else {
      alert('Incorrect OTP! Please ask the consumer for the 4-digit code displayed on their screen.');
    }
  };

  // Consumer Submits Review -> Resets to Home Screen (Rules 18, 20)
  const handleCompleteReviewAndReset = (orderId) => {
    setOrders(orders.filter((o) => o.id !== orderId));
    setActiveOrderId(null);
    setReviewText('');
    setShowCartWindow(false);
    setActiveCustomerSection('shop');
  };

  // Event Days Difference Helper (35% Advance if >= 5 days, 85% Advance if < 5 days)
  const getDaysUntilEvent = () => {
    const today = new Date('2026-10-23T00:00:00');
    const selected = new Date(`${eventDate}T00:00:00`);
    const diff = Math.ceil((selected - today) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 1);
  };
  const daysAway = getDaysUntilEvent();
  const advancePercentage = daysAway >= 5 ? 35 : 85;

  // Render Customer Portal
  const renderCustomerPortal = () => {
    const currentCart = categoryCarts[selectedCategory] || [];
    const approvedProducts = products
      .filter((p) => p.categoryId === selectedCategory && p.status === 'approved')
      .sort((a, b) => a.distanceKm - b.distanceKm); // Proximity-optimized nearest best price

    return (
      <div className="bg-gray-900 text-white rounded-2xl border border-gray-800 p-4 max-w-md mx-auto shadow-2xl relative">
        {/* Top Bar */}
        <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-amber-400">Adilabad Super-App</h2>
              <button
                onClick={() => setIsPrimeCustomer(!isPrimeCustomer)}
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isPrimeCustomer ? 'bg-amber-400 text-black' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {isPrimeCustomer ? '👑 Prime Active' : 'Standard'}
              </button>
            </div>
            <button
              onClick={() => setMapModal({ ...mapModal, open: true, mode: 'consumer_pin' })}
              className="text-[11px] text-emerald-400 underline flex items-center gap-1 mt-0.5"
            >
              📍 {mapModal.addressLabel.slice(0, 34)}... (Pin on Map)
            </button>
          </div>

          <button
            onClick={() => setShowCartWindow(true)}
            className="bg-amber-500 text-black px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow"
          >
            🛒 Cart & Track ({currentCart.reduce((s, i) => s + i.qty, 0)})
          </button>
        </div>

        {/* Live Order Status Banner & Popups (Rules 14, 16, 17, 18) */}
        {activeOrder && (
          <div className="bg-gray-950 border border-amber-500/60 rounded-xl p-3 mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-amber-400">
                ⚡ {activeOrder.id} ({activeOrder.categoryName})
              </span>
              {!activeOrder.tokenHandedOver && activeOrder.status !== 'DELIVERED_REVIEW_POPUP' && (
                <button
                  onClick={() => handleCancelOrderBeforeHandover(activeOrder.id)}
                  className="text-[10px] bg-red-900/80 text-red-200 px-2 py-0.5 rounded font-bold"
                >
                  ✕ Cancel (₹10 Fee)
                </button>
              )}
            </div>
            <p className="text-xs text-gray-300 mb-2">
              Status: <strong className="text-emerald-400">{activeOrder.status.replace(/_/g, ' ')}</strong>
            </p>

            {activeOrder.status === 'MERCHANT_CONFIRMED_WAIT_PAYMENT' && (
              <div className="bg-emerald-950/70 border border-emerald-500 p-2.5 rounded-lg">
                <p className="text-xs font-bold text-emerald-300 mb-1">
                  🔔 Merchant Confirmed Bill: ₹{activeOrder.grandTotal}
                </p>
                <button
                  onClick={() => handleCustomerPayOrder(activeOrder.id)}
                  className="w-full bg-emerald-500 text-black font-black py-1.5 rounded-lg text-xs"
                >
                  Pay ₹{activeOrder.grandTotal} via Zero-MDR UPI Intent
                </button>
              </div>
            )}

            {activeOrder.status === 'OUT_FOR_DELIVERY_LIVE_MAP' && (
              <div className="bg-blue-950/60 border border-blue-500 p-2.5 rounded-lg text-xs">
                <p className="font-bold text-blue-300">🛵 Rider Live on Google Maps (ETA: 6 mins)</p>
                <p className="text-amber-300 font-mono font-bold mt-1">
                  🔐 Share Doorstep Delivery OTP with Rider: {activeOrder.secretOtp}
                </p>
              </div>
            )}

            {activeOrder.status === 'DELIVERED_REVIEW_POPUP' && (
              <div className="bg-amber-950/80 border border-amber-400 p-3 rounded-lg text-xs">
                <p className="font-bold text-amber-300 mb-1">⭐ Order Delivered! Submit Quick Feedback</p>
                <input
                  type="text"
                  placeholder="Fast delivery & fresh items..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-xs mb-2 text-white"
                />
                <button
                  onClick={() => handleCompleteReviewAndReset(activeOrder.id)}
                  className="w-full bg-amber-500 text-black font-bold py-1.5 rounded"
                >
                  Submit Feedback & Return to Home
                </button>
              </div>
            )}
          </div>
        )}

        {/* Section Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
          <button
            onClick={() => setActiveCustomerSection('shop')}
            className={`py-2 rounded-xl font-bold ${
              activeCustomerSection === 'shop' ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300'
            }`}
          >
            🛍️ Categories
          </button>
          <button
            onClick={() => setActiveCustomerSection('events')}
            className={`py-2 rounded-xl font-bold ${
              activeCustomerSection === 'events' ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300'
            }`}
          >
            🎉 Halls & Decor
          </button>
          <button
            onClick={() => setActiveCustomerSection('taxi')}
            className={`py-2 rounded-xl font-bold ${
              activeCustomerSection === 'taxi' ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300'
            }`}
          >
            🏍️ Taxi & Parcel
          </button>
        </div>

        {/* SECTION 1: ISOLATED CATEGORY SHOPPING */}
        {activeCustomerSection === 'shop' && (
          <div>
            {/* Category Cards with Images (Point 9) */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {categories
                .filter((c) => c.id !== 'decorations')
                .map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2 rounded-xl border text-left transition ${
                      selectedCategory === cat.id
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-gray-800 bg-gray-800/60'
                    }`}
                  >
                    <img src={cat.image} alt={cat.name} className="w-full h-12 object-cover rounded-lg mb-1" />
                    <p className="text-[11px] font-bold leading-tight">{cat.name}</p>
                    <span className="text-[9px] text-amber-400">{cat.badge}</span>
                  </button>
                ))}
            </div>

            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-gray-300">
                Nearest Best-Price Products ({categories.find((c) => c.id === selectedCategory)?.name})
              </h3>
              <span className="text-[10px] text-emerald-400">Sorted by Proximity</span>
            </div>

            {/* Product List with Measurement Dropdowns (Point 8 & 9) */}
            <div className="space-y-3">
              {approvedProducts.map((prod) => {
                const chosenVarId = selectedVariantMap[prod.id] || prod.variants[0].id;
                const currentVar = prod.variants.find((v) => v.id === chosenVarId) || prod.variants[0];
                return (
                  <div
                    key={prod.id}
                    className="bg-gray-800/90 border border-gray-700 rounded-xl p-3 flex gap-3 items-center"
                  >
                    <img
                      src={prod.image}
                      alt={prod.subCategoryBrand}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white">{prod.subCategoryBrand}</h4>
                      <p className="text-[10px] text-emerald-400">
                        📍 {prod.shopName} ({prod.distanceKm} km away)
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <select
                          value={currentVar.id}
                          onChange={(e) => setSelectedVariantMap({ ...selectedVariantMap, [prod.id]: e.target.value })}
                          className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[11px] text-amber-300"
                        >
                          {prod.variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.label} — ₹{v.price}
                            </option>
                          ))}
                        </select>
                        <button
                          disabled={isCustomerLockedWaitingForMerchantBill}
                          onClick={() => handleAddToCart(prod)}
                          className={`px-3 py-1 rounded-lg text-xs font-extrabold ${
                            isCustomerLockedWaitingForMerchantBill
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-amber-500 text-black'
                          }`}
                        >
                          {isCustomerLockedWaitingForMerchantBill ? 'Wait for Bill' : '+ Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: FUNCTION HALLS (BY NAME) & ANONYMOUS DECORATION SERVICES BIDDING */}
        {activeCustomerSection === 'events' && (
          <div className="space-y-4">
            {/* Step 1: Mandatory Date & Time Selection First (Rule 10) */}
            <div className="bg-gray-800 p-3 rounded-xl border border-amber-500/40">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-amber-400">📅 Step 1: Select Program Date & Time</h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                  {daysAway} Days Away ➔ {advancePercentage}% Advance Rule
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded p-1.5 text-white"
                />
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded p-1.5 text-white"
                />
              </div>
            </div>

            {/* Part A: Function Halls Shown Strictly By Name (Rule 4 & 9) */}
            <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
              <h3 className="text-xs font-bold text-white mb-2">🏛️ Function Halls (Direct Availability Booking)</h3>
              <div className="space-y-2">
                {functionHalls.map((hall) => {
                  const isAvailable = !hall.bookedDates.includes(eventDate);
                  return (
                    <div key={hall.id} className="bg-gray-900 p-2.5 rounded-lg flex gap-2.5 items-center">
                      <img src={hall.image} alt={hall.name} className="w-14 h-14 rounded object-cover" />
                      <div className="flex-1">
                        <h4 className="text-xs font-bold">{hall.name}</h4>
                        <p className="text-[10px] text-gray-400">
                          {hall.capacity} • ₹{hall.pricePerDay}/day
                        </p>
                        <span
                          className={`text-[10px] font-bold ${
                            isAvailable ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {isAvailable ? `✓ Available on ${eventDate}` : `✕ Booked on ${eventDate}`}
                        </span>
                      </div>
                      {isAvailable && (
                        <button
                          onClick={() =>
                            setHallBookingState({
                              hall,
                              advanceDue: Math.round((hall.pricePerDay * advancePercentage) / 100),
                              status: 'AWAITING_HALL_CONFIRMATION'
                            })
                          }
                          className="bg-amber-500 text-black px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold"
                        >
                          Request Slot
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {hallBookingState && (
                <div className="mt-2 bg-emerald-950/70 border border-emerald-500 p-2.5 rounded-lg text-xs">
                  <p className="font-bold text-emerald-300">
                    🏛️ {hallBookingState.hall.name} — {hallBookingState.status.replace(/_/g, ' ')}
                  </p>
                  {hallBookingState.status === 'HALL_CONFIRMED_PAY_ADVANCE' && (
                    <button
                      onClick={() => setHallBookingState({ ...hallBookingState, status: 'BOOKED_LOCKED' })}
                      className="mt-1.5 w-full bg-emerald-500 text-black font-bold py-1 rounded"
                    >
                      Pay {advancePercentage}% Advance (₹{hallBookingState.advanceDue}) to Lock Date
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Part B: Anonymous Decoration Services (Stage, Haldi, Mehndi, Sangeet) for Market Bidding */}
            <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-amber-400">
                  🌸 Anonymous Decoration Packages (Bidding Market)
                </h3>
                <span className="text-[10px] text-gray-400">Vendor Names Hidden</span>
              </div>
              <div className="space-y-2.5">
                {DECORATION_SERVICE_MODULES.map((mod) => {
                  const inCart = decorCart.some((i) => i.id === mod.id);
                  return (
                    <div key={mod.id} className="bg-gray-900 p-2.5 rounded-lg border border-gray-800">
                      <div className="flex gap-2.5">
                        <img
                          src={mod.samplePhotos[0]}
                          alt={mod.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div className="flex-1">
                          <span className="text-[9px] bg-purple-900/70 text-purple-200 px-1.5 py-0.5 rounded">
                            {mod.programType}
                          </span>
                          <h4 className="text-xs font-bold mt-0.5">{mod.title}</h4>
                          <p className="text-[10px] text-gray-400">{mod.features.join(' • ')}</p>
                          <p className="text-xs text-amber-400 font-bold mt-1">
                            Est. Benchmark: ₹{mod.baseEstimate}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setDecorCart(
                              inCart ? decorCart.filter((i) => i.id !== mod.id) : [...decorCart, mod]
                            )
                          }
                          className={`self-center px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${
                            inCart ? 'bg-red-600 text-white' : 'bg-amber-500 text-black'
                          }`}
                        >
                          {inCart ? 'Remove' : '+ Select'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dedicated Decoration Cart & Bidding Popup Trigger (Rules 5, 7, 9) */}
              {decorCart.length > 0 && (
                <div className="mt-3 bg-purple-950/60 border border-purple-400 p-3 rounded-xl text-xs">
                  <h4 className="font-bold text-purple-200 mb-1">
                    🛒 Dedicated Decoration Cart ({decorCart.length} Services Selected)
                  </h4>
                  <p className="text-[11px] text-gray-300 mb-2">
                    Selected: {decorCart.map((d) => d.title).join(', ')}
                  </p>
                  {biddingStatus === 'IDLE' && (
                    <button
                      onClick={() => {
                        setBiddingStatus('BROADCASTED');
                        setDecorBids([
                          {
                            id: 'bid_1',
                            maskedVendor: 'Verified Town Decorator #A1',
                            price: Math.round(decorCart.reduce((s, i) => s + i.baseEstimate, 0) * 0.88),
                            features: 'All selected features + Extra Floral Selfie Arch + Warm LED Par Lights'
                          }
                        ]);
                      }}
                      className="w-full bg-amber-500 text-black font-black py-2 rounded-lg"
                    >
                      📢 Broadcast to Merchant Bidding Market
                    </button>
                  )}

                  {biddingStatus === 'BROADCASTED' && (
                    <div className="space-y-2 mt-2">
                      <p className="text-amber-300 font-bold">
                        🔥 Live Competing Merchant Quotes (Lowest Price + Max Features):
                      </p>
                      {decorBids.map((b) => (
                        <div key={b.id} className="bg-gray-900 p-2.5 rounded border border-amber-500/40">
                          <div className="flex justify-between font-bold">
                            <span>{b.maskedVendor}</span>
                            <span className="text-emerald-400">₹{b.price}</span>
                          </div>
                          <p className="text-[10px] text-gray-300 my-1">{b.features}</p>
                          <button
                            onClick={() => {
                              setSelectedWinningBid(b);
                              setBiddingStatus('BID_ACCEPTED_AWAITING_MERCHANT');
                            }}
                            className="w-full bg-emerald-500 text-black font-bold py-1 rounded text-[11px]"
                          >
                            Accept Quote & Request Final Merchant Confirmation
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {biddingStatus === 'BID_ACCEPTED_AWAITING_MERCHANT' && (
                    <p className="text-amber-300 font-bold mt-2">
                      ⏳ Waiting for Decorator to confirm deal in Merchant Portal...
                    </p>
                  )}

                  {biddingStatus === 'DEAL_FINALIZED_PAYMENT_DUE' && selectedWinningBid && (
                    <div className="mt-2 bg-emerald-950 border border-emerald-400 p-2.5 rounded-lg">
                      <p className="font-bold text-emerald-300 mb-1">
                        ✅ Deal Finalized! ({daysAway} days to program ➔ {advancePercentage}% Advance Required)
                      </p>
                      <p className="text-[11px] text-gray-200 mb-2">
                        Total Bid: ₹{selectedWinningBid.price} • Pay {advancePercentage}% Now: ₹
                        {Math.round((selectedWinningBid.price * advancePercentage) / 100)} • Balance{' '}
                        {100 - advancePercentage}% due 5 hours before setup starts.
                      </p>
                      <button
                        onClick={() => setBiddingStatus('ADVANCE_PAID')}
                        className="w-full bg-amber-500 text-black font-black py-1.5 rounded"
                      >
                        Pay ₹{Math.round((selectedWinningBid.price * advancePercentage) / 100)} Advance via Escrow UPI
                      </button>
                    </div>
                  )}

                  {biddingStatus === 'ADVANCE_PAID' && (
                    <p className="text-emerald-400 font-bold mt-2">
                      🎉 {advancePercentage}% Advance Locked in Escrow! Remaining {100 - advancePercentage}% scheduled 5 hrs prior to decoration work.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 3: TAXIS & PARCELS WITH GOOGLE MAPS PICKUP/DROP POPUP (Rule 3 & 11) */}
        {activeCustomerSection === 'taxi' && (
          <div className="bg-gray-800 p-3.5 rounded-xl border border-gray-700 space-y-3 text-xs">
            <h3 className="font-bold text-amber-400">🏍️ Local Bike Taxi, 3W Auto & Parcel Service</h3>
            <div className="bg-gray-900 p-2.5 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Pickup Geo-Point:</span>
                <button
                  onClick={() => setMapModal({ ...mapModal, open: true, mode: 'taxi_pickup' })}
                  className="text-amber-400 underline font-bold"
                >
                  🗺️ Pin Pickup on Google Maps
                </button>
              </div>
              <p className="text-[11px] font-semibold text-white">{taxiRoute.pickup}</p>

              <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                <span className="text-gray-400">Drop Geo-Point:</span>
                <button
                  onClick={() => setMapModal({ ...mapModal, open: true, mode: 'taxi_drop' })}
                  className="text-emerald-400 underline font-bold"
                >
                  🗺️ Pin Drop on Google Maps
                </button>
              </div>
              <p className="text-[11px] font-semibold text-white">{taxiRoute.drop}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTaxiRoute({ ...taxiRoute, mode: '2w_taxi' })}
                className={`p-2 rounded-lg border text-center ${
                  taxiRoute.mode === '2w_taxi' ? 'border-amber-400 bg-amber-500/10' : 'border-gray-700'
                }`}
              >
                <p className="font-bold">🏍️ Bike Taxi</p>
                <p className="text-[10px] text-amber-400">₹31 ({taxiRoute.distanceKm} km)</p>
              </button>
              <button
                onClick={() => setTaxiRoute({ ...taxiRoute, mode: '3w_auto' })}
                className={`p-2 rounded-lg border text-center ${
                  taxiRoute.mode === '3w_auto' ? 'border-amber-400 bg-amber-500/10' : 'border-gray-700'
                }`}
              >
                <p className="font-bold">🛺 3W Auto</p>
                <p className="text-[10px] text-amber-400">₹50 (First 4km)</p>
              </button>
              <button
                onClick={() => setTaxiRoute({ ...taxiRoute, mode: 'parcel' })}
                className={`p-2 rounded-lg border text-center ${
                  taxiRoute.mode === 'parcel' ? 'border-amber-400 bg-amber-500/10' : 'border-gray-700'
                }`}
              >
                <p className="font-bold">📦 Parcel</p>
                <p className="text-[10px] text-amber-400">₹31 Instant</p>
              </button>
            </div>
          </div>
        )}

        {/* SEPARATE FULL-SCREEN CART, BILLING & LIVE TRACKING WINDOW (Rule 1 & Point 1) */}
        {showCartWindow && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-amber-500 rounded-2xl max-w-md w-full p-4 space-y-3 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <h3 className="font-black text-amber-400 text-sm">
                  🛒 Isolated Cart & Live Tracking ({categories.find((c) => c.id === selectedCategory)?.name})
                </h3>
                <button
                  onClick={() => setShowCartWindow(false)}
                  className="bg-gray-800 px-2.5 py-1 rounded text-xs font-bold"
                >
                  ✕ Close
                </button>
              </div>

              {currentCart.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">
                  Your {categories.find((c) => c.id === selectedCategory)?.name} cart is empty.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {currentCart.map((item) => (
                      <div
                        key={`${item.productId}_${item.variantId}`}
                        className="bg-gray-800 p-2.5 rounded-lg flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-[10px] text-gray-400">
                            ₹{item.price} x {item.qty} = ₹{item.price * item.qty}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateCartQty(selectedCategory, item.productId, item.variantId, -1)}
                            className="bg-gray-700 px-2 py-0.5 rounded font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold">{item.qty}</span>
                          <button
                            onClick={() => handleUpdateCartQty(selectedCategory, item.productId, item.variantId, 1)}
                            className="bg-gray-700 px-2 py-0.5 rounded font-bold"
                          >
                            +
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateCartQty(selectedCategory, item.productId, item.variantId, -item.qty)
                            }
                            className="bg-red-900/70 text-red-300 px-2 py-0.5 rounded text-[10px]"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const weight = currentCart.reduce((s, i) => s + i.weightGrams * i.qty, 0);
                    const subtotal = currentCart.reduce((s, i) => s + i.price * i.qty, 0);
                    const { vehicle, deliveryFee } = calculateLogistics(weight, mapModal.distanceKm, 0, 0);
                    const gst = Number(((subtotal + deliveryFee) * 0.05).toFixed(2));
                    return (
                      <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Assigned Vehicle:</span>
                          <span className="text-amber-400 font-bold">{vehicle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Weight:</span>
                          <span>{(weight / 1000).toFixed(2)} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Items Subtotal:</span>
                          <span>₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Proximity Delivery Fee ({mapModal.distanceKm} km):</span>
                          <span>₹{deliveryFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (5%):</span>
                          <span>₹{gst}</span>
                        </div>
                        <div className="flex justify-between font-black text-sm text-emerald-400 pt-1 border-t border-gray-800">
                          <span>Estimated Total:</span>
                          <span>₹{(subtotal + deliveryFee + gst).toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    disabled={isCustomerLockedWaitingForMerchantBill}
                    onClick={() => handlePlaceCategoryOrder(selectedCategory)}
                    className="w-full bg-emerald-500 text-black font-black py-2.5 rounded-xl text-xs"
                  >
                    Send Order to Merchant for Confirmation (3-Min SLA)
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Merchant Portal
  const renderMerchantPortal = () => {
    return (
      <div className="bg-gray-900 text-white rounded-2xl border border-gray-800 p-4 max-w-md mx-auto shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <div>
            <h2 className="text-base font-black text-amber-400">🏪 Merchant & Decorator Portal</h2>
            <p className="text-[11px] text-gray-400">4-Hour Automated Payouts • Concurrent Queue</p>
          </div>
          {/* Renamed strictly to '+ New Order' */}
          <button
            onClick={handleCreateConcurrentNewOrder}
            className="bg-emerald-500 text-black px-3 py-1.5 rounded-xl text-xs font-extrabold shadow"
          >
            + New Order
          </button>
        </div>

        {/* 1. Incoming Consumer Orders Popup & Concurrent Queue */}
        <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 space-y-2.5">
          <h3 className="text-xs font-bold text-amber-400">
            ⚡ Active Order Queue ({orders.length}) — OTP Masked (****)
          </h3>
          {orders.length === 0 ? (
            <p className="text-xs text-gray-400">No active orders. Tap "+ New Order" or place an order from Customer App.</p>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} className="bg-gray-900 p-3 rounded-xl border border-amber-500/40 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-300">
                    {ord.id} • {ord.customerName}
                  </span>
                  <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded text-emerald-400">
                    OTP: **** (Hidden)
                  </span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Items: {ord.items.map((i) => `${i.name} x${i.qty}`).join(', ')}
                </p>

                {ord.status === 'ORDER_PLACED_MERCHANT_POPUP' && (
                  <div className="space-y-2 pt-1 border-t border-gray-800">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-400">Heavy Transport (Default 0)</label>
                        <input
                          type="number"
                          defaultValue={0}
                          onChange={(e) => (ord.heavyTransportFee = Number(e.target.value))}
                          className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400">Labor Cost (Default 0)</label>
                        <input
                          type="number"
                          defaultValue={0}
                          onChange={(e) => (ord.laborFee = Number(e.target.value))}
                          className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs text-white"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleMerchantConfirmBill(ord.id, ord.heavyTransportFee, ord.laborFee)}
                      className="w-full bg-amber-500 text-black font-black py-1.5 rounded-lg"
                    >
                      ✓ Confirm Order & Push Bill to Consumer
                    </button>
                  </div>
                )}

                {ord.status === 'PAYMENT_DONE_PACKING_STARTED' && (
                  <button
                    onClick={() => handleMerchantDispatchAlert(ord.id)}
                    className="w-full bg-emerald-500 text-black font-black py-1.5 rounded-lg"
                  >
                    📦 Packing Done ➔ Alert Delivery Agent (5-10m SLA)
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* 2. Function Hall Availability Confirmation & Decoration Bidding Popup (Rule 9) */}
        {(biddingStatus !== 'IDLE' || hallBookingState) && (
          <div className="bg-purple-950/60 border border-purple-400 p-3 rounded-xl text-xs space-y-2">
            <h3 className="font-bold text-purple-200">🎉 Live Event & Decoration Bid Broadcasts</h3>

            {hallBookingState && hallBookingState.status === 'AWAITING_HALL_CONFIRMATION' && (
              <div className="bg-gray-900 p-2.5 rounded-lg">
                <p className="font-bold text-amber-300">
                  🏛️ Hall Slot Request: {hallBookingState.hall.name} on {eventDate}
                </p>
                <button
                  onClick={() =>
                    setHallBookingState({ ...hallBookingState, status: 'HALL_CONFIRMED_PAY_ADVANCE' })
                  }
                  className="mt-1.5 w-full bg-emerald-500 text-black font-bold py-1 rounded"
                >
                  Confirm Date Availability & Trigger {advancePercentage}% Advance Popup
                </button>
              </div>
            )}

            {biddingStatus === 'BROADCASTED' && (
              <div className="bg-gray-900 p-2.5 rounded-lg space-y-2">
                <p className="font-bold text-amber-300">
                  🔔 Consumer Broadcasted {decorCart.length} Decor Packages for {eventDate}
                </p>
                <input
                  type="number"
                  value={merchantBidForm.price}
                  onChange={(e) => setMerchantBidForm({ ...merchantBidForm, price: Number(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-white"
                  placeholder="Your Lowest Bid Price (₹)"
                />
                <input
                  type="text"
                  value={merchantBidForm.notes}
                  onChange={(e) => setMerchantBidForm({ ...merchantBidForm, notes: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-white"
                  placeholder="Max Features Included"
                />
                <button
                  onClick={() =>
                    setDecorBids([
                      ...decorBids,
                      {
                        id: `bid_${Date.now()}`,
                        maskedVendor: 'Decorator Partner #B2 (You)',
                        price: merchantBidForm.price,
                        features: merchantBidForm.notes
                      }
                    ])
                  }
                  className="w-full bg-amber-500 text-black font-bold py-1.5 rounded"
                >
                  Submit Competing Bid to Consumer Popup
                </button>
              </div>
            )}

            {biddingStatus === 'BID_ACCEPTED_AWAITING_MERCHANT' && (
              <div className="bg-emerald-950 border border-emerald-400 p-2.5 rounded-lg">
                <p className="font-bold text-emerald-300 mb-1">
                  🎯 Consumer Accepted Bid (₹{selectedWinningBid?.price})! Confirm to Raise {advancePercentage}% Payment Popup:
                </p>
                <button
                  onClick={() => setBiddingStatus('DEAL_FINALIZED_PAYMENT_DUE')}
                  className="w-full bg-emerald-500 text-black font-black py-1.5 rounded"
                >
                  ✓ Confirm Deal & Trigger {advancePercentage}% Consumer Advance Popup
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. Add Brand Sub-Category with Multi-Measurement Pricing (Points 8, 9, 10) */}
        <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 text-xs space-y-2">
          <h3 className="font-bold text-amber-400">➕ Declare Category & Add Brand Sub-Category</h3>
          <select
            value={newProdForm.categoryId}
            onChange={(e) => setNewProdForm({ ...newProdForm, categoryId: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                Category: {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Brand & Packing Name (e.g. Fortune Sunlite Oil)"
            value={newProdForm.subCategoryBrand}
            onChange={(e) => setNewProdForm({ ...newProdForm, subCategoryBrand: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-white"
          />
          <button
            onClick={() => {
              if (!newProdForm.subCategoryBrand) return;
              setPendingSubCategories([
                ...pendingSubCategories,
                {
                  id: `ps_${Date.now()}`,
                  categoryId: newProdForm.categoryId,
                  subCategoryBrand: newProdForm.subCategoryBrand,
                  shopName: newProdForm.shopName,
                  distanceKm: 1.1,
                  image: newProdForm.image,
                  status: 'pending',
                  variants: newProdForm.variants.map((v, idx) => ({ ...v, id: `v_${Date.now()}_${idx}` }))
                }
              ]);
              setNewProdForm({ ...newProdForm, subCategoryBrand: '' });
              alert('Submitted to Founder Admin for Approval!');
            }}
            className="w-full bg-amber-500 text-black font-bold py-1.5 rounded-lg"
          >
            Submit Brand & Multi-Measurement Variants for Founder Approval
          </button>

          {rejectedItems.length > 0 && (
            <div className="mt-2 bg-red-950/60 border border-red-500 p-2 rounded-lg">
              <p className="font-bold text-red-300">⚠️ Rejected by Founder (Needs Correction):</p>
              {rejectedItems.map((r) => (
                <p key={r.id} className="text-[10px] text-gray-200 mt-1">
                  • <strong>{r.subCategoryBrand}</strong> — Reason: {r.rejectReason} ({r.rejectComment})
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Rider Portal
  const renderRiderPortal = () => {
    return (
      <div className="bg-gray-900 text-white rounded-2xl border border-gray-800 p-4 max-w-md mx-auto shadow-2xl space-y-4 text-xs">
        <div className="border-b border-gray-800 pb-3">
          <h2 className="text-base font-black text-amber-400">🛵 Delivery & Taxi Partner App</h2>
          <p className="text-[11px] text-gray-400">5-10m Pickup SLA • OTP Hidden Until Consumer Reveal</p>
        </div>

        {orders.length === 0 ? (
          <p className="text-gray-400 py-6 text-center">No active dispatches. Ready at Home Screen for next order.</p>
        ) : (
          orders.map((ord) => (
            <div key={ord.id} className="bg-gray-800 p-3 rounded-xl border border-gray-700 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-amber-400">{ord.id}</span>
                <span>{ord.vehicle}</span>
              </div>
              <p className="text-gray-300">Drop: {ord.address}</p>
              <p className="text-emerald-400 font-bold">Consumer OTP Status: **** (Ask Consumer at Doorstep)</p>

              {ord.status === 'READY_FOR_PICKUP_AGENT_ALERTED' && (
                <button
                  onClick={() => handleRiderAcceptPickupToken(ord.id)}
                  className="w-full bg-amber-500 text-black font-black py-2 rounded-lg"
                >
                  🎟️ Accept Pickup Token at Merchant (Locks Reorder/Cancel)
                </button>
              )}

              {ord.status === 'OUT_FOR_DELIVERY_LIVE_MAP' && (
                <div className="space-y-2 pt-2 border-t border-gray-700">
                  <input
                    type="text"
                    placeholder="Enter 4-Digit OTP given by Consumer"
                    value={riderOtpInput}
                    onChange={(e) => setRiderOtpInput(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white font-mono"
                  />
                  <button
                    onClick={() => handleVerifyDeliveryOtp(ord.id)}
                    className="w-full bg-emerald-500 text-black font-black py-2 rounded-lg"
                  >
                    ✓ Verify OTP & Complete Handover
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  // Render Founder Master Admin Portal
  const renderAdminPortal = () => {
    return (
      <div className="bg-gray-900 text-white rounded-2xl border border-gray-800 p-4 max-w-md mx-auto shadow-2xl space-y-4 text-xs">
        <div className="border-b border-gray-800 pb-2">
          <h2 className="text-base font-black text-amber-400">💻 Founder Master Admin Portal</h2>
          <p className="text-[11px] text-gray-400">Partner & Sub-Category Approvals • Dynamic 0-10% Sliders</p>
        </div>

        {/* Pending Merchant Partner Registrations Approval */}
        <div className="bg-gray-800 p-3 rounded-xl border border-amber-500/40 space-y-2">
          <h3 className="font-bold text-amber-400">
            🛡️ Pending Merchant Partner Registrations ({pendingMerchants.length})
          </h3>
          {pendingMerchants.map((pm) => (
            <div key={pm.id} className="bg-gray-900 p-2.5 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold">{pm.businessName}</p>
                <p className="text-[10px] text-gray-400">
                  📱 {pm.phone} • Cat: {pm.categoryId} • E-Signed: ✓
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPendingMerchants(pendingMerchants.filter((m) => m.id !== pm.id))}
                  className="bg-emerald-500 text-black px-2.5 py-1 rounded font-bold"
                >
                  Approve
                </button>
                <button
                  onClick={() => setPendingMerchants(pendingMerchants.filter((m) => m.id !== pm.id))}
                  className="bg-red-600 text-white px-2.5 py-1 rounded font-bold"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Brand Sub-Categories Approval with Reason Dropdown (Point 10 & Rule 21) */}
        <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 space-y-2">
          <h3 className="font-bold text-amber-400">
            📦 Pending Brand Sub-Categories ({pendingSubCategories.length})
          </h3>
          {pendingSubCategories.map((item) => (
            <div key={item.id} className="bg-gray-900 p-2.5 rounded-lg space-y-2">
              <div className="flex gap-2 items-center">
                <img src={item.image} alt={item.subCategoryBrand} className="w-10 h-10 rounded object-cover" />
                <div>
                  <p className="font-bold">{item.subCategoryBrand}</p>
                  <p className="text-[10px] text-gray-400">
                    {item.shopName} • {item.variants.length} Measurement Variants
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setProducts([...products, { ...item, status: 'approved' }]);
                    setPendingSubCategories(pendingSubCategories.filter((i) => i.id !== item.id));
                  }}
                  className="flex-1 bg-emerald-500 text-black py-1 rounded font-bold"
                >
                  ✓ Approve Live
                </button>
                <button
                  onClick={() =>
                    setRejectModal({ open: true, item, reason: REJECTION_REASONS[0], comment: '' })
                  }
                  className="flex-1 bg-red-600 text-white py-1 rounded font-bold"
                >
                  ✕ Reject with Reason...
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Commission Sliders */}
        <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 space-y-2">
          <div className="flex justify-between">
            <span>Merchant Commission (0% - 10%):</span>
            <span className="font-bold text-amber-400">{merchantCommissionPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={merchantCommissionPct}
            onChange={(e) => setMerchantCommissionPct(e.target.value)}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between">
            <span>Consumer Platform Fee (0% - 5%):</span>
            <span className="font-bold text-amber-400">{consumerFeePct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={consumerFeePct}
            onChange={(e) => setConsumerFeePct(e.target.value)}
            className="w-full accent-amber-500"
          />
        </div>

        {/* Rejection Reason Modal (Point 10) */}
        {rejectModal.open && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-red-500 rounded-xl p-4 max-w-sm w-full space-y-3">
              <h4 className="font-bold text-red-400">Select Rejection Reason for Merchant Correction</h4>
              <select
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
              >
                {REJECTION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Optional Founder Comment for correction..."
                value={rejectModal.comment}
                onChange={(e) => setRejectModal({ ...rejectModal, comment: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setRejectedItems([
                      ...rejectedItems,
                      {
                        ...rejectModal.item,
                        rejectReason: rejectModal.reason,
                        rejectComment: rejectModal.comment || 'Please update and resubmit'
                      }
                    ]);
                    setPendingSubCategories(
                      pendingSubCategories.filter((i) => i.id !== rejectModal.item.id)
                    );
                    setRejectModal({ open: false, item: null, reason: REJECTION_REASONS[0], comment: '' });
                  }}
                  className="flex-1 bg-red-600 text-white py-1.5 rounded font-bold"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => setRejectModal({ open: false, item: null, reason: REJECTION_REASONS[0], comment: '' })}
                  className="flex-1 bg-gray-700 py-1.5 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Registration Hub (Point 12)
  const renderRegistrationHub = () => (
    <div className="bg-gray-900 text-white rounded-2xl border border-gray-800 p-4 max-w-md mx-auto shadow-2xl space-y-3 text-xs">
      <h2 className="text-base font-black text-amber-400">📝 Onboarding & Registration Hub</h2>
      <div className="grid grid-cols-3 gap-2">
        {['consumer', 'merchant', 'rider'].map((r) => (
          <button
            key={r}
            onClick={() => setRegRole(r)}
            className={`py-2 rounded-lg font-bold capitalize ${
              regRole === r ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder={regRole === 'merchant' ? 'Business / Shop Name' : 'Full Legal Name'}
        value={regName}
        onChange={(e) => setRegName(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
      />
      <input
        type="tel"
        placeholder="10-Digit Mobile Number (OTP Verified)"
        value={regPhone}
        onChange={(e) => setRegPhone(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
      />
      {regRole === 'merchant' && (
        <select
          value={regCategory}
          onChange={(e) => setRegCategory(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              Declare Primary Category: {c.name}
            </option>
          ))}
        </select>
      )}
      {regRole === 'rider' && (
        <select
          value={regServiceMode}
          onChange={(e) => setRegServiceMode(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
        >
          <option value="single">Single Service (0% Fee • Leaderboard Eligible)</option>
          <option value="both">Both Delivery & Taxi (Priority Allocation)</option>
        </select>
      )}
      <label className="flex items-center gap-2 text-gray-300">
        <input type="checkbox" checked={regESign} onChange={(e) => setRegESign(e.target.checked)} />
        Accept Digital E-Sign SLA & GPS Permission Lock
      </label>
      <button
        onClick={() => {
          if (!regName || !regPhone || !regESign) {
            alert('Please fill name, phone, and accept Digital E-Sign SLA.');
            return;
          }
          if (regRole === 'merchant') {
            setPendingMerchants([
              ...pendingMerchants,
              { id: `pm_${Date.now()}`, businessName: regName, phone: regPhone, categoryId: regCategory, eSigned: true, status: 'pending' }
            ]);
            alert('Merchant Registration sent to Founder Admin Portal for approval!');
          } else {
            alert(`${regRole.toUpperCase()} account registered and activated!`);
          }
          setRegName('');
          setRegPhone('');
        }}
        className="w-full bg-emerald-500 text-black font-black py-2 rounded-xl"
      >
        Complete Registration
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-3 font-sans">
      {/* Master Top Navigation Switcher */}
      <div className="max-w-7xl mx-auto mb-4 bg-gray-900 border border-gray-800 p-2 rounded-2xl flex flex-wrap gap-2 justify-center text-xs sticky top-2 z-40">
        <button
          onClick={() => setActivePortal('customer')}
          className={`px-3 py-1.5 rounded-xl font-bold ${
            activePortal === 'customer' ? 'bg-amber-500 text-black' : 'bg-gray-800'
          }`}
        >
          🛍️ 1. Customer App
        </button>
        <button
          onClick={() => setActivePortal('merchant')}
          className={`px-3 py-1.5 rounded-xl font-bold ${
            activePortal === 'merchant' ? 'bg-amber-500 text-black' : 'bg-gray-800'
          }`}
        >
          🏪 2. Merchant App
        </button>
        <button
          onClick={() => setActivePortal('rider')}
          className={`px-3 py-1.5 rounded-xl font-bold ${
            activePortal === 'rider' ? 'bg-amber-500 text-black' : 'bg-gray-800'
          }`}
        >
          🛵 3. Rider App
        </button>
        <button
          onClick={() => setActivePortal('admin')}
          className={`px-3 py-1.5 rounded-xl font-bold ${
            activePortal === 'admin' ? 'bg-amber-500 text-black' : 'bg-gray-800'
          }`}
        >
          💻 4. Founder Admin ({pendingMerchants.length + pendingSubCategories.length})
        </button>
        <button
          onClick={() => setActivePortal('register')}
          className={`px-3 py-1.5 rounded-xl font-bold ${
            activePortal === 'register' ? 'bg-amber-500 text-black' : 'bg-gray-800'
          }`}
        >
          📝 5. Registration Hub
        </button>
        <button
          onClick={() => setActivePortal('split')}
          className={`px-3 py-1.5 rounded-xl font-bold ${
            activePortal === 'split' ? 'bg-emerald-500 text-black' : 'bg-gray-800'
          }`}
        >
          📱 6. Side-by-Side Live View
        </button>
      </div>

      {/* Portal Rendering */}
      {activePortal === 'customer' && renderCustomerPortal()}
      {activePortal === 'merchant' && renderMerchantPortal()}
      {activePortal === 'rider' && renderRiderPortal()}
      {activePortal === 'admin' && renderAdminPortal()}
      {activePortal === 'register' && renderRegistrationHub()}
      {activePortal === 'split' && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
          {renderCustomerPortal()}
          {renderMerchantPortal()}
          {renderRiderPortal()}
        </div>
      )}

      {/* Interactive Google Maps Pinpoint Modal (Rules 2, 3, 11) */}
      {mapModal.open && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-amber-500 rounded-2xl max-w-md w-full p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-amber-400">🗺️ Google Maps Live Geo-Pinpointer (Adilabad)</h3>
              <button
                onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
                className="bg-gray-800 px-2 py-1 rounded text-[10px]"
              >
                Toggle {mapType === 'street' ? 'Satellite' : 'Street'}
              </button>
            </div>

            <div className="w-full h-56 rounded-xl overflow-hidden border border-gray-700 relative">
              <iframe
                title="Google Maps Adilabad"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${mapModal.lat},${mapModal.lng}&t=${
                  mapType === 'satellite' ? 'k' : 'm'
                }&z=15&output=embed`}
                allowFullScreen
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  setMapModal({
                    ...mapModal,
                    lat: 19.6641,
                    lng: 78.532,
                    addressLabel: 'Collectorate Chowk, Adilabad (19.6641° N, 78.5320° E)',
                    distanceKm: 2.2
                  })
                }
                className="bg-gray-800 p-2 rounded text-left hover:border border-amber-400"
              >
                📍 Collectorate Chowk (2.2 km)
              </button>
              <button
                onClick={() =>
                  setMapModal({
                    ...mapModal,
                    lat: 19.6712,
                    lng: 78.5358,
                    addressLabel: 'Gandhi Park & Main Bazaar (19.6712° N, 78.5358° E)',
                    distanceKm: 1.4
                  })
                }
                className="bg-gray-800 p-2 rounded text-left hover:border border-amber-400"
              >
                📍 Main Bazaar Hub (1.4 km)
              </button>
            </div>

            <button
              onClick={() => {
                if (mapModal.mode === 'taxi_pickup') {
                  setTaxiRoute({ ...taxiRoute, pickup: mapModal.addressLabel });
                } else if (mapModal.mode === 'taxi_drop') {
                  setTaxiRoute({ ...taxiRoute, drop: mapModal.addressLabel });
                }
                setMapModal({ ...mapModal, open: false });
              }}
              className="w-full bg-emerald-500 text-black font-black py-2 rounded-xl"
            >
              ✓ Confirm Pinpoint & Close Google Maps
            </button>
          </div>
        </div>
      )}
    </div>
  );
}