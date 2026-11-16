/**
 * Sales Analytics Dashboard - Vanilla JavaScript
 * Zero external libraries, zero backend, WebStorage persistence, zero CSS variables.
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY = 'apex_sales_dashboard_data_v1';
  const CATEGORY_COLORS = {
    'Electronics': '#2563eb',
    'Software': '#7c3aed',
    'Fashion': '#ec4899',
    'Home & Office': '#f59e0b',
    'Services': '#10b981',
    'Other': '#64748b'
  };

  const CHANNEL_COLORS = {
    'Direct Web': '#3b82f6',
    'Retail Store': '#10b981',
    'Wholesale': '#8b5cf6',
    'Affiliate': '#f97316',
    'Marketplace': '#06b6d4'
  };

  // --- App State ---
  let salesData = [];
  let currentRange = '30d'; // '7d' | '30d' | '90d' | 'ytd' | 'all'
  let tableSearchTerm = '';
  let tableStatusFilter = 'all';
  let tableCategoryFilter = 'all';
  let tableChannelFilter = 'all';
  let tableSortColumn = 'date';
  let tableSortAsc = false;
  let tableCurrentPage = 1;
  const tablePageSize = 8;

  // Cache DOM Elements
  const elements = {
    // KPI elements
    kpiTotalRevenue: document.getElementById('kpiTotalRevenue'),
    kpiRevenueTrend: document.getElementById('kpiRevenueTrend'),
    kpiRevenueComparison: document.getElementById('kpiRevenueComparison'),
    sparklineRevenue: document.getElementById('sparklineRevenue'),

    kpiTotalOrders: document.getElementById('kpiTotalOrders'),
    kpiOrdersTrend: document.getElementById('kpiOrdersTrend'),
    kpiOrdersComparison: document.getElementById('kpiOrdersComparison'),
    sparklineOrders: document.getElementById('sparklineOrders'),

    kpiAvgOrderValue: document.getElementById('kpiAvgOrderValue'),
    kpiAovTrend: document.getElementById('kpiAovTrend'),
    kpiAovComparison: document.getElementById('kpiAovComparison'),
    sparklineAov: document.getElementById('sparklineAov'),

    kpiGrossProfit: document.getElementById('kpiGrossProfit'),
    kpiMarginBadge: document.getElementById('kpiMarginBadge'),
    kpiRefundsCount: document.getElementById('kpiRefundsCount'),
    sparklineProfit: document.getElementById('sparklineProfit'),

    // Canvas charts
    trendChartContainer: document.getElementById('trendChartContainer'),
    trendChartCanvas: document.getElementById('trendChartCanvas'),
    trendChartTooltip: document.getElementById('trendChartTooltip'),

    donutChartContainer: document.getElementById('donutChartContainer'),
    categoryDonutCanvas: document.getElementById('categoryDonutCanvas'),
    donutChartTooltip: document.getElementById('donutChartTooltip'),
    categoryBreakdownList: document.getElementById('categoryBreakdownList'),

    channelChartContainer: document.getElementById('channelChartContainer'),
    channelBarCanvas: document.getElementById('channelBarCanvas'),
    channelChartTooltip: document.getElementById('channelChartTooltip'),

    topProductsList: document.getElementById('topProductsList'),

    // Table elements
    transactionsTableBody: document.getElementById('transactionsTableBody'),
    tableEmptyState: document.getElementById('tableEmptyState'),
    tableSummaryText: document.getElementById('tableSummaryText'),
    searchInput: document.getElementById('searchInput'),
    statusFilter: document.getElementById('statusFilter'),
    categoryFilter: document.getElementById('categoryFilter'),
    channelFilter: document.getElementById('channelFilter'),
    thOrderId: document.getElementById('thOrderId'),
    thDate: document.getElementById('thDate'),
    thAmount: document.getElementById('thAmount'),
    paginationInfo: document.getElementById('paginationInfo'),
    paginationControls: document.getElementById('paginationControls'),

    // Date range buttons
    dateFilterGroup: document.getElementById('dateFilterGroup'),

    // Modal elements
    saleModal: document.getElementById('saleModal'),
    modalTitle: document.getElementById('modalTitle'),
    saleForm: document.getElementById('saleForm'),
    btnOpenAddModal: document.getElementById('btnOpenAddModal'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnCancelModal: document.getElementById('btnCancelModal'),
    editSaleId: document.getElementById('editSaleId'),
    formCustomerName: document.getElementById('formCustomerName'),
    formCustomerEmail: document.getElementById('formCustomerEmail'),
    formProductName: document.getElementById('formProductName'),
    formCategory: document.getElementById('formCategory'),
    formChannel: document.getElementById('formChannel'),
    formAmount: document.getElementById('formAmount'),
    formUnits: document.getElementById('formUnits'),
    formDate: document.getElementById('formDate'),
    formStatus: document.getElementById('formStatus'),

    // Action buttons
    btnExportCSV: document.getElementById('btnExportCSV'),
    btnResetData: document.getElementById('btnResetData'),
    bannerSeedBtn: document.getElementById('bannerSeedBtn'),
    toastContainer: document.getElementById('toastContainer')
  };

  // --- Sample Dataset Generator ---
  function generateSampleData() {
    const customers = [
      { name: 'Alex Thompson', email: 'alex.t@cloudcore.io' },
      { name: 'Sarah Jenkins', email: 'sarah.j@acmefirm.com' },
      { name: 'Marcus Vance', email: 'marcus.v@hyperlogic.net' },
      { name: 'Elena Rostova', email: 'elena@novadesign.org' },
      { name: 'David Kim', email: 'dkim@summitventures.co' },
      { name: 'Chloe Dubois', email: 'chloe.d@atelierluxe.fr' },
      { name: 'Liam O’Connor', email: 'liam@dublinfintech.ie' },
      { name: 'Sophia Chen', email: 'sophia.c@solardynamics.com' },
      { name: 'Mateo Hernandez', email: 'mateo@andalusiamedia.es' },
      { name: 'Amara Okafor', email: 'amara.o@zenithpay.com' },
      { name: 'Oliver Wright', email: 'oliver.w@nexusretail.co.uk' },
      { name: 'Hannah Schmidt', email: 'hannah.s@bavariaauto.de' }
    ];

    const products = [
      { name: 'Pro Ultra HD Curved Monitor 38"', category: 'Electronics', price: 949.00 },
      { name: 'Studio ANC Wireless Headphones', category: 'Electronics', price: 299.50 },
      { name: 'Custom Mechanical Ergonomic Keyboard', category: 'Electronics', price: 185.00 },
      { name: 'Thunderbolt 4 Multi-Port Dock', category: 'Electronics', price: 219.00 },

      { name: 'Cloud Enterprise SaaS - 10 Seats', category: 'Software', price: 1200.00 },
      { name: 'AI Analytics Pro Annual Plan', category: 'Software', price: 780.00 },
      { name: 'CyberShield Zero-Trust Suite', category: 'Software', price: 1450.00 },
      { name: 'Team Workspace Collaboration Sub', category: 'Software', price: 360.00 },

      { name: 'Merino Wool Executive Overcoat', category: 'Fashion', price: 380.00 },
      { name: 'Italian Leather Messenger Briefcase', category: 'Fashion', price: 265.00 },
      { name: 'Performance Knit Activewear Set', category: 'Fashion', price: 115.00 },

      { name: 'Motorized Dual-Motor Standing Desk', category: 'Home & Office', price: 549.00 },
      { name: 'Ergonomic Mesh Lumbar Task Chair', category: 'Home & Office', price: 420.00 },
      { name: 'Architectural LED Monitor Lamp', category: 'Home & Office', price: 89.00 },

      { name: 'Enterprise Architecture Consulting (8h)', category: 'Services', price: 1800.00 },
      { name: 'Revenue Operations Diagnostic Audit', category: 'Services', price: 1250.00 }
    ];

    const channels = ['Direct Web', 'Retail Store', 'Wholesale', 'Affiliate', 'Marketplace'];
    const statuses = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'pending', 'refunded'];

    const items = [];
    const now = new Date();

    // Generate ~65 transactions spanning the past 120 days
    for (let i = 1; i <= 65; i++) {
      const daysAgo = Math.floor(Math.pow(Math.random(), 1.25) * 110);
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      // Randomize hours and minutes
      date.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60));

      const customer = customers[Math.floor(Math.random() * customers.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const channel = channels[Math.floor(Math.random() * channels.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const units = (product.category === 'Electronics' || product.category === 'Fashion') && Math.random() > 0.65 ? Math.floor(Math.random() * 3) + 1 : 1;
      const amount = Math.round(product.price * units * 100) / 100;

      const orderNumber = 1000 + i;

      items.push({
        id: 'ORD-' + orderNumber,
        customerName: customer.name,
        customerEmail: customer.email,
        productName: product.name,
        category: product.category,
        channel: channel,
        amount: amount,
        units: units,
        date: date.toISOString().split('T')[0],
        status: status,
        timestamp: date.getTime()
      });
    }

    // Sort by timestamp descending
    items.sort((a, b) => b.timestamp - a.timestamp);
    return items;
  }

  // --- Storage Operations ---
  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        salesData = JSON.parse(stored);
      } else {
        salesData = generateSampleData();
        saveData();
      }
    } catch (e) {
      console.warn('LocalStorage not available or corrupted, using demo memory state:', e);
      salesData = generateSampleData();
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salesData));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      showToast('Error saving data to local storage', 'error');
    }
  }

  // --- Date Range Calculations ---
  function getDateRangeFilter() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    let start = new Date(today);
    let prevStart = null;
    let prevEnd = null;

    if (currentRange === '7d') {
      start.setDate(today.getDate() - 7);
      prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 7);
      prevEnd = new Date(start);
    } else if (currentRange === '30d') {
      start.setDate(today.getDate() - 30);
      prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 30);
      prevEnd = new Date(start);
    } else if (currentRange === '90d') {
      start.setDate(today.getDate() - 90);
      prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 90);
      prevEnd = new Date(start);
    } else if (currentRange === 'ytd') {
      start = new Date(now.getFullYear(), 0, 1);
      const diffMs = today.getTime() - start.getTime();
      prevEnd = new Date(start.getTime() - 1);
      prevStart = new Date(prevEnd.getTime() - diffMs);
    } else {
      // 'all'
      start = new Date(1970, 0, 1);
      prevStart = null;
      prevEnd = null;
    }

    return {
      currentStart: start.getTime(),
      currentEnd: today.getTime(),
      prevStart: prevStart ? prevStart.getTime() : null,
      prevEnd: prevEnd ? prevEnd.getTime() : null
    };
  }

  function getFilteredTransactions() {
    const { currentStart, currentEnd } = getDateRangeFilter();
    return salesData.filter(item => {
      const itemTime = new Date(item.date).getTime();
      return itemTime >= currentStart && itemTime <= currentEnd;
    });
  }

  function getPreviousPeriodTransactions() {
    const { prevStart, prevEnd } = getDateRangeFilter();
    if (!prevStart || !prevEnd) return [];
    return salesData.filter(item => {
      const itemTime = new Date(item.date).getTime();
      return itemTime >= prevStart && itemTime < prevEnd;
    });
  }

  // --- Formatters ---
  function formatCurrency(val) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  }

  function formatNumber(val) {
    return new Intl.NumberFormat('en-US').format(val);
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  }

  // --- Sparkline Rendering (Pure Canvas, No CSS Variables) ---
  function drawSparkline(canvas, dataPoints, strokeColor, fillColor) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = 90;
    const height = 32;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (!dataPoints || dataPoints.length < 2) {
      // Simple flat baseline
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    const max = Math.max(...dataPoints, 1);
    const min = Math.min(...dataPoints, 0);
    const range = max - min || 1;
    const stepX = width / (dataPoints.length - 1);

    const points = dataPoints.map((val, idx) => ({
      x: idx * stepX,
      y: height - 4 - ((val - min) / range) * (height - 8)
    }));

    // Area fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, height);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // --- Update KPI Metrics ---
  function updateKPIs() {
    const currentItems = getFilteredTransactions();
    const prevItems = getPreviousPeriodTransactions();

    // 1. Total Revenue (Completed only)
    const currentCompleted = currentItems.filter(i => i.status === 'completed');
    const prevCompleted = prevItems.filter(i => i.status === 'completed');

    const totalRevenue = currentCompleted.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    const prevRevenue = prevCompleted.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

    // 2. Orders count
    const totalOrders = currentCompleted.length;
    const prevOrders = prevCompleted.length;

    // 3. Average Order Value
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const prevAov = prevOrders > 0 ? prevRevenue / prevOrders : 0;

    // 4. Gross Profit (68% margin assumed, refunds subtracted)
    const refundedItems = currentItems.filter(i => i.status === 'refunded');
    const refundsTotal = refundedItems.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    const grossProfit = Math.max(0, (totalRevenue * 0.68) - (refundsTotal * 0.5));

    // Render text
    elements.kpiTotalRevenue.textContent = formatCurrency(totalRevenue);
    elements.kpiTotalOrders.textContent = formatNumber(totalOrders);
    elements.kpiAvgOrderValue.textContent = formatCurrency(aov);
    elements.kpiGrossProfit.textContent = formatCurrency(grossProfit);

    elements.kpiRefundsCount.textContent = `${refundedItems.length} refund${refundedItems.length === 1 ? '' : 's'} (${formatCurrency(refundsTotal)})`;

    // Percentage Changes
    function setTrend(badgeElement, current, prev, isCurrency) {
      if (!prev || prev === 0) {
        badgeElement.className = 'trend-badge trend-neutral';
        badgeElement.innerHTML = `<span>+0%</span>`;
        return;
      }
      const changePct = ((current - prev) / prev) * 100;
      const isPositive = changePct >= 0;
      badgeElement.className = `trend-badge ${isPositive ? 'trend-up' : 'trend-down'}`;
      const sign = isPositive ? '+' : '';
      const icon = isPositive
        ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>`
        : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
      badgeElement.innerHTML = `${icon}<span>${sign}${changePct.toFixed(1)}%</span>`;
    }

    setTrend(elements.kpiRevenueTrend, totalRevenue, prevRevenue, true);
    setTrend(elements.kpiOrdersTrend, totalOrders, prevOrders, false);
    setTrend(elements.kpiAovTrend, aov, prevAov, true);

    const rangeLabel = currentRange === '7d' ? 'vs prior 7 days'
      : currentRange === '30d' ? 'vs prior 30 days'
      : currentRange === '90d' ? 'vs prior 90 days'
      : currentRange === 'ytd' ? 'vs prior year period'
      : 'all-time baseline';
    elements.kpiRevenueComparison.textContent = rangeLabel;
    elements.kpiOrdersComparison.textContent = rangeLabel;
    elements.kpiAovComparison.textContent = 'Average basket size';

    // Sparklines data generation (aggregate recent 7 chunks)
    const bucketsCount = 7;
    const revBuckets = new Array(bucketsCount).fill(0);
    const ordBuckets = new Array(bucketsCount).fill(0);
    const aovBuckets = new Array(bucketsCount).fill(0);

    if (currentCompleted.length > 0) {
      const sorted = [...currentCompleted].sort((a, b) => new Date(a.date) - new Date(b.date));
      const chunk = Math.max(1, Math.floor(sorted.length / bucketsCount));
      for (let b = 0; b < bucketsCount; b++) {
        const slice = sorted.slice(b * chunk, (b + 1) * chunk);
        const bRev = slice.reduce((s, x) => s + Number(x.amount), 0);
        revBuckets[b] = bRev;
        ordBuckets[b] = slice.length;
        aovBuckets[b] = slice.length ? bRev / slice.length : 0;
      }
    }

    drawSparkline(elements.sparklineRevenue, revBuckets, '#2563eb', 'rgba(37, 99, 235, 0.12)');
    drawSparkline(elements.sparklineOrders, ordBuckets, '#10b981', 'rgba(16, 185, 129, 0.12)');
    drawSparkline(elements.sparklineAov, aovBuckets, '#7c3aed', 'rgba(124, 58, 237, 0.12)');
    drawSparkline(elements.sparklineProfit, revBuckets.map(v => v * 0.68), '#d97706', 'rgba(217, 119, 6, 0.12)');
  }

  // --- Main Trend Chart (Dual Axis Area & Line Canvas) ---
  let trendChartState = {
    points: [],
    hoveredIndex: -1
  };

  function renderTrendChart() {
    const canvas = elements.trendChartCanvas;
    if (!canvas) return;
    const container = elements.trendChartContainer;
    const rect = container.getBoundingClientRect();
    const width = rect.width || 600;
    const height = Math.max(260, rect.height || 280);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const items = getFilteredTransactions().filter(i => i.status === 'completed');

    // Aggregate by date
    const dateMap = {};
    items.forEach(item => {
      if (!dateMap[item.date]) {
        dateMap[item.date] = { revenue: 0, orders: 0 };
      }
      dateMap[item.date].revenue += Number(item.amount) || 0;
      dateMap[item.date].orders += 1;
    });

    const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));

    // Padding margins
    const padLeft = 60;
    const padRight = 30;
    const padTop = 20;
    const padBottom = 40;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    if (sortedDates.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Not enough completed transactions in this timeframe to plot velocity.', width / 2, height / 2);
      trendChartState.points = [];
      return;
    }

    const revenues = sortedDates.map(d => dateMap[d].revenue);
    const orders = sortedDates.map(d => dateMap[d].orders);

    const maxRev = Math.max(...revenues, 100);
    const maxOrd = Math.max(...orders, 5);

    // Draw horizontal grid lines
    const gridLines = 4;
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const y = padTop + (chartH / gridLines) * i;
      const revVal = maxRev - (maxRev / gridLines) * i;

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillText('$' + Math.round(revVal), padLeft - 10, y + 4);
    }

    // Coordinates calculation
    const stepX = chartW / (sortedDates.length - 1);
    const revPoints = [];
    const ordPoints = [];

    sortedDates.forEach((date, i) => {
      const x = padLeft + i * stepX;
      const yRev = padTop + chartH - (dateMap[date].revenue / maxRev) * chartH;
      const yOrd = padTop + chartH - (dateMap[date].orders / maxOrd) * chartH;
      revPoints.push({ x, y: yRev, date, revenue: dateMap[date].revenue, orders: dateMap[date].orders });
      ordPoints.push({ x, y: yOrd });
    });

    trendChartState.points = revPoints;

    // 1. Draw Revenue Gradient Area
    ctx.beginPath();
    ctx.moveTo(revPoints[0].x, padTop + chartH);
    revPoints.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(revPoints[revPoints.length - 1].x, padTop + chartH);
    ctx.closePath();

    const areaGrad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    areaGrad.addColorStop(0, 'rgba(37, 99, 235, 0.28)');
    areaGrad.addColorStop(1, 'rgba(37, 99, 235, 0.01)');
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // 2. Draw Revenue Line
    ctx.beginPath();
    ctx.moveTo(revPoints[0].x, revPoints[0].y);
    for (let i = 1; i < revPoints.length; i++) {
      ctx.lineTo(revPoints[i].x, revPoints[i].y);
    }
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 3. Draw Orders Line (Dashed Emerald)
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(ordPoints[0].x, ordPoints[0].y);
    for (let i = 1; i < ordPoints.length; i++) {
      ctx.lineTo(ordPoints[i].x, ordPoints[i].y);
    }
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 4. Draw X-axis Date Labels (sample every N labels to avoid overlapping)
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    const labelStep = Math.ceil(sortedDates.length / 6);
    sortedDates.forEach((date, i) => {
      if (i % labelStep === 0 || i === sortedDates.length - 1) {
        const x = padLeft + i * stepX;
        const shortDate = formatDateDisplay(date).replace(/, \d{4}$/, '');
        ctx.fillText(shortDate, x, height - 12);
      }
    });

    // 5. Draw Hover indicator if active
    if (trendChartState.hoveredIndex >= 0 && trendChartState.hoveredIndex < revPoints.length) {
      const hp = revPoints[trendChartState.hoveredIndex];

      // Vertical guideline
      ctx.beginPath();
      ctx.moveTo(hp.x, padTop);
      ctx.lineTo(hp.x, padTop + chartH);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Outer circle
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#2563eb';
      ctx.stroke();
    }
  }

  // --- Category Donut Chart (Canvas) ---
  let donutChartState = {
    slices: [],
    hoveredIndex: -1
  };

  function renderCategoryDonutChart() {
    const canvas = elements.categoryDonutCanvas;
    if (!canvas) return;
    const container = elements.donutChartContainer;
    const rect = container.getBoundingClientRect();
    const width = rect.width || 320;
    const height = Math.max(200, rect.height || 220);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const items = getFilteredTransactions().filter(i => i.status === 'completed');

    // Aggregate by category
    const catTotals = {};
    let grandTotal = 0;
    items.forEach(item => {
      const cat = item.category || 'Other';
      const amt = Number(item.amount) || 0;
      catTotals[cat] = (catTotals[cat] || 0) + amt;
      grandTotal += amt;
    });

    const entries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

    if (grandTotal === 0 || entries.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No category sales recorded yet.', width / 2, height / 2);
      elements.categoryBreakdownList.innerHTML = '<p style="color:#94a3b8;font-size:12px;text-align:center;">No data available</p>';
      donutChartState.slices = [];
      return;
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 14;
    const innerRadius = outerRadius * 0.62;

    let currentAngle = -Math.PI / 2;
    const slices = [];

    entries.forEach(([category, amount], idx) => {
      const sliceAngle = (amount / grandTotal) * (Math.PI * 2);
      const endAngle = currentAngle + sliceAngle;
      const color = CATEGORY_COLORS[category] || '#64748b';

      const isHovered = donutChartState.hoveredIndex === idx;
      const currentOuter = isHovered ? outerRadius + 4 : outerRadius;

      ctx.beginPath();
      ctx.arc(centerX, centerY, currentOuter, currentAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, currentAngle, true);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();

      // Border separation
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      slices.push({
        category,
        amount,
        percent: ((amount / grandTotal) * 100).toFixed(1),
        startAngle: currentAngle,
        endAngle: endAngle,
        innerRadius,
        outerRadius: currentOuter,
        color
      });

      currentAngle = endAngle;
    });

    donutChartState.slices = slices;
    donutChartState.centerX = centerX;
    donutChartState.centerY = centerY;

    // Center Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText('TOTAL SALES', centerX, centerY - 6);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(formatCurrency(grandTotal), centerX, centerY + 14);

    // Populate category breakdown HTML
    elements.categoryBreakdownList.innerHTML = entries.map(([category, amount]) => {
      const pct = ((amount / grandTotal) * 100).toFixed(1);
      const color = CATEGORY_COLORS[category] || '#64748b';
      return `
        <div class="donut-item">
          <div class="donut-item-left">
            <span class="legend-dot" style="background-color: ${color};"></span>
            <span class="donut-item-name">${category}</span>
          </div>
          <div class="donut-item-right">
            <span class="donut-item-amount">${formatCurrency(amount)}</span>
            <span class="donut-item-percent">${pct}%</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Channel Bar Chart (Canvas) ---
  let channelBarState = {
    bars: [],
    hoveredIndex: -1
  };

  function renderChannelBarChart() {
    const canvas = elements.channelBarCanvas;
    if (!canvas) return;
    const container = elements.channelChartContainer;
    const rect = container.getBoundingClientRect();
    const width = rect.width || 400;
    const height = Math.max(220, rect.height || 250);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const items = getFilteredTransactions().filter(i => i.status === 'completed');

    const channelTotals = {
      'Direct Web': 0,
      'Retail Store': 0,
      'Wholesale': 0,
      'Affiliate': 0,
      'Marketplace': 0
    };

    items.forEach(item => {
      const ch = item.channel || 'Direct Web';
      if (channelTotals[ch] !== undefined) {
        channelTotals[ch] += Number(item.amount) || 0;
      } else {
        channelTotals[ch] = Number(item.amount) || 0;
      }
    });

    const channels = Object.keys(channelTotals);
    const amounts = channels.map(c => channelTotals[c]);
    const maxVal = Math.max(...amounts, 100);

    const padLeft = 60;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 40;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Draw horizontal grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 3; i++) {
      const y = padTop + (chartH / 3) * i;
      const v = maxVal - (maxVal / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.fillText('$' + Math.round(v), padLeft - 8, y + 4);
    }

    const barGroupWidth = chartW / channels.length;
    const barWidth = Math.min(36, barGroupWidth * 0.55);
    const bars = [];

    channels.forEach((channel, idx) => {
      const amt = channelTotals[channel];
      const barH = (amt / maxVal) * chartH;
      const x = padLeft + idx * barGroupWidth + (barGroupWidth - barWidth) / 2;
      const y = padTop + chartH - barH;
      const color = CHANNEL_COLORS[channel] || '#3b82f6';

      const isHovered = channelBarState.hoveredIndex === idx;

      // Rounded rectangle top
      const radius = 4;
      ctx.beginPath();
      ctx.moveTo(x, padTop + chartH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, padTop + chartH);
      ctx.closePath();

      ctx.fillStyle = isHovered ? '#1d4ed8' : color;
      ctx.fill();

      // Top label amount if there is space
      if (amt > 0) {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('$' + Math.round(amt), x + barWidth / 2, Math.max(padTop + 12, y - 6));
      }

      // X-Axis Channel Label
      ctx.fillStyle = '#475569';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      const labelText = channel.length > 9 ? channel.substring(0, 8) + '…' : channel;
      ctx.fillText(labelText, x + barWidth / 2, height - 12);

      bars.push({
        x,
        y,
        width: barWidth,
        height: barH,
        channel,
        amount: amt
      });
    });

    channelBarState.bars = bars;
  }

  // --- Top Performing Products Leaderboard ---
  function renderTopProducts() {
    const items = getFilteredTransactions().filter(i => i.status === 'completed');

    const productMap = {};
    items.forEach(item => {
      const name = item.productName || 'Unknown Product';
      if (!productMap[name]) {
        productMap[name] = {
          name,
          category: item.category || 'General',
          revenue: 0,
          units: 0
        };
      }
      productMap[name].revenue += Number(item.amount) || 0;
      productMap[name].units += Number(item.units) || 1;
    });

    const sorted = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    if (sorted.length === 0) {
      elements.topProductsList.innerHTML = '<p style="color:#64748b;font-size:13px;text-align:center;padding:20px;">No completed sales found in this period.</p>';
      return;
    }

    elements.topProductsList.innerHTML = sorted.map((p, idx) => {
      const rankClass = idx === 0 ? 'rank-badge-1' : idx === 1 ? 'rank-badge-2' : idx === 2 ? 'rank-badge-3' : '';
      return `
        <div class="product-rank-item">
          <div class="product-rank-left">
            <span class="rank-badge ${rankClass}">#${idx + 1}</span>
            <div class="product-meta">
              <div class="product-name" title="${p.name}">${p.name}</div>
              <div class="product-category-tag">${p.category}</div>
            </div>
          </div>
          <div class="product-rank-right">
            <div class="product-revenue">${formatCurrency(p.revenue)}</div>
            <div class="product-units">${formatNumber(p.units)} unit${p.units === 1 ? '' : 's'}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Table Data & Pagination ---
  function getTableData() {
    let list = [...salesData];

    // Search filter
    if (tableSearchTerm.trim()) {
      const term = tableSearchTerm.toLowerCase();
      list = list.filter(item => {
        return (
          (item.id && item.id.toLowerCase().includes(term)) ||
          (item.customerName && item.customerName.toLowerCase().includes(term)) ||
          (item.customerEmail && item.customerEmail.toLowerCase().includes(term)) ||
          (item.productName && item.productName.toLowerCase().includes(term)) ||
          (item.channel && item.channel.toLowerCase().includes(term)) ||
          (item.category && item.category.toLowerCase().includes(term))
        );
      });
    }

    // Status filter
    if (tableStatusFilter !== 'all') {
      list = list.filter(item => item.status === tableStatusFilter);
    }

    // Category filter
    if (tableCategoryFilter !== 'all') {
      list = list.filter(item => item.category === tableCategoryFilter);
    }

    // Channel filter
    if (tableChannelFilter !== 'all') {
      list = list.filter(item => item.channel === tableChannelFilter);
    }

    // Sorting
    list.sort((a, b) => {
      let valA = a[tableSortColumn];
      let valB = b[tableSortColumn];

      if (tableSortColumn === 'amount') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else if (tableSortColumn === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return tableSortAsc ? -1 : 1;
      if (valA > valB) return tableSortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }

  function renderTable() {
    const filteredList = getTableData();
    const totalCount = filteredList.length;

    elements.tableSummaryText.textContent = `Showing ${totalCount} recorded transaction${totalCount === 1 ? '' : 's'}`;

    if (totalCount === 0) {
      elements.transactionsTableBody.innerHTML = '';
      elements.tableEmptyState.style.display = 'block';
      elements.paginationInfo.textContent = 'Showing 0 of 0 entries';
      elements.paginationControls.innerHTML = '';
      return;
    }

    elements.tableEmptyState.style.display = 'none';

    // Pagination math
    const totalPages = Math.ceil(totalCount / tablePageSize);
    if (tableCurrentPage > totalPages) tableCurrentPage = totalPages;
    if (tableCurrentPage < 1) tableCurrentPage = 1;

    const startIndex = (tableCurrentPage - 1) * tablePageSize;
    const pageItems = filteredList.slice(startIndex, startIndex + tablePageSize);

    elements.transactionsTableBody.innerHTML = pageItems.map(item => {
      const statusClass = item.status === 'completed' ? 'badge-completed'
        : item.status === 'pending' ? 'badge-pending'
        : 'badge-refunded';

      return `
        <tr>
          <td>
            <span class="order-id-cell">${item.id}</span>
          </td>
          <td>
            <div class="customer-cell">
              <span class="customer-name">${item.customerName}</span>
              <span class="customer-email">${item.customerEmail}</span>
            </div>
          </td>
          <td>${formatDateDisplay(item.date)}</td>
          <td>
            <div>
              <div style="font-weight: 500; color: #0f172a;">${item.productName}</div>
              <div style="font-size: 11px; color: #64748b;">${item.category} (${item.units}x)</div>
            </div>
          </td>
          <td>
            <span class="channel-tag">${item.channel}</span>
          </td>
          <td style="text-align: right; font-weight: 600; color: #0f172a;">
            ${formatCurrency(item.amount)}
          </td>
          <td>
            <span class="badge ${statusClass}">
              <span class="badge-dot"></span>
              ${item.status}
            </span>
          </td>
          <td style="text-align: center;">
            <div class="action-btn-group" style="justify-content: center;">
              <button class="action-btn" onclick="window.editSaleRecord('${item.id}')" title="Edit sale">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
              <button class="action-btn action-btn-delete" onclick="window.deleteSaleRecord('${item.id}')" title="Delete sale">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Update pagination labels
    const endDisplay = Math.min(startIndex + tablePageSize, totalCount);
    elements.paginationInfo.textContent = `Showing ${startIndex + 1} to ${endDisplay} of ${totalCount} entries`;

    // Render pagination buttons
    let pagHtml = `
      <button class="page-btn" ${tableCurrentPage === 1 ? 'disabled' : ''} onclick="window.changeTablePage(${tableCurrentPage - 1})">
        Previous
      </button>
    `;

    for (let p = 1; p <= totalPages; p++) {
      if (totalPages > 7) {
        if (p !== 1 && p !== totalPages && Math.abs(p - tableCurrentPage) > 1) {
          if (p === 2 || p === totalPages - 1) {
            pagHtml += `<span style="padding: 0 4px; color: #94a3b8;">…</span>`;
          }
          continue;
        }
      }
      pagHtml += `
        <button class="page-btn ${p === tableCurrentPage ? 'active' : ''}" onclick="window.changeTablePage(${p})">
          ${p}
        </button>
      `;
    }

    pagHtml += `
      <button class="page-btn" ${tableCurrentPage === totalPages ? 'disabled' : ''} onclick="window.changeTablePage(${tableCurrentPage + 1})">
        Next
      </button>
    `;

    elements.paginationControls.innerHTML = pagHtml;
  }

  // --- Global Window Hooks for inline table events ---
  window.changeTablePage = function (page) {
    tableCurrentPage = page;
    renderTable();
  };

  window.editSaleRecord = function (id) {
    const item = salesData.find(s => s.id === id);
    if (!item) return;

    elements.modalTitle.textContent = `Edit Transaction ${item.id}`;
    elements.editSaleId.value = item.id;
    elements.formCustomerName.value = item.customerName;
    elements.formCustomerEmail.value = item.customerEmail;
    elements.formProductName.value = item.productName;
    elements.formCategory.value = item.category;
    elements.formChannel.value = item.channel;
    elements.formAmount.value = item.amount;
    elements.formUnits.value = item.units;
    elements.formDate.value = item.date;
    elements.formStatus.value = item.status;

    openModal();
  };

  window.deleteSaleRecord = function (id) {
    if (!confirm(`Are you sure you want to delete order ${id}? This action cannot be undone.`)) {
      return;
    }
    salesData = salesData.filter(s => s.id !== id);
    saveData();
    refreshAllDashboard();
    showToast(`Order ${id} deleted successfully`, 'info');
  };

  // --- Modal Management ---
  function openModal(isNew = false) {
    if (isNew) {
      elements.modalTitle.textContent = 'Record New Sale';
      elements.saleForm.reset();
      elements.editSaleId.value = '';
      // Default to today
      elements.formDate.value = new Date().toISOString().split('T')[0];
      elements.formUnits.value = 1;
      elements.formStatus.value = 'completed';
      elements.formCategory.value = 'Electronics';
      elements.formChannel.value = 'Direct Web';
    }
    elements.saleModal.classList.add('active');
    elements.formCustomerName.focus();
  }

  function closeModal() {
    elements.saleModal.classList.remove('active');
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const id = elements.editSaleId.value;
    const name = elements.formCustomerName.value.trim();
    const email = elements.formCustomerEmail.value.trim();
    const product = elements.formProductName.value.trim();
    const category = elements.formCategory.value;
    const channel = elements.formChannel.value;
    const amount = parseFloat(elements.formAmount.value);
    const units = parseInt(elements.formUnits.value, 10) || 1;
    const date = elements.formDate.value;
    const status = elements.formStatus.value;

    if (!name || !email || !product || isNaN(amount) || amount <= 0 || !date) {
      showToast('Please fill out all required fields with valid data.', 'error');
      return;
    }

    if (id) {
      // Editing existing record
      const idx = salesData.findIndex(s => s.id === id);
      if (idx !== -1) {
        salesData[idx] = {
          ...salesData[idx],
          customerName: name,
          customerEmail: email,
          productName: product,
          category,
          channel,
          amount,
          units,
          date,
          status,
          timestamp: new Date(date).getTime()
        };
        showToast(`Transaction ${id} updated`, 'success');
      }
    } else {
      // Adding new record
      const newId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
      const newRecord = {
        id: newId,
        customerName: name,
        customerEmail: email,
        productName: product,
        category,
        channel,
        amount,
        units,
        date,
        status,
        timestamp: new Date(date).getTime()
      };
      salesData.unshift(newRecord);
      showToast(`Sale recorded successfully as ${newId}`, 'success');
    }

    saveData();
    closeModal();
    refreshAllDashboard();
  }

  // --- Export to CSV ---
  function exportCSV() {
    const dataToExport = getFilteredTransactions();
    if (dataToExport.length === 0) {
      showToast('No transaction data to export for this timeframe.', 'info');
      return;
    }

    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Product Name', 'Category', 'Channel', 'Amount ($)', 'Units', 'Date', 'Status'];
    const rows = dataToExport.map(item => [
      `"${item.id}"`,
      `"${item.customerName.replace(/"/g, '""')}"`,
      `"${item.customerEmail.replace(/"/g, '""')}"`,
      `"${item.productName.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.channel}"`,
      item.amount,
      item.units,
      item.date,
      item.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_analytics_${currentRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${dataToExport.length} transactions to CSV`, 'success');
  }

  // --- Toast System ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;

    if (type === 'success') {
      icon = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      `;
    } else if (type === 'error') {
      icon = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `;
    }

    toast.innerHTML = `${icon}<span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // --- Interactive Canvas Tooltips ---
  function setupTrendChartHover() {
    const canvas = elements.trendChartCanvas;
    const tooltip = elements.trendChartTooltip;

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const points = trendChartState.points;

      if (!points || points.length === 0) return;

      // Find nearest point
      let closestIdx = 0;
      let minDistance = Infinity;

      points.forEach((p, idx) => {
        const dist = Math.abs(p.x - mouseX);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      if (closestIdx !== trendChartState.hoveredIndex) {
        trendChartState.hoveredIndex = closestIdx;
        renderTrendChart();
      }

      const p = points[closestIdx];
      tooltip.style.display = 'block';
      tooltip.style.left = `${p.x}px`;
      tooltip.style.top = `${p.y}px`;
      tooltip.innerHTML = `
        <div class="chart-tooltip-title">${formatDateDisplay(p.date)}</div>
        <div class="chart-tooltip-value">Revenue: ${formatCurrency(p.revenue)}</div>
        <div style="font-size: 11px; color: #a7f3d0; margin-top: 2px;">Orders: ${p.orders} completed</div>
      `;
    });

    canvas.addEventListener('mouseleave', () => {
      trendChartState.hoveredIndex = -1;
      tooltip.style.display = 'none';
      renderTrendChart();
    });
  }

  function setupDonutChartHover() {
    const canvas = elements.categoryDonutCanvas;
    const tooltip = elements.donutChartTooltip;

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const cx = donutChartState.centerX;
      const cy = donutChartState.centerY;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let angle = Math.atan2(dy, dx);
      // Normalize angle to match [-PI/2, 3PI/2]
      if (angle < -Math.PI / 2) {
        angle += Math.PI * 2;
      }

      let hovered = -1;
      const slices = donutChartState.slices;

      for (let i = 0; i < slices.length; i++) {
        const s = slices[i];
        if (dist >= s.innerRadius && dist <= s.outerRadius && angle >= s.startAngle && angle <= s.endAngle) {
          hovered = i;
          break;
        }
      }

      if (hovered !== donutChartState.hoveredIndex) {
        donutChartState.hoveredIndex = hovered;
        renderCategoryDonutChart();
      }

      if (hovered !== -1) {
        const s = slices[hovered];
        tooltip.style.display = 'block';
        tooltip.style.left = `${mouseX}px`;
        tooltip.style.top = `${mouseY}px`;
        tooltip.innerHTML = `
          <div class="chart-tooltip-title">${s.category}</div>
          <div class="chart-tooltip-value">${formatCurrency(s.amount)} (${s.percent}%)</div>
        `;
      } else {
        tooltip.style.display = 'none';
      }
    });

    canvas.addEventListener('mouseleave', () => {
      donutChartState.hoveredIndex = -1;
      tooltip.style.display = 'none';
      renderCategoryDonutChart();
    });
  }

  function setupChannelBarHover() {
    const canvas = elements.channelBarCanvas;
    const tooltip = elements.channelChartTooltip;

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let hovered = -1;
      const bars = channelBarState.bars;

      for (let i = 0; i < bars.length; i++) {
        const b = bars[i];
        if (mouseX >= b.x && mouseX <= b.x + b.width && mouseY >= b.y && mouseY <= b.y + b.height) {
          hovered = i;
          break;
        }
      }

      if (hovered !== channelBarState.hoveredIndex) {
        channelBarState.hoveredIndex = hovered;
        renderChannelBarChart();
      }

      if (hovered !== -1) {
        const b = bars[hovered];
        tooltip.style.display = 'block';
        tooltip.style.left = `${b.x + b.width / 2}px`;
        tooltip.style.top = `${b.y}px`;
        tooltip.innerHTML = `
          <div class="chart-tooltip-title">${b.channel}</div>
          <div class="chart-tooltip-value">Total: ${formatCurrency(b.amount)}</div>
        `;
      } else {
        tooltip.style.display = 'none';
      }
    });

    canvas.addEventListener('mouseleave', () => {
      channelBarState.hoveredIndex = -1;
      tooltip.style.display = 'none';
      renderChannelBarChart();
    });
  }

  // --- Master Dashboard Refresh ---
  function refreshAllDashboard() {
    updateKPIs();
    renderTrendChart();
    renderCategoryDonutChart();
    renderChannelBarChart();
    renderTopProducts();
    renderTable();
  }

  // --- Attach Event Listeners ---
  function setupEvents() {
    // Range selector buttons
    elements.dateFilterGroup.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      elements.dateFilterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRange = btn.dataset.range;
      tableCurrentPage = 1;
      refreshAllDashboard();
    });

    // Table Filters
    elements.searchInput.addEventListener('input', e => {
      tableSearchTerm = e.target.value;
      tableCurrentPage = 1;
      renderTable();
    });

    elements.statusFilter.addEventListener('change', e => {
      tableStatusFilter = e.target.value;
      tableCurrentPage = 1;
      renderTable();
    });

    elements.categoryFilter.addEventListener('change', e => {
      tableCategoryFilter = e.target.value;
      tableCurrentPage = 1;
      renderTable();
    });

    elements.channelFilter.addEventListener('change', e => {
      tableChannelFilter = e.target.value;
      tableCurrentPage = 1;
      renderTable();
    });

    // Column Sorting Headers
    elements.thOrderId.addEventListener('click', () => {
      toggleSort('id');
    });
    elements.thDate.addEventListener('click', () => {
      toggleSort('date');
    });
    elements.thAmount.addEventListener('click', () => {
      toggleSort('amount');
    });

    function toggleSort(col) {
      if (tableSortColumn === col) {
        tableSortAsc = !tableSortAsc;
      } else {
        tableSortColumn = col;
        tableSortAsc = (col === 'id');
      }
      renderTable();
    }

    // Modal controls
    elements.btnOpenAddModal.addEventListener('click', () => openModal(true));
    elements.btnCloseModal.addEventListener('click', closeModal);
    elements.btnCancelModal.addEventListener('click', closeModal);
    elements.saleForm.addEventListener('submit', handleFormSubmit);

    // Close modal on outside click
    elements.saleModal.addEventListener('click', e => {
      if (e.target === elements.saleModal) {
        closeModal();
      }
    });

    // Keyboard ESC to close modal
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && elements.saleModal.classList.contains('active')) {
        closeModal();
      }
    });

    // Export CSV
    elements.btnExportCSV.addEventListener('click', exportCSV);

    // Reset Demo Data
    const handleReset = () => {
      if (confirm('This will replace all transactions with fresh demo data. Continue?')) {
        salesData = generateSampleData();
        saveData();
        tableCurrentPage = 1;
        refreshAllDashboard();
        showToast('Demo dataset loaded successfully', 'success');
      }
    };

    elements.btnResetData.addEventListener('click', handleReset);
    elements.bannerSeedBtn.addEventListener('click', handleReset);

    // Setup Canvas Chart Hover effects
    setupTrendChartHover();
    setupDonutChartHover();
    setupChannelBarHover();

    // Window Resize Handling
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderTrendChart();
        renderCategoryDonutChart();
        renderChannelBarChart();
      }, 150);
    });
  }

  // --- Initializer ---
  function init() {
    loadData();
    setupEvents();
    refreshAllDashboard();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

