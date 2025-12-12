'use client';
import { useEffect, useState, useRef } from 'react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { supabase } from '@/lib/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Package, FileText, Eye, EyeOff, Star, Trash2, Plus, Save, X, Mail, Bell, ShoppingCart, Loader2, LogOut, Pencil, ImagePlus, Video, Tag, Power, Inbox, Send, Megaphone } from 'lucide-react';
import { allProducts, blogPosts } from '@/components/data/dummyData';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
];

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ full_name?: string; email?: string } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (session?.user) {
      setUser({ email: session.user.email || undefined, full_name: session.user.user_metadata?.full_name });
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }

  const [loginEmail, setLoginEmail] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoginLoading(true);
    setLoginError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setLoginLoading(false);
    if (error) {
      setLoginError(error.message);
      showToast('Login failed', 'error');
      return;
    }
    await checkAuth();
    showToast('Logged in', 'success');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    showToast('Logged out', 'success');
  }

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const [orderLimit, setOrderLimit] = useState(10);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderSearch, setOrderSearch] = useState('');

  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [newOrder, setNewOrder] = useState<any>({ name: '', email: '', phone: '', address: '', city: '', state: '' });
  const [newOrderItems, setNewOrderItems] = useState<any[]>([]);
  const [editingOrderId, setEditingOrderId] = useState<number | string | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [viewOrder, setViewOrder] = useState<any | null>(null);

  function addNewOrderItem() {
    setNewOrderItems((prev: any[]) => [...prev, { name: '', price: '', quantity: 1 }]);
  }

  function openEditOrder(order: any) {
    setEditingOrderId(order.id);
    setEditingOrder({
      name: order.customer_name || '',
      email: order.email || '',
      phone: order.phone || '',
      address: order.address || '',
      city: order.city || '',
      state: order.state || '',
    });
    showToast('Editing order', 'success');
  }

  function openViewOrder(order: any) {
    setViewOrder(order);
    showToast('Opening order', 'success');
  }

  function openReceiptConfirm(order: any) {
    setReceiptConfirmOrder(order);
    showToast('Open receipt dialog', 'success');
  }

  async function issueReceipt(order: any) {
    try {
      setIssuingReceiptId(order.id);
      const payload = {
        order: {
          customer_name: order.customer_name,
          email: order.email || receiptConfirmEmail,
          tracking_code: order.tracking_code,
          items: (order.items || []).map((it: any) => ({ name: it.name, quantity: Number(it.quantity || 1), price: Number(it.price || 0) })),
          total: Number(order.total || 0),
          phone: order.phone || '',
          address: order.address || '',
          city: order.city || '',
          state: order.state || '',
        }
      };
      const resp = await fetch('/api/admin/receipt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) {
        const t = await resp.text();
        console.error('Receipt error', t);
        showToast('Failed to email receipt', 'error');
      } else {
        showToast('Receipt sent', 'success');
      }
    } catch (e) {
      console.error(e);
      showToast('Error issuing receipt', 'error');
    } finally {
      setIssuingReceiptId(null);
    }
  }

  async function saveEditOrder() {
    if (!editingOrderId || !editingOrder) return;
    const updates: any = {
      customer_name: editingOrder.name || null,
      email: editingOrder.email || null,
      phone: editingOrder.phone || null,
      address: editingOrder.address || null,
      city: editingOrder.city || null,
      state: editingOrder.state || null,
    };
    const resp = await fetch('/api/admin/orders/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingOrderId, updates })
    });
    if (resp.ok) {
      setOrders((prev) => prev.map((o) => (o.id === editingOrderId ? { ...o, ...updates } : o)));
      setEditingOrderId(null);
      setEditingOrder(null);
      showToast('Order updated', 'success');
    } else {
      showToast('Failed to update order', 'error');
    }
  }

  async function deleteOrder(order: any) {
    const resp = await fetch('/api/admin/orders/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: order.id })
    });
    if (resp.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      showToast('Order deleted', 'success');
    } else {
      showToast('Failed to delete order', 'error');
    }
  }

  async function createOrderAdmin() {
    const reference = `ADM-${Date.now()}`;
    const items = newOrderItems.map((it) => ({ name: it.name, price: Number(it.price || 0), quantity: Number(it.quantity || 1) }));
    const total = items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
    const payload = {
      reference,
      customer_name: newOrder.name,
      phone: newOrder.phone || null,
      address: newOrder.address || null,
      landmark: null,
      city: newOrder.city || null,
      state: newOrder.state || null,
      items,
      total,
      email: newOrder.email || null,
    };
    const resp = await fetch('/api/orders/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (resp.ok) {
      setShowCreateOrder(false);
      setNewOrder({ name: '', email: '', phone: '', address: '', city: '', state: '' });
      setNewOrderItems([]);
      setOrderPage(1);
      showToast('Order created', 'success');
      try {
        const r = await fetch(`/api/admin/orders/list?page=1&limit=${orderLimit}`);
        const j = await r.json();
        setOrders(Array.isArray(j?.orders) ? j.orders : []);
        setOrderTotal(Number(j?.total || 0));
      } catch {}
    } else {
      showToast('Failed to create order', 'error');
    }
  }

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) return;
      setOrdersLoading(true);
      try { await fetch('/api/admin/cleanup-pending', { method: 'POST' }); } catch {}
      let arr: any[] = [];
      try {
        const resp = await fetch(`/api/admin/orders/list?page=${orderPage}&limit=${orderLimit}`);
        const json = await resp.json();
        arr = Array.isArray(json?.orders) ? json.orders : [];
        setOrderTotal(Number(json?.total || 0));
      } catch {}
      setOrders(arr);
      setOrdersLoading(false);
      try {
        const lastNotified = localStorage.getItem('mh_last_alert_order');
        const newest = arr[0];
        if (newest && settings.orderAlerts && newest.id !== lastNotified) {
          await fetch('/api/admin/new-order-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tracking_code: newest.tracking_code, total: newest.total, customer_name: newest.customer_name, created_date: newest.created_date })
          });
          localStorage.setItem('mh_last_alert_order', newest.id);
        }
        const now = Date.now();
        for (const o of arr) {
          const createdMs = new Date(o.created_date).getTime();
          const twoDays = 2 * 24 * 60 * 60 * 1000;
          if (!o.promo_sent && now - createdMs > twoDays && settings.emailNotifications && o.email) {
            await fetch('/api/admin/order-promo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: o.email, customer_name: o.customer_name, tracking_code: o.tracking_code }) });
            await supabase.from('orders').update({ promo_sent: true }).eq('id', o.id);
          }
        }
      } catch {}
    }
    loadOrders();
  }, [isAuthenticated, orderPage, orderLimit]);

  async function updateOrderStatus(order: any, newStatus: string) {
    const newHistory = [...(order.status_history || []), { status: newStatus, timestamp: new Date().toISOString(), note: `Status updated to ${newStatus}` }];
    await fetch('/api/admin/orders/update-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: order.id, status: newStatus, status_history: newHistory }) });
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus, status_history: newHistory } : o)));
    try {
      if (settings.emailNotifications && order.email) {
        await fetch('/api/admin/order-status-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: order.email, status: newStatus, tracking_code: order.tracking_code, customer_name: order.customer_name })
        });
      }
    } catch {}
    showToast(`Status updated to ${newStatus}`, 'success');
  }

  const [settings, setSettings] = useState({ showBlog: true, showShop: true, showCatering: true, showResin: true, showBeads: true, showTailor: true, emailNotifications: true, orderAlerts: true });
  const [reviewsEnabled, setReviewsEnabled] = useState<boolean>(true);
  const [settingsId, setSettingsId] = useState<number | null>(null);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadSiteSettings() {
      if (!isAuthenticated) return;
      setSettingsLoading(true);
      const { data } = await supabase.from('site_settings').select('id, allow_public_reviews, show_shop, show_blog, show_resin, show_beads, show_catering, show_tailor, email_notifications, order_alerts').limit(1);
      if (data && data.length) {
        setSettingsId(data[0].id as number);
        setReviewsEnabled(!!data[0].allow_public_reviews);
        setSettings({
          showShop: data[0].show_shop ?? true,
          showBlog: data[0].show_blog ?? true,
          showResin: data[0].show_resin ?? true,
          showBeads: data[0].show_beads ?? true,
          showCatering: data[0].show_catering ?? true,
          showTailor: data[0].show_tailor ?? true,
          emailNotifications: data[0].email_notifications ?? true,
          orderAlerts: data[0].order_alerts ?? true,
        });
      }
      setSettingsLoading(false);
    }
    loadSiteSettings();
  }, [isAuthenticated]);

  async function updateReviewsEnabled(checked: boolean) {
    setReviewsEnabled(checked);
    if (settingsId) {
      await supabase.from('site_settings').update({ allow_public_reviews: checked }).eq('id', settingsId);
    } else {
      const { data } = await supabase.from('site_settings').insert({ allow_public_reviews: checked }).select('id').limit(1);
      if (data && data.length) setSettingsId(data[0].id as number);
    }
    showToast('Reviews setting updated', 'success');
  }

  async function updateSettingFlag(key: keyof typeof settings, checked: boolean) {
    setSettings((prev) => ({ ...prev, [key]: checked }));
    const columnMap: Record<string, string> = {
      showShop: 'show_shop',
      showBlog: 'show_blog',
      showResin: 'show_resin',
      showBeads: 'show_beads',
      showCatering: 'show_catering',
      showTailor: 'show_tailor',
      emailNotifications: 'email_notifications',
      orderAlerts: 'order_alerts',
    };
    const column = columnMap[String(key)];
    if (!column) return;
    if (settingsId) {
      await supabase.from('site_settings').update({ [column]: checked } as any).eq('id', settingsId);
    } else {
      const { data } = await supabase.from('site_settings').insert({ [column]: checked } as any).select('id').limit(1);
      if (data && data.length) setSettingsId(data[0].id as number);
    }
    showToast('Setting updated', 'success');
  }

  type ProductAdmin = {
    id: number | string;
    name: string;
    price: number;
    image: string;
    category?: string;
    description?: string;
    rating?: number;
    featured?: boolean;
    visible: boolean;
    images?: string[];
    videos?: string[];
  };
  type BlogAdmin = {
    id: number | string;
    title: string;
    excerpt: string;
    image: string;
    category: string;
    date: string;
    author?: string;
    views?: number;
    likes?: number;
    hearts?: number;
    claps?: number;
    comments?: any[];
    visible: boolean;
  };

  const [products, setProducts] = useState<ProductAdmin[]>(allProducts.map((p) => ({ ...(p as any), visible: true })));
  const [blogs, setBlogs] = useState<BlogAdmin[]>(blogPosts.map((b) => ({ ...(b as any), visible: true })));
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inqPage, setInqPage] = useState(1);
  const [inqLimit, setInqLimit] = useState(10);
  const [inqTotal, setInqTotal] = useState(0);
  const [inquirySearch, setInquirySearch] = useState('');
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<any[]>([]);
  const [newsletterSearch, setNewsletterSearch] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ to: '', subject: '', html: '', attachments: [] as { name: string; url: string }[] });
  const [emailAudience, setEmailAudience] = useState<'customer' | 'newsletter'>('customer');
  const [emailContext, setEmailContext] = useState<'general' | 'voucher' | 'inquiry'>('general');
  const [showContactEmailModal, setShowContactEmailModal] = useState(false);
  const [contactEmailDraft, setContactEmailDraft] = useState({ to: '', subject: '', html: '', attachments: [] as { name: string; url: string }[] });
  const emailEditorRef = useRef<HTMLDivElement | null>(null);
  const [viewInquiry, setViewInquiry] = useState<any | null>(null);
  const [editingBlogId, setEditingBlogId] = useState<number | string | null>(null);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [issuingReceiptId, setIssuingReceiptId] = useState<number | string | null>(null);
  const [receiptToast, setReceiptToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [receiptConfirmOrder, setReceiptConfirmOrder] = useState<any | null>(null);
  const [receiptConfirmEmail, setReceiptConfirmEmail] = useState<string>('');
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showAddVoucher, setShowAddVoucher] = useState(false);
  const [newVoucher, setNewVoucher] = useState({ code: '', discount_type: 'percent', discount_value: '', min_order_amount: '', start_date: '', end_date: '', usage_limit: '', active: true, first_time_only: false, single_use_per_customer: false, applicable_categories: '', max_discount: '', note: '' });
  const [editingVoucherId, setEditingVoucherId] = useState<number | string | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<any | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddBlog, setShowAddBlog] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Resin Works', description: '', image: '', featured: false, ready_made: true, lead_time_value: '', lead_time_unit: 'days' });
  const [newBlog, setNewBlog] = useState({ title: '', excerpt: '', category: 'Behind the Scenes', image: '', author: 'Sarah Hannie' });
  const [productSearch, setProductSearch] = useState('');
  const [blogSearch, setBlogSearch] = useState('');
  const [voucherSearch, setVoucherSearch] = useState('');

  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; message: string; onConfirm: () => void } | null>(null);
  function openConfirm(message: string, onConfirm: () => void) {
    setConfirmDialog({ open: true, message, onConfirm });
  }

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setReceiptToast({ type, message });
    setTimeout(() => setReceiptToast(null), 3000);
  }

  const [contactInfo, setContactInfo] = useState<any>({ address: '', phone: '', email: '', site_url: '', instagram_url: '', facebook_url: '', twitter_url: '' });
  const [contactLoaded, setContactLoaded] = useState(false);
  const [hours, setHours] = useState<any[]>([]);
  const [hoursLoaded, setHoursLoaded] = useState(false);
  const [editingHourId, setEditingHourId] = useState<number | string | null>(null);
  const [editingHour, setEditingHour] = useState<any | null>(null);
  const [contactSaving, setContactSaving] = useState(false);
  const [businessHourSaving, setBusinessHourSaving] = useState(false);
  const [addProductSaving, setAddProductSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [uploadingCoverNew, setUploadingCoverNew] = useState(false);
  const [uploadingImagesNew, setUploadingImagesNew] = useState(false);
  const [uploadingVideosNew, setUploadingVideosNew] = useState(false);

  async function toggleProductVisibility(id: number | string) {
    const target = products.find((p) => String(p.id) === String(id));
    if (!target) return;
    const newHidden = !!target.visible;
    await supabase.from('products').update({ hidden: newHidden }).eq('id', id as any);
    setProducts((prev) => prev.map((p) => (String(p.id) === String(id) ? { ...p, visible: !p.visible } : p)));
  }

  async function toggleProductFeatured(id: number | string) {
    const target = products.find((p) => String(p.id) === String(id));
    if (!target) return;
    await supabase.from('products').update({ featured: !target.featured }).eq('id', id as any);
    setProducts((prev) => prev.map((p) => (String(p.id) === String(id) ? { ...p, featured: !p.featured } : p)));
  }

  async function deleteProduct(prod: any) {
    try {
      const resp = await fetch('/api/admin/delete-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prod?.id ?? null, name: prod?.name ?? '' })
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error('Delete failed', t);
        showToast('Failed to delete product', 'error');
      } else {
        setProducts((prev) => prev.filter((p) => String(p.id) !== String(prod?.id) && String(p.name) !== String(prod?.name)));
        showToast('Product deleted', 'success');
      }
    } catch (e) {
      console.error(e);
      showToast('Error deleting product', 'error');
    }
  }

  async function addProduct() {
    const priceNum = parseFloat(newProduct.price);
    if (!newProduct.name || isNaN(priceNum)) return;
    const payload = {
      name: newProduct.name,
      price: priceNum,
      image: newProduct.image || '',
      category: newProduct.category,
      description: newProduct.description || '',
      featured: newProduct.featured || false,
      images: (newProduct as any).images || [],
      videos: (newProduct as any).videos || [],
      ready_made: !!(newProduct as any).ready_made,
      lead_time_value: (newProduct as any).lead_time_value ? Number((newProduct as any).lead_time_value) : null,
      lead_time_unit: (newProduct as any).lead_time_value ? String((newProduct as any).lead_time_unit || 'days') : null,
    } as any;
    setAddProductSaving(true);
    const { data, error } = await supabase.from('products').insert(payload).select('*').limit(1);
    if (!error) {
      const inserted = data && data[0] ? data[0] : { id: `new_${Date.now()}`, ...payload };
      setProducts((prev) => [...prev, { ...(inserted as any), visible: true }]);
      setNewProduct({ name: '', price: '', category: 'Resin Works', description: '', image: '', featured: false, ready_made: true, lead_time_value: '', lead_time_unit: 'days' });
      setShowAddProduct(false);
      showToast('Product added', 'success');
    } else {
      showToast('Failed to add product', 'error');
    }
    setAddProductSaving(false);
  }

  const [editingProductId, setEditingProductId] = useState<number | string | null>(null);
  const [editingData, setEditingData] = useState<any | null>(null);
  const [uploadingCoverEdit, setUploadingCoverEdit] = useState(false);
  const [uploadingImagesEdit, setUploadingImagesEdit] = useState(false);
  const [uploadingVideosEdit, setUploadingVideosEdit] = useState(false);

  function openEditProduct(p: ProductAdmin) {
    setEditingProductId(p.id);
    setEditingData({
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category || 'Resin Works',
      description: p.description || '',
      featured: !!p.featured,
      images: p.images || [],
      videos: p.videos || [],
      ready_made: (p as any).ready_made ?? true,
      lead_time_value: (p as any).lead_time_value ?? '',
      lead_time_unit: (p as any).lead_time_unit ?? 'days',
    });
  }

  async function saveEditProduct() {
    if (!editingProductId || !editingData) return;
    const payload: any = {
      name: editingData.name,
      price: Number(editingData.price) || 0,
      image: editingData.image || '',
      category: editingData.category,
      description: editingData.description || '',
      featured: !!editingData.featured,
      images: Array.isArray(editingData.images) ? editingData.images : [],
      videos: Array.isArray(editingData.videos) ? editingData.videos : [],
      ready_made: !!(editingData as any).ready_made,
      lead_time_value: (editingData as any).lead_time_value ? Number((editingData as any).lead_time_value) : null,
      lead_time_unit: (editingData as any).lead_time_value ? String((editingData as any).lead_time_unit || 'days') : null,
    };
    setEditSaving(true);
    await supabase.from('products').update(payload).eq('id', Number(editingProductId));
    setProducts((prev) => prev.map((p) => (p.id === editingProductId ? { ...p, ...payload } : p)));
    setEditingProductId(null);
    setEditingData(null);
    setEditSaving(false);
    showToast('Product updated', 'success');
  }

  function cancelEditProduct() {
    setEditingProductId(null);
    setEditingData(null);
  }

  async function uploadFile(file: File, folder: string) {
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      fd.append('bucket', 'Images');
      const res = await fetch('/api/storage/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) { showToast(String(json?.error || 'Upload failed'), 'error'); return ''; }
      showToast('Upload complete', 'success');
      return String(json.url || '');
    } catch { return ''; }
  }

  async function handleUploadCoverNew(e: any) {
    const f = e.target.files && (e.target.files[0] as File);
    if (!f) return;
    setUploadingCoverNew(true);
    const url = await uploadFile(f, 'products');
    if (url) setNewProduct((np) => ({ ...np, image: url }));
    setUploadingCoverNew(false);
    e.target.value = '';
  }

  async function handleUploadImagesNew(e: any) {
    const files = e.target.files ? (Array.from(e.target.files as FileList) as File[]) : [];
    if (!files.length) return;
    setUploadingImagesNew(true);
    const uploaded: string[] = [];
    for (const file of files) {
      const url = await uploadFile(file, 'products');
      if (url) uploaded.push(url);
    }
    setNewProduct((np) => ({ ...(np as any), images: [ ...((np as any).images || []), ...uploaded ] }));
    setUploadingImagesNew(false);
    e.target.value = '';
  }

  async function handleUploadVideosNew(e: any) {
    const files = e.target.files ? (Array.from(e.target.files as FileList) as File[]) : [];
    if (!files.length) return;
    setUploadingVideosNew(true);
    const uploaded: string[] = [];
    for (const file of files) {
      const url = await uploadFile(file, 'products');
      if (url) uploaded.push(url);
    }
    setNewProduct((np) => ({ ...(np as any), videos: [ ...((np as any).videos || []), ...uploaded ] }));
    setUploadingVideosNew(false);
    e.target.value = '';
  }

  async function handleUploadCoverEdit(e: any) {
    const f = e.target.files && (e.target.files[0] as File);
    if (!f) return;
    setUploadingCoverEdit(true);
    const url = await uploadFile(f, 'products');
    if (url) setEditingData((ed: any) => ({ ...(ed || {}), image: url }));
    setUploadingCoverEdit(false);
    e.target.value = '';
  }

  async function handleUploadImagesEdit(e: any) {
    const files = e.target.files ? (Array.from(e.target.files as FileList) as File[]) : [];
    if (!files.length) return;
    setUploadingImagesEdit(true);
    const uploaded: string[] = [];
    for (const file of files) {
      const url = await uploadFile(file, 'products');
      if (url) uploaded.push(url);
    }
    setEditingData((ed: any) => ({ ...(ed || {}), images: [ ...(Array.isArray(ed?.images) ? ed.images : []), ...uploaded ] }));
    setUploadingImagesEdit(false);
    e.target.value = '';
  }

  async function handleUploadVideosEdit(e: any) {
    const files = e.target.files ? (Array.from(e.target.files as FileList) as File[]) : [];
    if (!files.length) return;
    setUploadingVideosEdit(true);
    const uploaded: string[] = [];
    for (const file of files) {
      const url = await uploadFile(file, 'products');
      if (url) uploaded.push(url);
    }
    setEditingData((ed: any) => ({ ...(ed || {}), videos: [ ...(Array.isArray(ed?.videos) ? ed.videos : []), ...uploaded ] }));
    setUploadingVideosEdit(false);
    e.target.value = '';
  }

function toggleBlogVisibility(id: number | string) {
  setBlogs((prev) => prev.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)));
  showToast('Blog visibility updated', 'success');
}

async function deleteBlog(id: number | string) {
  try { await supabase.from('blog_posts').delete().eq('id', id); } catch {}
  setBlogs((prev) => prev.filter((b) => b.id !== id));
  showToast('Blog deleted', 'success');
}

async function addBlog() {
  if (!newBlog.title || !newBlog.excerpt) return;
  const payload: any = { title: newBlog.title, excerpt: newBlog.excerpt, category: newBlog.category || null, image: newBlog.image || null, author: newBlog.author || null, date: new Date().toLocaleDateString(), comments: [] };
  const { data } = await supabase.from('blog_posts').insert(payload).select('*').limit(1);
  const inserted = data && data[0] ? data[0] : { ...payload, id: `blog_${Date.now()}` };
  setBlogs((prev) => [...prev, { ...(inserted as any), visible: true }]);
  setNewBlog({ title: '', excerpt: '', category: 'Behind the Scenes', image: '', author: 'Sarah Hannie' });
  setShowAddBlog(false);
}

  useEffect(() => {
    async function loadContact() {
      if (!isAuthenticated) return;
      const { data: c } = await supabase.from('contact_info').select('*').order('updated_at', { ascending: false }).limit(1);
      setContactInfo(c && c[0] ? c[0] : { address: '', phone: '', email: '', site_url: '', instagram_url: '', facebook_url: '', twitter_url: '' });
      setContactLoaded(true);
      const { data: h } = await supabase.from('business_hours').select('*').order('display_order', { ascending: true });
      setHours(h || []);
      setHoursLoaded(true);
    }
    loadContact();
  }, [isAuthenticated]);

  useEffect(() => {
    async function loadProducts() {
      if (!isAuthenticated) return;
      const { data } = await supabase.from('products').select('*').order('id', { ascending: true });
      const rows = data || [];
      setProducts(rows.map((p: any) => ({ ...(p as any), visible: true })));
    }
    loadProducts();
  }, [isAuthenticated]);

  useEffect(() => {
    async function loadVouchers() {
      if (!isAuthenticated) return;
      const { data } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false });
      setVouchers(data || []);
    }
    loadVouchers();
  }, [isAuthenticated]);

  useEffect(() => {
    async function loadBlogs() {
      if (!isAuthenticated) return;
      const { data } = await supabase.from('blog_posts').select('*').order('id', { ascending: true });
      const rows = data || [];
      setBlogs(rows.map((b: any) => ({ ...(b as any), visible: true })));
    }
    loadBlogs();
  }, [isAuthenticated]);

  useEffect(() => {
    async function loadInquiries() {
      if (!isAuthenticated) return;
      setInquiriesLoading(true);
      const from = (inqPage - 1) * inqLimit;
      const to = from + inqLimit - 1;
      const { data, count } = await supabase
        .from('catering_inquiries')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      setInquiries(data || []);
      setInqTotal(Number(count || 0));
      setInquiriesLoading(false);
    }
    loadInquiries();
  }, [isAuthenticated, inqPage, inqLimit]);

  useEffect(() => {
    async function loadNewsletter() {
      if (!isAuthenticated) return;
      try {
        const { data } = await supabase.from('newsletter_subscriptions').select('*').order('created_at', { ascending: false });
        setNewsletterSubscribers(data || []);
      } catch {}
    }
    loadNewsletter();
  }, [isAuthenticated]);

  async function saveContactInfoAdmin() {
    setContactSaving(true);
    const payload = {
      address: contactInfo.address || '',
      phone: contactInfo.phone || '',
      email: contactInfo.email || '',
      site_url: contactInfo.site_url || '',
      instagram_url: contactInfo.instagram_url || '',
      facebook_url: contactInfo.facebook_url || '',
      twitter_url: contactInfo.twitter_url || '',
    };
    if (contactInfo.id) {
      await supabase.from('contact_info').update(payload).eq('id', contactInfo.id);
    } else {
      const { data } = await supabase.from('contact_info').insert(payload).select('*').limit(1);
      if (data && data[0]) setContactInfo(data[0]);
    }
    setContactSaving(false);
    showToast('Contact info saved', 'success');
  }

  async function addVoucher() {
    const payload: any = {
      code: newVoucher.code.trim(),
      discount_type: newVoucher.discount_type,
      discount_value: Number(newVoucher.discount_value) || 0,
      min_order_amount: newVoucher.min_order_amount ? Number(newVoucher.min_order_amount) : null,
      start_date: newVoucher.start_date || null,
      end_date: newVoucher.end_date || null,
      usage_limit: newVoucher.usage_limit ? Number(newVoucher.usage_limit) : null,
      active: !!newVoucher.active,
      first_time_only: !!newVoucher.first_time_only,
      single_use_per_customer: !!newVoucher.single_use_per_customer,
      applicable_categories: newVoucher.applicable_categories ? newVoucher.applicable_categories.split(',').map((s) => s.trim()).filter(Boolean) : null,
      max_discount: newVoucher.max_discount ? Number(newVoucher.max_discount) : null,
      note: newVoucher.note || null,
    };
    if (!payload.code || !payload.discount_value) return;
    const { data, error } = await supabase.from('vouchers').insert(payload).select('*').limit(1);
    if (!error) {
      const inserted = data && data[0] ? data[0] : payload;
      setVouchers((prev) => [inserted, ...prev]);
      setShowAddVoucher(false);
      setNewVoucher({ code: '', discount_type: 'percent', discount_value: '', min_order_amount: '', start_date: '', end_date: '', usage_limit: '', active: true, first_time_only: false, single_use_per_customer: false, applicable_categories: '', max_discount: '', note: '' });
      showToast('Voucher added', 'success');
    } else {
      showToast('Failed to add voucher', 'error');
    }
  }

  async function toggleVoucherActive(v: any) {
    const next = !v.active;
    const { data, error } = await supabase.from('vouchers').update({ active: next }).eq('id', v.id).select('*').limit(1);
    if (!error) {
      const updated = data && data[0] ? data[0] : { ...v, active: next };
      setVouchers((prev) => prev.map((x) => (x.id === v.id ? updated : x)));
      showToast(next ? 'Voucher activated' : 'Voucher deactivated', 'success');
    }
  }

  function openEditVoucher(v: any) {
    setEditingVoucherId(v.id);
    setEditingVoucher({
      code: v.code,
      discount_type: v.discount_type,
      discount_value: v.discount_value,
      min_order_amount: v.min_order_amount || '',
      start_date: v.start_date ? String(v.start_date).slice(0, 10) : '',
      end_date: v.end_date ? String(v.end_date).slice(0, 10) : '',
      usage_limit: v.usage_limit || '',
      active: !!v.active,
      first_time_only: !!v.first_time_only,
      single_use_per_customer: !!v.single_use_per_customer,
      applicable_categories: Array.isArray(v.applicable_categories) ? v.applicable_categories.join(', ') : '',
      max_discount: v.max_discount || '',
      note: v.note || '',
    });
  }

  async function saveEditVoucher() {
    if (!editingVoucherId || !editingVoucher) return;
    const payload: any = {
      code: editingVoucher.code.trim(),
      discount_type: editingVoucher.discount_type,
      discount_value: Number(editingVoucher.discount_value) || 0,
      min_order_amount: editingVoucher.min_order_amount ? Number(editingVoucher.min_order_amount) : null,
      start_date: editingVoucher.start_date || null,
      end_date: editingVoucher.end_date || null,
      usage_limit: editingVoucher.usage_limit ? Number(editingVoucher.usage_limit) : null,
      active: !!editingVoucher.active,
      first_time_only: !!editingVoucher.first_time_only,
      single_use_per_customer: !!editingVoucher.single_use_per_customer,
      applicable_categories: editingVoucher.applicable_categories ? editingVoucher.applicable_categories.split(',').map((s: string) => s.trim()).filter(Boolean) : null,
      max_discount: editingVoucher.max_discount ? Number(editingVoucher.max_discount) : null,
      note: editingVoucher.note || null,
    };
    const { error } = await supabase.from('vouchers').update(payload).eq('id', editingVoucherId);
    if (!error) {
      setVouchers((prev) => prev.map((x) => (x.id === editingVoucherId ? { ...x, ...payload } : x)));
      setEditingVoucherId(null);
      setEditingVoucher(null);
      showToast('Voucher updated', 'success');
    } else {
      showToast('Failed to update voucher', 'error');
    }
  }

  async function deleteVoucher(v: any) {
    const { error } = await supabase.from('vouchers').delete().eq('id', v.id);
    if (!error) {
      setVouchers((prev) => prev.filter((x) => x.id !== v.id));
      showToast('Voucher deleted', 'success');
    }
  }

async function deleteInquiryRow(q: any) {
  await supabase.from('catering_inquiries').delete().eq('id', q.id);
  setInquiries((prev) => prev.filter((x) => x.id !== q.id));
  showToast('Inquiry deleted', 'success');
}

  function editBusinessHour(id: number | string) {
    const h = hours.find((x) => x.id === id);
    if (!h) return;
    setEditingHourId(id);
    setEditingHour({ ...h });
  }

  async function saveBusinessHour() {
    if (!editingHour) return;
    setBusinessHourSaving(true);
    await supabase
      .from('business_hours')
      .update({ open_time: editingHour.open_time, close_time: editingHour.close_time, closed: editingHour.closed })
      .eq('id', editingHour.id);
    setHours((prev) => prev.map((h) => (h.id === editingHour.id ? { ...h, open_time: editingHour.open_time, close_time: editingHour.close_time, closed: editingHour.closed } : h)));
    setEditingHourId(null);
    setEditingHour(null);
    setBusinessHourSaving(false);
    showToast('Business hours updated', 'success');
  }

  function cancelEditBusinessHour() {
    setEditingHourId(null);
    setEditingHour(null);
  }

  if (isLoading) {
    return (
      <div className="pt-[50px] pb-[50px] sm:pt-24 sm:pb-20 min-h-screen bg-[#F7F3EC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-[50px] pb-[50px] sm:pt-24 sm:pb-20 min-h-screen bg-[#F7F3EC] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif">Admin Login</CardTitle>
            <p className="text-black/60 mt-2">Sign in with email and password</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="email" placeholder="admin@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              <Input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              <Button type="submit" disabled={loginLoading} className="w-full bg-[#D4AF37] hover:bg-[#C4A030] text-white">
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
              </Button>
            </form>
            {loginError && <p className="text-xs text-red-600 mt-3">{loginError}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (<>
    <div className="pt-[50px] pb-[50px] sm:pt-24 sm:pb-20 min-h-screen bg-[#F7F3EC]">
      <div className="max-w-7xl mx-auto px-4">
        {receiptToast && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg ${receiptToast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {receiptToast.message}
          </div>
        )}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-black">Admin Panel</h1>
            <p className="text-black/60 mt-2">Welcome, {user?.full_name || user?.email}</p>
          </div>
          <Button onClick={handleLogout} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl -mx-4 px-4 flex flex-wrap gap-2">
            <TabsTrigger value="orders" className="rounded-lg shrink-0 whitespace-nowrap data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
              <ShoppingCart className="w-4 h-4 mr-2" /> Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg shrink-0 whitespace-nowrap data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" /> Products
            </TabsTrigger>
            <TabsTrigger value="blog" className="rounded-lg shrink-0 whitespace-nowrap data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" /> Blog
            </TabsTrigger>
            <TabsTrigger value="contact" className="rounded-lg shrink-0 whitespace-nowrap data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" /> Contact
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-lg shrink-0 whitespace-nowrap data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
              <Inbox className="w-4 h-4 mr-2" /> Inquiries
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="rounded-lg shrink-0 whitespace-nowrap data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
              <Megaphone className="w-4 h-4 mr-2" /> Newsletter
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="rounded-lg shrink-0 whitespace-nowrap data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
              <Tag className="w-4 h-4 mr-2" /> Vouchers
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg shrink-0 whitespace-nowrap data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
      <CardHeader className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
        <CardTitle>Order Management</CardTitle>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <Input className="w-full sm:w-64" placeholder="Search orders" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
          <div className="hidden md:block">
            <Select value={String(orderLimit)} onValueChange={(v) => setOrderLimit(Number(v))}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowCreateOrder(true)} className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#C4A030] text-white"><Plus className="w-4 h-4 mr-2" /> Create Order</Button>
        </div>
      </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-black/60">No orders yet</div>
                ) : (
                  <>
                    <div className="space-y-4">
                    {orders.filter((order) => {
                      const q = orderSearch.toLowerCase().trim();
                      if (!q) return true;
                      const fields = [order.customer_name, order.tracking_code, order.phone, order.email, order.address, order.city, order.state];
                      return fields.some((v: any) => String(v || '').toLowerCase().includes(q));
                    }).map((order) => (
                        <div key={order.id} className={cn('p-4 bg-white rounded-xl border', order.status === 'pending' ? 'border-yellow-300 bg-yellow-50' : '')}>
                          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div>
                              <p className="font-mono text-sm text-[#D4AF37] font-bold">{order.tracking_code}</p>
                              <p className="font-medium text-black">{order.customer_name}</p>
                              <p className="text-sm text-black/60">{order.phone}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-black">₦{order.total?.toLocaleString()}</p>
                              <p className="text-xs text-black/50">{new Date(order.created_date).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="mb-4 p-3 bg-[#F7F3EC] rounded-lg text-sm">
                            <p className="text-black/70">
                              {order.address}, {order.landmark && `${order.landmark}, `}
                              {order.city}, {order.state}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                              {order.items?.slice(0, 2).map((item: any, i: number) => (
                                <img key={i} src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                              ))}
                              {order.items?.length > 2 && (
                                <span className="w-10 h-10 rounded bg-[#E5DCC5] flex items-center justify-center text-xs font-medium">+{order.items.length - 2}</span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {order.status === 'pending' && <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>}
                            </div>
                            <Select value={order.status} onValueChange={(value) => updateOrderStatus(order, value)}>
                              <SelectTrigger className="w-44">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    <span className={cn('px-2 py-0.5 rounded text-xs', status.color)}>{status.label}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap items-center gap-2">
                              <button onClick={() => openViewOrder(order)} className="p-2 rounded-lg hover:bg-gray-100"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => openEditOrder(order)} className="p-2 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => openReceiptConfirm(order)} disabled={issuingReceiptId === order.id} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                                {issuingReceiptId === order.id ? (<Loader2 className="w-4 h-4 animate-spin" />) : (<FileText className="w-4 h-4" />)}
                              </button>
                              <button onClick={() => openConfirm(`Delete order ${order.tracking_code}?`, () => deleteOrder(order))} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="hidden md:flex items-center justify-between pt-4">
                      <p className="text-sm text-black/60">Page {orderPage} of {Math.max(1, Math.ceil(orderTotal / orderLimit))}</p>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => setOrderPage((p) => Math.max(1, p - 1))} variant="outline">Prev</Button>
                        <Button onClick={() => setOrderPage((p) => (p * orderLimit < orderTotal ? p + 1 : p))} variant="outline">Next</Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {showEmailModal && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg max-h-[85vh] overflow-y-auto">
                <h3 className="text-xl font-semibold text-black mb-4">Send Email</h3>
                <Select value={emailAudience} onValueChange={(v) => {
                  setEmailAudience(v as 'customer' | 'newsletter');
                  if (v === 'newsletter') {
                    setEmailDraft((d) => ({ ...d, to: '' }));
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
                {emailAudience === 'customer' && emailContext !== 'voucher' && (
                  <div className="mt-3 mb-3">
                    <Select value={emailDraft.to} onValueChange={(v) => setEmailDraft({ ...emailDraft, to: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Array.from(new Map((orders || []).filter((o: any) => !!o.email).map((o: any) => [String(o.email), { email: String(o.email), name: String(o.customer_name || '') }])).values())).map((c: any) => (
                          <SelectItem key={c.email} value={c.email}>{c.name ? `${c.name} · ${c.email}` : c.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Or type email" value={emailDraft.to} onChange={(e) => setEmailDraft({ ...emailDraft, to: e.target.value })} className="mt-2" />
                  </div>
                )}
                <Input placeholder="Subject" value={emailDraft.subject} onChange={(e) => setEmailDraft({ ...emailDraft, subject: e.target.value })} className="mb-3" />
                <div className="mb-3">
                  <RichTextEditor value={emailDraft.html} onChange={(html) => setEmailDraft({ ...emailDraft, html })} />
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-black">Attachments</p>
                    <input type="file" multiple onChange={async (e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      if (!files.length) return;
                      const uploaded: { name: string; url: string }[] = [];
                      for (const f of files) {
                        const url = await uploadFile(f as File, 'attachments');
                        if (url) uploaded.push({ name: (f as File).name, url });
                      }
                      setEmailDraft((d) => ({ ...d, attachments: [...d.attachments, ...uploaded] }));
                      e.target.value = '' as any;
                    }} />
                  </div>
                  {emailDraft.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {emailDraft.attachments.map((a, idx) => (
                        <div key={idx} className="px-3 py-1 rounded-full bg-[#E5DCC5] text-sm text-black flex items-center gap-2">
                          <a href={a.url} target="_blank" rel="noreferrer" className="underline">{a.name}</a>
                          <button onClick={() => setEmailDraft((d) => ({ ...d, attachments: d.attachments.filter((_, i) => i !== idx) }))} className="p-1 rounded hover:bg-black/10">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <Button onClick={sendInquiryEmail} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"><Send className="w-4 h-4 mr-2" /> Send</Button>
                  <Button onClick={() => setShowEmailModal(false)} className="w-full sm:w-auto bg-black hover:bg-black/90 text-white"><X className="w-4 h-4 mr-2" /> Cancel</Button>
                </div>
              </div>
            </div>
          )}
          {showContactEmailModal && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg max-h-[85vh] overflow-y-auto">
                <h3 className="text-xl font-semibold text-black mb-4">Email Subscriber</h3>
                <Input placeholder="To" value={contactEmailDraft.to} onChange={(e) => setContactEmailDraft({ ...contactEmailDraft, to: e.target.value })} className="mb-3" />
                <Input placeholder="Subject" value={contactEmailDraft.subject} onChange={(e) => setContactEmailDraft({ ...contactEmailDraft, subject: e.target.value })} className="mb-3" />
                <div className="mb-3">
                  <RichTextEditor value={contactEmailDraft.html} onChange={(html) => setContactEmailDraft({ ...contactEmailDraft, html })} />
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-black">Attachments</p>
                    <input type="file" multiple onChange={async (e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      if (!files.length) return;
                      const uploaded: { name: string; url: string }[] = [];
                      for (const f of files) {
                        const url = await uploadFile(f as File, 'attachments');
                        if (url) uploaded.push({ name: (f as File).name, url });
                      }
                      setContactEmailDraft((d) => ({ ...d, attachments: [...d.attachments, ...uploaded] }));
                      e.target.value = '' as any;
                    }} />
                  </div>
                  {contactEmailDraft.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {contactEmailDraft.attachments.map((a, idx) => (
                        <div key={idx} className="px-3 py-1 rounded-full bg-[#E5DCC5] text-sm text-black flex items-center gap-2">
                          <a href={a.url} target="_blank" rel="noreferrer" className="underline">{a.name}</a>
                          <button onClick={() => setContactEmailDraft((d) => ({ ...d, attachments: d.attachments.filter((_, i) => i !== idx) }))} className="p-1 rounded hover:bg-black/10">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <Button onClick={sendContactEmail} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"><Send className="w-4 h-4 mr-2" /> Send</Button>
                  <Button onClick={() => setShowContactEmailModal(false)} className="w-full sm:w-auto bg-black hover:bg-black/90 text-white"><X className="w-4 h-4 mr-2" /> Cancel</Button>
                </div>
              </div>
            </div>
          )}
          {viewInquiry && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg max-h-[85vh] overflow-y-auto">
                <h3 className="text-xl font-semibold text-black mb-4">Inquiry Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {viewInquiry.name}</p>
                  <p><span className="font-medium">Email:</span> {viewInquiry.email}</p>
                  <p><span className="font-medium">Phone:</span> {viewInquiry.phone || '-'}</p>
                  <p><span className="font-medium">Event Type:</span> {viewInquiry.event_type || '-'}</p>
                  <p><span className="font-medium">Guests:</span> {viewInquiry.guests || '-'}</p>
                  <p><span className="font-medium">Event Date:</span> {viewInquiry.event_date || '-'}</p>
                  <p><span className="font-medium">Message:</span> {viewInquiry.message || '-'}</p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button onClick={() => setViewInquiry(null)} className="bg-black hover:bg-black/90 text-white"><X className="w-4 h-4 mr-2" /> Close</Button>
                </div>
              </div>
            </div>
          )}
          <TabsContent value="inquiries">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
                <CardTitle>Catering Inquiries</CardTitle>
                <Input className="w-full sm:w-64" placeholder="Search inquiries" value={inquirySearch} onChange={(e) => setInquirySearch(e.target.value)} />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inquiriesLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" /></div>
                  ) : inquiries.length === 0 ? (
                    <div className="text-center py-8 text-black/60">No inquiries yet</div>
                  ) : (
                    inquiries.filter((q) => {
                      const s = inquirySearch.toLowerCase().trim();
                      if (!s) return true;
                      const fields = [q.name, q.email, q.event_type, q.message];
                      return fields.some((val: any) => String(val || '').toLowerCase().includes(s));
                    }).map((q) => (
                      <div key={q.id} className="p-4 bg-white rounded-xl border flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-black">{q.name}</p>
                          <p className="text-sm text-black/60">{q.email} · {q.event_type || 'Event'} · {q.guests || '-'} guests</p>
                          <p className="text-xs text-black/50">{q.created_at ? new Date(q.created_at).toLocaleString() : ''}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openViewInquiry(q)} className="p-2 rounded-lg hover:bg-gray-100"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => openEmailModal(q)} className="p-2 rounded-lg hover:bg-gray-100"><Send className="w-4 h-4" /></button>
                          <button onClick={() => openConfirm(`Delete inquiry from ${q.name}?`, () => deleteInquiryRow(q))} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-black/60">Page {inqPage} of {Math.max(1, Math.ceil(inqTotal / inqLimit))}</p>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setInqPage((p) => Math.max(1, p - 1))} variant="outline">Prev</Button>
                  <Button onClick={() => setInqPage((p) => (p * inqLimit < inqTotal ? p + 1 : p))} className="bg-black hover:bg-black/90 text-white">Next</Button>
                </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="newsletter">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
                <CardTitle>Newsletter Subscribers</CardTitle>
                <div className="flex items-center gap-2">
                  <Input className="w-64" placeholder="Search subscribers" value={newsletterSearch} onChange={(e) => setNewsletterSearch(e.target.value)} />
                  <Button onClick={() => {
                    setEmailContext('general');
                    setEmailAudience('newsletter');
                    setEmailDraft({ to: '', subject: 'Updates from Maison Hannie', html: '<p>Hi there,</p><p>Here are our latest updates and offers.</p><p>Warm regards,<br/>Maison Hannie</p>', attachments: [] });
                    setShowEmailModal(true);
                  }} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white">
                    <Send className="w-4 h-4 mr-2" /> Bulk Email
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {newsletterSubscribers.length === 0 ? (
                  <div className="p-4 bg-white rounded-xl border">No subscribers</div>
                ) : (
                  <div className="space-y-3">
                    {newsletterSubscribers.filter((s: any) => {
                      const q = newsletterSearch.toLowerCase().trim();
                      if (!q) return true;
                      const fields = [s.email, s.name];
                      return fields.some((val: any) => String(val || '').toLowerCase().includes(q));
                    }).map((s: any) => (
                      <div key={s.id || s.email} className="p-4 bg-white rounded-xl border flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-black">{s.email}</p>
                          <p className="text-sm text-black/60">{s.name || '-'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => {
                            const nm = String(s.name || '').trim();
                            setContactEmailDraft({
                              to: String(s.email || ''),
                              subject: nm ? `Hello ${nm}` : 'Hello from Maison Hannie',
                              html: nm ? `<p>Hi ${nm},</p><p>Thanks for subscribing!</p>` : '<p>Hi,</p><p>Thanks for subscribing!</p>',
                              attachments: []
                            });
                            setShowContactEmailModal(true);
                          }} className="p-2 rounded-lg hover:bg-gray-100"><Mail className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
  {editingOrderId && editingOrder && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg max-h-[85vh] overflow-y-auto">
                <h3 className="text-xl font-semibold text-black mb-4">Edit Order</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <Input placeholder="Customer name" value={editingOrder.name} onChange={(e) => setEditingOrder({ ...editingOrder, name: e.target.value })} />
                  <Input placeholder="Email" value={editingOrder.email} onChange={(e) => setEditingOrder({ ...editingOrder, email: e.target.value })} />
                  <Input placeholder="Phone" value={editingOrder.phone} onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })} />
                  <Input placeholder="Address" value={editingOrder.address} onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })} />
                  <Input placeholder="City" value={editingOrder.city} onChange={(e) => setEditingOrder({ ...editingOrder, city: e.target.value })} />
                  <Input placeholder="State" value={editingOrder.state} onChange={(e) => setEditingOrder({ ...editingOrder, state: e.target.value })} />
                </div>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <Button onClick={saveEditOrder} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"><Save className="w-4 h-4 mr-2" /> Save</Button>
                  <Button onClick={() => { setEditingOrderId(null); setEditingOrder(null); }} className="w-full sm:w-auto bg-black hover:bg-black/90 text-white"><X className="w-4 h-4 mr-2" /> Cancel</Button>
                </div>
              </div>
            </div>
  )}
  {viewOrder && (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-lg max-h-[85vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-black mb-4">Order Details</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-black/70"><span className="font-medium">Tracking:</span> {viewOrder.tracking_code}</p>
            <p className="text-black/70"><span className="font-medium">Customer:</span> {viewOrder.customer_name}</p>
            <p className="text-black/70"><span className="font-medium">Email:</span> {viewOrder.email || '-'}</p>
            <p className="text-black/70"><span className="font-medium">Phone:</span> {viewOrder.phone || '-'}</p>
          </div>
          <div>
            <p className="text-black/70"><span className="font-medium">Address:</span> {viewOrder.address}</p>
            <p className="text-black/70"><span className="font-medium">City:</span> {viewOrder.city}</p>
            <p className="text-black/70"><span className="font-medium">State:</span> {viewOrder.state}</p>
            <p className="text-black/70"><span className="font-medium">Total:</span> ₦{Number(viewOrder.total || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="mb-4">
          <p className="font-medium text-black mb-2">Items</p>
          <div className="space-y-2">
            {(viewOrder.items || []).map((it: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-[#F7F3EC]">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={it.image} alt={it.name} className="w-10 h-10 rounded object-cover" />
                  <p className="text-black truncate">{it.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-black/60">x{it.quantity}</span>
                  <span className="font-medium text-black">₦{Number(it.price || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button onClick={() => setViewOrder(null)} className="w-full sm:w-auto bg-black hover:bg-black/90 text-white"><X className="w-4 h-4 mr-2" /> Close</Button>
        </div>
      </div>
    </div>
  )}
          {showCreateOrder && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg max-h-[85vh] overflow-y-auto">
                <h3 className="text-xl font-semibold text-black mb-4">Create Order</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <Input placeholder="Customer name" value={newOrder.name} onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })} />
                  <Input placeholder="Email" value={newOrder.email} onChange={(e) => setNewOrder({ ...newOrder, email: e.target.value })} />
                  <Input placeholder="Phone" value={newOrder.phone} onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })} />
                  <Input placeholder="Address" value={newOrder.address} onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })} />
                  <Input placeholder="City" value={newOrder.city} onChange={(e) => setNewOrder({ ...newOrder, city: e.target.value })} />
                  <Input placeholder="State" value={newOrder.state} onChange={(e) => setNewOrder({ ...newOrder, state: e.target.value })} />
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-black">Items</p>
                    <Button variant="outline" onClick={addNewOrderItem}><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
                  </div>
                  <div className="space-y-2">
                    {newOrderItems.map((it, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2">
                        <Input className="col-span-6" placeholder="Name" value={it.name} onChange={(e) => setNewOrderItems((prev) => prev.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} />
                        <Input className="col-span-3" type="number" placeholder="Price" value={it.price} onChange={(e) => setNewOrderItems((prev) => prev.map((x, i) => i === idx ? { ...x, price: e.target.value } : x))} />
                        <Input className="col-span-2" type="number" placeholder="Qty" value={it.quantity} onChange={(e) => setNewOrderItems((prev) => prev.map((x, i) => i === idx ? { ...x, quantity: Number(e.target.value || 1) } : x))} />
                        <button onClick={() => setNewOrderItems((prev) => prev.filter((_, i) => i !== idx))} className="col-span-1 p-2 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={createOrderAdmin} className="bg-green-600 hover:bg-green-700 text-white"><Save className="w-4 h-4 mr-2" /> Save</Button>
                  <Button onClick={() => { setShowCreateOrder(false); setNewOrderItems([]); }} className="bg-black hover:bg-black/90 text-white"><X className="w-4 h-4 mr-2" /> Cancel</Button>
                </div>
              </div>
            </div>
          )}

          <TabsContent value="vouchers">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
                <CardTitle>Voucher Management</CardTitle>
                <div className="flex items-center gap-2">
                  <Input className="w-64" placeholder="Search vouchers" value={voucherSearch} onChange={(e) => setVoucherSearch(e.target.value)} />
                  <Button onClick={() => setShowAddVoucher(true)} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Voucher
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddVoucher && (
                  <div className="mb-6 p-6 bg-[#F7F3EC] rounded-xl">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <Input placeholder="Code (e.g., HANNIE10)" value={newVoucher.code} onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })} />
                      <Select value={newVoucher.discount_type} onValueChange={(v) => setNewVoucher({ ...newVoucher, discount_type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">Percent</SelectItem>
                          <SelectItem value="fixed">Fixed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="number" placeholder="Discount value" value={newVoucher.discount_value} onChange={(e) => setNewVoucher({ ...newVoucher, discount_value: e.target.value })} />
                      <Input type="number" placeholder="Min order amount (optional)" value={newVoucher.min_order_amount} onChange={(e) => setNewVoucher({ ...newVoucher, min_order_amount: e.target.value })} />
                      <Input type="date" placeholder="Start date" value={newVoucher.start_date} onChange={(e) => setNewVoucher({ ...newVoucher, start_date: e.target.value })} />
                      <Input type="date" placeholder="End date" value={newVoucher.end_date} onChange={(e) => setNewVoucher({ ...newVoucher, end_date: e.target.value })} />
                      <Input type="number" placeholder="Usage limit (optional)" value={newVoucher.usage_limit} onChange={(e) => setNewVoucher({ ...newVoucher, usage_limit: e.target.value })} />
                      <Input placeholder="Applicable categories (comma-separated)" value={newVoucher.applicable_categories} onChange={(e) => setNewVoucher({ ...newVoucher, applicable_categories: e.target.value })} />
                      <Input type="number" placeholder="Max discount amount (optional)" value={newVoucher.max_discount} onChange={(e) => setNewVoucher({ ...newVoucher, max_discount: e.target.value })} />
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-black">First-time customers only</span>
                        <Switch checked={newVoucher.first_time_only} onCheckedChange={(v) => setNewVoucher({ ...newVoucher, first_time_only: v })} />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-black">Single use per customer</span>
                        <Switch checked={newVoucher.single_use_per_customer} onCheckedChange={(v) => setNewVoucher({ ...newVoucher, single_use_per_customer: v })} />
                      </div>
                      <Textarea placeholder="Admin note (optional)" value={newVoucher.note} onChange={(e) => setNewVoucher({ ...newVoucher, note: e.target.value })} />
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-black">Active</span>
                        <Switch checked={newVoucher.active} onCheckedChange={(v) => setNewVoucher({ ...newVoucher, active: v })} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button onClick={addVoucher} className="bg-green-600 hover:bg-green-700 text-white">
                        <Save className="w-4 h-4 mr-2" /> Save Voucher
                      </Button>
                      <Button onClick={() => setShowAddVoucher(false)} className="bg-black hover:bg-black/90 text-white">
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {vouchers.length === 0 ? (
                    <div className="p-4 bg-white rounded-xl border">No vouchers created</div>
                  ) : (
                    vouchers.filter((v) => {
                      const q = voucherSearch.toLowerCase().trim();
                      if (!q) return true;
                      const fields = [v.code, v.discount_type, v.note];
                      return fields.some((val: any) => String(val || '').toLowerCase().includes(q));
                    }).map((v) => (
                      <div key={v.id || v.code} className="p-4 bg-white rounded-xl border">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-black">{v.code}</p>
                            <p className="text-sm text-black/60">
                              {v.discount_type === 'percent' ? `${v.discount_value}%` : `₦${Number(v.discount_value || 0).toLocaleString()}`} off
                              {v.min_order_amount ? ` · Min ₦${Number(v.min_order_amount).toLocaleString()}` : ''}
                              {v.usage_limit ? ` · Limit ${Number(v.usage_limit)}` : ''}
                            </p>
                            {v.start_date || v.end_date ? (
                              <p className="text-xs text-black/50">Valid {v.start_date || 'now'} to {v.end_date || 'indefinite'}</p>
                            ) : null}
                            {Array.isArray(v.applicable_categories) && v.applicable_categories.length > 0 && (
                              <p className="text-xs text-black/50">Categories: {v.applicable_categories.join(', ')}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={v.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}>{v.active ? 'Active' : 'Inactive'}</Badge>
                            <button onClick={() => toggleVoucherActive(v)} className="p-2 rounded hover:bg-[#F7F3EC]" title="Toggle Active">
                              <Power className={v.active ? 'w-4 h-4 text-green-600' : 'w-4 h-4 text-gray-500'} />
                            </button>
                            <button onClick={() => {
                              setEmailContext('voucher');
                              setEmailAudience('newsletter');
                              setEmailDraft({ to: '', subject: `Exclusive voucher: ${v.code}`, html: `<p>Use code <strong>${v.code}</strong> to get ${v.discount_type === 'percent' ? `${v.discount_value}%` : `NGN ${Number(v.discount_value || 0).toLocaleString()}`} off${v.min_order_amount ? ` on orders above NGN ${Number(v.min_order_amount).toLocaleString()}` : ''}.</p><p>${v.note || ''}</p>`, attachments: [] });
                              setShowEmailModal(true);
                            }} className="p-2 rounded hover:bg-[#F7F3EC]" title="Email Voucher">
                              <Mail className="w-4 h-4 text-black" />
                            </button>
                            <button onClick={() => openEditVoucher(v)} className="p-2 rounded hover:bg-[#F7F3EC]" title="Edit">
                              <Pencil className="w-4 h-4 text-black" />
                            </button>
                            <button onClick={() => openConfirm(`Delete voucher ${v.code}?`, () => deleteVoucher(v))} className="p-2 rounded hover:bg-red-50" title="Delete">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
                <CardTitle>Product Management</CardTitle>
                <div className="flex w-full sm:w-auto items-center gap-2">
                  <Input className="w-full sm:w-64" placeholder="Search products" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                  <Button onClick={() => setShowAddProduct(true)} className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#C4A030] text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddProduct && (
                  <div className="mb-6 p-6 bg-[#F7F3EC] rounded-xl">
                    <h3 className="font-semibold text-black mb-4">Add New Product</h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <Input placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                      <Input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                      <Select value={newProduct.category} onValueChange={(v) => setNewProduct({ ...newProduct, category: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Resin Works">Resin Works</SelectItem>
                          <SelectItem value="Bead Works">Bead Works</SelectItem>
                          <SelectItem value="Catering">Catering</SelectItem>
                          <SelectItem value="Fashion Design">Fashion Design</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Image URL" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <input type="file" accept="image/*" onChange={handleUploadCoverNew} className="block w-full max-w-full" />
                        <Button disabled={uploadingCoverNew} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white whitespace-nowrap">
                          {uploadingCoverNew ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</>) : (<><ImagePlus className="w-4 h-4 mr-2" />Upload Cover</>)}
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <input type="file" accept="image/*" multiple onChange={handleUploadImagesNew} className="block w-full max-w-full" />
                        <Button disabled={uploadingImagesNew} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white whitespace-nowrap">
                          {uploadingImagesNew ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</>) : (<><ImagePlus className="w-4 h-4 mr-2" />Upload Images</>)}
                        </Button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <input type="file" accept="video/*" multiple onChange={handleUploadVideosNew} className="block w-full max-w-full" />
                        <Button disabled={uploadingVideosNew} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white whitespace-nowrap">
                          {uploadingVideosNew ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</>) : (<><Video className="w-4 h-4 mr-2" />Upload Videos</>)}
                        </Button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-black/60 mb-2">Current Images</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray((newProduct as any).images) && (newProduct as any).images.map((u: string, idx: number) => (
                          <Badge key={idx} className="bg-black/5 text-black">{u}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-black/60 mb-2">Current Videos</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray((newProduct as any).videos) && (newProduct as any).videos.map((u: string, idx: number) => (
                          <Badge key={idx} className="bg-black/5 text-black">{u}</Badge>
                        ))}
                      </div>
                    </div>
                    <Textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="mb-4" />
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-black/60 mb-2">Additional Image URLs (comma-separated)</p>
                        <Input placeholder="https://... , https://..." onChange={(e) => {
                          const parts = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          setNewProduct((np) => ({ ...(np as any), images: parts }));
                        }} />
                      </div>
                      <div>
                        <p className="text-sm text-black/60 mb-2">Product Video URLs (comma-separated)</p>
                        <Input placeholder="https://... , https://..." onChange={(e) => {
                          const parts = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          setNewProduct((np) => ({ ...(np as any), videos: parts }));
                        }} />
                      </div>
                    </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center justify-between p-3 bg-[#F7F3EC] rounded-xl">
              <span className="text-black">Ready Made</span>
              <Switch checked={(newProduct as any).ready_made} onCheckedChange={(v) => setNewProduct((np) => ({ ...(np as any), ready_made: v }))} />
            </div>
            {!(newProduct as any).ready_made && (
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Lead time value" value={(newProduct as any).lead_time_value} onChange={(e) => setNewProduct((np) => ({ ...(np as any), lead_time_value: e.target.value }))} />
                <Select value={(newProduct as any).lead_time_unit} onValueChange={(v) => setNewProduct((np) => ({ ...(np as any), lead_time_unit: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
                    <div className="flex gap-2">
                <Button onClick={addProduct} disabled={addProductSaving} className="bg-green-600 hover:bg-green-700 text-white">
                  {addProductSaving ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>) : (<><Save className="w-4 h-4 mr-2" />Save</>)}
                </Button>
                <Button onClick={() => setShowAddProduct(false)} className="bg-black hover:bg-black/90 text-white">
                  <X className="w-4 h-4 mr-2" />Cancel
                </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {products.filter((product) => {
                    const q = productSearch.toLowerCase().trim();
                    if (!q) return true;
                    const fields = [product.name, product.category, product.description];
                    return fields.some((val: any) => String(val || '').toLowerCase().includes(q));
                  }).map((product) => (
                    <div key={product.id} className={cn('flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-xl border transition-opacity', !product.visible && 'opacity-50')}>
                      <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-black truncate">{product.name}</h4>
                          {product.featured && <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">Featured</Badge>}
                        </div>
                        <p className="text-sm text-black/60">{product.category} · ${product.price}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => toggleProductFeatured(product.id)} className={cn('p-2 rounded-lg transition-colors', product.featured ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'hover:bg-gray-100 text-gray-400')}>
                          <Star className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleProductVisibility(product.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                          {product.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEditProduct(product)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => openConfirm(`Delete product ${product.name}?`, () => deleteProduct(product))} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blog">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
                <CardTitle>Blog Management</CardTitle>
                <div className="flex w-full sm:w-auto items-center gap-2">
                  <Input className="w-full sm:w-64" placeholder="Search blog posts" value={blogSearch} onChange={(e) => setBlogSearch(e.target.value)} />
                  <Button onClick={() => setShowAddBlog(true)} className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#C4A030] text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddBlog && (
                  <div className="mb-6 p-6 bg-[#F7F3EC] rounded-xl">
                    <h3 className="font-semibold text-black mb-4">Add New Blog Post</h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <Input placeholder="Post Title" value={newBlog.title} onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })} />
                      <Select value={newBlog.category} onValueChange={(v) => setNewBlog({ ...newBlog, category: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Behind the Scenes">Behind the Scenes</SelectItem>
                          <SelectItem value="Trends">Trends</SelectItem>
                          <SelectItem value="Recipes">Recipes</SelectItem>
                          <SelectItem value="Sustainability">Sustainability</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input placeholder="Image URL" value={newBlog.image} onChange={(e) => setNewBlog({ ...newBlog, image: e.target.value })} className="mb-4" />
                    <Textarea placeholder="Excerpt" value={newBlog.excerpt} onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })} className="mb-4" />
                    <div className="flex gap-2">
                      <Button onClick={addBlog} className="bg-green-600 hover:bg-green-700 text-white">
                        <Save className="w-4 h-4 mr-2" />Save
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddBlog(false)}>
                        <X className="w-4 h-4 mr-2" />Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {blogs.filter((post) => {
                    const q = blogSearch.toLowerCase().trim();
                    if (!q) return true;
                    const fields = [post.title, post.excerpt, post.category];
                    return fields.some((val: any) => String(val || '').toLowerCase().includes(q));
                  }).map((post) => (
                    <div key={post.id} className={cn('flex items-center gap-4 p-4 bg-white rounded-xl border transition-opacity', !post.visible && 'opacity-50')}>
                      <img src={post.image} alt={post.title} className="w-20 h-14 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-black truncate">{post.title}</h4>
                        <p className="text-sm text-black/60">{post.category} · {post.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleBlogVisibility(post.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                          {post.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEditBlog(post)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-700">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => openConfirm(`Delete post ${post.title}?`, () => deleteBlog(post.id))} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {editingBlogId && editingBlog && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-black mb-4">Edit Blog Post</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <Input placeholder="Title" value={editingBlog.title} onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })} />
                  <Input placeholder="Image URL" value={editingBlog.image} onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })} />
                  <Input placeholder="Category" value={editingBlog.category} onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })} />
                </div>
                <Textarea placeholder="Excerpt" value={editingBlog.excerpt} onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })} className="mb-4" />
                <div className="flex items-center gap-2">
                  <Button onClick={saveEditBlog} className="bg-green-600 hover:bg-green-700 text-white"><Save className="w-4 h-4 mr-2" /> Save</Button>
                  <Button onClick={() => { setEditingBlogId(null); setEditingBlog(null); }} className="bg-black hover:bg-black/90 text-white"><X className="w-4 h-4 mr-2" /> Cancel</Button>
                </div>
              </div>
            </div>
          )}

          <TabsContent value="contact">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Contact Management</CardTitle>
                <Button onClick={saveContactInfoAdmin} disabled={contactSaving} className="bg-green-600 hover:bg-green-700 text-white">
                  {contactSaving ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>) : (<><Save className="w-4 h-4 mr-2" /> Save</>)}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-6 bg-[#F7F3EC] rounded-xl">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <Input placeholder="Address" value={contactInfo.address || ''} onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })} />
                    <Input placeholder="Phone" value={contactInfo.phone || ''} onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })} />
                    <Input placeholder="Email" value={contactInfo.email || ''} onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} />
                    <Input placeholder="Website URL (e.g., maisonhannie.store)" value={contactInfo.site_url || ''} onChange={(e) => setContactInfo({ ...contactInfo, site_url: e.target.value })} />
                    <Input placeholder="Instagram URL" value={contactInfo.instagram_url || ''} onChange={(e) => setContactInfo({ ...contactInfo, instagram_url: e.target.value })} />
                    <Input placeholder="Facebook URL" value={contactInfo.facebook_url || ''} onChange={(e) => setContactInfo({ ...contactInfo, facebook_url: e.target.value })} />
                    <Input placeholder="Twitter URL" value={contactInfo.twitter_url || ''} onChange={(e) => setContactInfo({ ...contactInfo, twitter_url: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-3">
                  {hoursLoaded && hours.length === 0 ? (
                    <div className="p-4 bg-white rounded-xl border">No business hours configured</div>
                  ) : (
                    hours.map((hour) => (
                      <div key={hour.id} className="p-4 bg-white rounded-xl border">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-black">{hour.day}</p>
                            {editingHourId === hour.id ? (
                              <div className="mt-2 flex items-center gap-3">
                                <Input className="w-40" placeholder="Open" value={editingHour?.open_time || ''} onChange={(e) => setEditingHour({ ...(editingHour as any), open_time: e.target.value })} />
                                <Input className="w-40" placeholder="Close" value={editingHour?.close_time || ''} onChange={(e) => setEditingHour({ ...(editingHour as any), close_time: e.target.value })} />
                                <Select value={String(editingHour?.closed ? 'true' : 'false')} onValueChange={(v) => setEditingHour({ ...(editingHour as any), closed: v === 'true' })}>
                                  <SelectTrigger className="w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="false">Open</SelectItem>
                                    <SelectItem value="true">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              <p className="text-sm text-black/60">{hour.closed ? 'Closed' : `${hour.open_time} - ${hour.close_time}`}</p>
                            )}
                          </div>
                          {editingHourId === hour.id ? (
                            <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <Button onClick={saveBusinessHour} disabled={businessHourSaving} className="bg-green-600 hover:bg-green-700 text-white">
                  {businessHourSaving ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>) : (<><Save className="w-4 h-4 mr-2" /> Save</>)}
                </Button>
                <Button onClick={cancelEditBusinessHour} className="bg-black hover:bg-black/90 text-white">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                            </div>
                          ) : (
                            <Button onClick={() => editBusinessHour(hour.id)} className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#C4A030] text-white">Edit</Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Page Visibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'showShop', label: 'Shop Page' },
                    { key: 'showBlog', label: 'Blog Page' },
                    { key: 'showResin', label: 'Resin Works' },
                    { key: 'showBeads', label: 'Bead Works' },
                    { key: 'showCatering', label: 'Catering' },
                    { key: 'showTailor', label: 'Tailor Works' },
                  ].map((item: any) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-[#F7F3EC] rounded-lg">
                      <span className="text-black">{item.label}</span>
                      <Switch checked={(settings as any)[item.key]} onCheckedChange={(checked) => updateSettingFlag(item.key as any, checked)} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email & Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[#F7F3EC] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-black">Email Notifications</span>
                    </div>
                    <Switch checked={settings.emailNotifications} onCheckedChange={(checked) => updateSettingFlag('emailNotifications', checked)} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#F7F3EC] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-black">Order Alerts</span>
                    </div>
                    <Switch checked={settings.orderAlerts} onCheckedChange={(checked) => updateSettingFlag('orderAlerts', checked)} />
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-black/60 mb-3">Rating Request Email Template</p>
                    <div className="p-4 bg-[#F7F3EC] rounded-lg border border-dashed border-[#D4AF37]/30">
                      <p className="text-sm text-black/70">
                        <strong>Subject:</strong> How was your purchase from Maison Hannie?
                      </p>
                      <p className="text-sm text-black/70 mt-2">
                        <strong>Preview:</strong> &quot;Thank you for your recent purchase! We&apos;d love to hear your feedback...&quot;
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ratings & Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[#F7F3EC] rounded-lg">
                    <span className="text-black">Allow Public Reviews</span>
                    <Switch checked={reviewsEnabled} onCheckedChange={(checked) => updateReviewsEnabled(checked)} />
                  </div>
                  {settingsLoading && <p className="text-xs text-black/50">Loading settings...</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    {editingVoucherId && editingVoucher && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-black mb-4">Edit Voucher</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Input placeholder="Code" value={editingVoucher.code} onChange={(e) => setEditingVoucher({ ...editingVoucher, code: e.target.value })} />
            <Select value={editingVoucher.discount_type} onValueChange={(v) => setEditingVoucher({ ...editingVoucher, discount_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percent</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Discount value" value={editingVoucher.discount_value} onChange={(e) => setEditingVoucher({ ...editingVoucher, discount_value: e.target.value })} />
            <Input type="number" placeholder="Min order amount" value={editingVoucher.min_order_amount} onChange={(e) => setEditingVoucher({ ...editingVoucher, min_order_amount: e.target.value })} />
            <Input type="date" placeholder="Start date" value={editingVoucher.start_date} onChange={(e) => setEditingVoucher({ ...editingVoucher, start_date: e.target.value })} />
            <Input type="date" placeholder="End date" value={editingVoucher.end_date} onChange={(e) => setEditingVoucher({ ...editingVoucher, end_date: e.target.value })} />
            <Input type="number" placeholder="Usage limit" value={editingVoucher.usage_limit} onChange={(e) => setEditingVoucher({ ...editingVoucher, usage_limit: e.target.value })} />
            <Input placeholder="Applicable categories (comma-separated)" value={editingVoucher.applicable_categories} onChange={(e) => setEditingVoucher({ ...editingVoucher, applicable_categories: e.target.value })} />
            <Input type="number" placeholder="Max discount" value={editingVoucher.max_discount} onChange={(e) => setEditingVoucher({ ...editingVoucher, max_discount: e.target.value })} />
            <div className="flex items-center justify-between p-3 bg-[#F7F3EC] rounded-lg">
              <span className="text-black">First-time only</span>
              <Switch checked={editingVoucher.first_time_only} onCheckedChange={(v) => setEditingVoucher({ ...editingVoucher, first_time_only: v })} />
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F7F3EC] rounded-lg">
              <span className="text-black">Single use per customer</span>
              <Switch checked={editingVoucher.single_use_per_customer} onCheckedChange={(v) => setEditingVoucher({ ...editingVoucher, single_use_per_customer: v })} />
            </div>
          </div>
          <Textarea placeholder="Admin note" value={editingVoucher.note} onChange={(e) => setEditingVoucher({ ...editingVoucher, note: e.target.value })} className="mb-4" />
          <div className="flex items-center gap-2">
            <Button onClick={saveEditVoucher} className="bg-green-600 hover:bg-green-700 text-white">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button onClick={() => { setEditingVoucherId(null); setEditingVoucher(null); }} className="bg-black hover:bg-black/90 text-white">
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </div>
        </div>
      </div>
    )}
    {editingProductId && editingData && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg max-h-[85vh] overflow-y-auto">
          <h3 className="text-xl font-semibold text-black mb-4">Edit Product</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Input placeholder="Product Name" value={editingData.name} onChange={(e) => setEditingData({ ...editingData, name: e.target.value })} />
            <Input type="number" placeholder="Price" value={editingData.price} onChange={(e) => setEditingData({ ...editingData, price: e.target.value })} />
            <Select value={editingData.category} onValueChange={(v) => setEditingData({ ...editingData, category: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Resin Works">Resin Works</SelectItem>
                <SelectItem value="Bead Works">Bead Works</SelectItem>
                <SelectItem value="Catering">Catering</SelectItem>
                <SelectItem value="Fashion Design">Fashion Design</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Image URL" value={editingData.image} onChange={(e) => setEditingData({ ...editingData, image: e.target.value })} />
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <input type="file" accept="image/*" onChange={handleUploadCoverEdit} className="block w-full max-w-full" />
              <Button disabled={uploadingCoverEdit} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white whitespace-nowrap">
                {uploadingCoverEdit ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</>) : (<><ImagePlus className="w-4 h-4 mr-2" />Upload Cover</>)}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input type="file" accept="image/*" multiple onChange={handleUploadImagesEdit} className="block w-full max-w-full" />
              <Button disabled={uploadingImagesEdit} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white whitespace-nowrap">
                {uploadingImagesEdit ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</>) : (<><ImagePlus className="w-4 h-4 mr-2" />Upload Images</>)}
              </Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <input type="file" accept="video/*" multiple onChange={handleUploadVideosEdit} className="block w-full max-w-full" />
              <Button disabled={uploadingVideosEdit} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white whitespace-nowrap">
                {uploadingVideosEdit ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</>) : (<><Video className="w-4 h-4 mr-2" />Upload Videos</>)}
              </Button>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm text-black/60 mb-2">Current Images</p>
            <div className="flex flex-wrap gap-2">
              {Array.isArray((editingData as any).images) && (editingData as any).images.map((u: string, idx: number) => (
                <Badge key={idx} className="bg-black/5 text-black">{u}</Badge>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm text-black/60 mb-2">Current Videos</p>
            <div className="flex flex-wrap gap-2">
              {Array.isArray((editingData as any).videos) && (editingData as any).videos.map((u: string, idx: number) => (
                <Badge key={idx} className="bg-black/5 text-black">{u}</Badge>
              ))}
            </div>
          </div>
          <Textarea placeholder="Description" value={editingData.description} onChange={(e) => setEditingData({ ...editingData, description: e.target.value })} className="mb-4" />
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-black/60 mb-2">Additional Image URLs (comma-separated)</p>
              <Input placeholder="https://... , https://..." onChange={(e) => {
                const parts = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                setEditingData((ed: any) => ({ ...ed, images: parts }));
              }} />
            </div>
            <div>
              <p className="text-sm text-black/60 mb-2">Product Video URLs (comma-separated)</p>
              <Input placeholder="https://... , https://..." onChange={(e) => {
                const parts = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                setEditingData((ed: any) => ({ ...ed, videos: parts }));
              }} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center justify-between p-3 bg-[#F7F3EC] rounded-xl">
              <span className="text-black">Ready Made</span>
              <Switch checked={(editingData as any).ready_made} onCheckedChange={(v) => setEditingData((ed: any) => ({ ...ed, ready_made: v }))} />
            </div>
            {!(editingData as any).ready_made && (
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Lead time value" value={(editingData as any).lead_time_value} onChange={(e) => setEditingData((ed: any) => ({ ...ed, lead_time_value: e.target.value }))} />
                <Select value={(editingData as any).lead_time_unit} onValueChange={(v) => setEditingData((ed: any) => ({ ...ed, lead_time_unit: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
      <div className="flex justify-end gap-2">
        <Button onClick={saveEditProduct} disabled={editSaving} className="bg-green-600 hover:bg-green-700 text-white">
          {editSaving ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>) : (<><Save className="w-4 h-4 mr-2" /> Save Changes</>)}
        </Button>
        <Button onClick={cancelEditProduct} className="bg-black hover:bg-black/90 text-white">
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
      </div>
        </div>
      </div>
  )}
  {receiptConfirmOrder && (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg max-h-[85vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-black mb-2">Issue Receipt</h3>
        <p className="text-sm text-black/70 mb-4">This will generate a PDF receipt and email it to the customer.</p>
        <Input placeholder="Recipient email" value={receiptConfirmEmail || receiptConfirmOrder?.email || ''} onChange={(e) => setReceiptConfirmEmail(e.target.value)} className="mb-4" />
        <div className="flex items-center gap-2 justify-end">
          <Button onClick={async () => { await issueReceipt(receiptConfirmOrder); setReceiptConfirmOrder(null); setReceiptConfirmEmail(''); }} className="bg-green-600 hover:bg-green-700 text-white"><Send className="w-4 h-4 mr-2" /> Send</Button>
          <Button onClick={() => { setReceiptConfirmOrder(null); setReceiptConfirmEmail(''); }} className="bg-black hover:bg-black/90 text-white"><X className="w-4 h-4 mr-2" /> Cancel</Button>
        </div>
      </div>
    </div>
  )}
  {confirmDialog && confirmDialog.open && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg max-h-[85vh] overflow-y-auto">
          <h3 className="text-xl font-semibold text-black mb-2">Confirm Delete</h3>
          <p className="text-sm text-black/70 mb-4">{confirmDialog.message}</p>
          <div className="flex items-center gap-2 justify-end">
            <Button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="bg-red-600 hover:bg-red-700 text-white"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
            <Button onClick={() => setConfirmDialog(null)} className="bg-black hover:bg-black/90 text-white"><X className="w-4 h-4 mr-2" /> Cancel</Button>
          </div>
        </div>
      </div>
    )}
  </>);
  function openEditBlog(post: any) {
    setEditingBlogId(post.id);
    setEditingBlog({ title: post.title, image: post.image || '', category: post.category || '', excerpt: post.excerpt || '' });
  }
  async function saveEditBlog() {
    if (!editingBlogId || !editingBlog) return;
    const payload: any = { title: editingBlog.title, image: editingBlog.image || null, category: editingBlog.category || null, excerpt: editingBlog.excerpt || null };
    await supabase.from('blog_posts').update(payload).eq('id', editingBlogId);
    setBlogs((prev) => prev.map((p) => (p.id === editingBlogId ? { ...p, ...payload } : p)));
    setEditingBlogId(null);
    setEditingBlog(null);
  }

  function openEmailModal(q: any) {
    setEmailAudience('customer');
    setEmailContext('inquiry');
    setEmailDraft({ to: q.email, subject: `Re: Your ${q.event_type || 'event'} inquiry`, html: `<p>Hi ${q.name || ''},</p><p>Thanks for reaching out! We’ll get back to you shortly.</p><p>Warm regards,<br/>Maison Hannie</p>`, attachments: [] });
    setShowEmailModal(true);
  }
  function openViewInquiry(q: any) { setViewInquiry(q); }
  async function sendInquiryEmail() {
    const attachBlock = (emailDraft.attachments && emailDraft.attachments.length)
      ? (`<hr/><p><strong>Attachments:</strong></p><ul>${emailDraft.attachments.map((a) => `<li><a href="${a.url}">${a.name}</a></li>`).join('')}</ul>`)
      : '';
    if (emailAudience === 'newsletter' || (emailAudience === 'customer' && emailContext === 'voucher')) {
      const subs = newsletterSubscribers
        .map((s: any) => ({ email: String(s.email || ''), name: String(s.name || '') }))
        .filter((x: any) => !!x.email);
      let anyOk = false;
      let anyErr = false;
      for (const s of subs) {
        const html = `${s.name ? `<p>Hi ${s.name},</p>` : ''}${emailDraft.html}${attachBlock}`;
        const resp = await fetch('/api/admin/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: [s.email], subject: emailDraft.subject, html, attachments: (emailDraft.attachments || []).map((a) => ({ filename: a.name, content: '', path: a.url })) })
        });
        if (resp.ok) anyOk = true; else anyErr = true;
      }
      setShowEmailModal(false);
      if (anyOk && !anyErr) {
        showToast('Emails sent', 'success');
      } else if (anyOk && anyErr) {
        showToast('Some emails failed to send', 'error');
      } else {
        showToast('Failed to send emails', 'error');
      }
      return;
    }
    const recipients = emailDraft.to.split(',').map((s) => s.trim()).filter(Boolean);
    const resp = await fetch('/api/admin/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: recipients, subject: emailDraft.subject, html: `${emailDraft.html}${attachBlock}`, attachments: (emailDraft.attachments || []).map((a) => ({ filename: a.name, content: '', path: a.url })) }) });
    if (resp.ok) {
      setShowEmailModal(false);
      showToast('Email sent', 'success');
    } else {
      const t = await resp.text();
      console.error('Email send error', t);
      showToast('Failed to send email', 'error');
    }
  }

  async function sendContactEmail() {
    const attachBlock = (contactEmailDraft.attachments && contactEmailDraft.attachments.length)
      ? (`<hr/><p><strong>Attachments:</strong></p><ul>${contactEmailDraft.attachments.map((a) => `<li><a href="${a.url}">${a.name}</a></li>`).join('')}</ul>`)
      : '';
    const recipient = String(contactEmailDraft.to || '').trim();
    if (!recipient) return;
    const resp = await fetch('/api/admin/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: [recipient], subject: contactEmailDraft.subject, html: `${contactEmailDraft.html}${attachBlock}`, attachments: (contactEmailDraft.attachments || []).map((a) => ({ filename: a.name, content: '', path: a.url })) })
    });
    if (resp.ok) {
      setShowContactEmailModal(false);
      showToast('Email sent', 'success');
    } else {
      const t = await resp.text();
      console.error('Email send error', t);
      showToast('Failed to send email', 'error');
    }
  }
}