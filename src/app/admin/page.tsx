'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Package, FileText, Eye, EyeOff, Star, Trash2, Plus, Save, X, Mail, Bell, ShoppingCart, Loader2, LogOut, Pencil, ImagePlus, Video } from 'lucide-react';
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
  const supabase = getSupabase();

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
      return;
    }
    await checkAuth();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  }

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) return;
      setOrdersLoading(true);
      try { await fetch('/api/admin/cleanup-pending', { method: 'POST' }); } catch {}
      const { data } = await supabase.from('orders').select('*').order('created_date', { ascending: false });
      const arr = data || [];
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
  }, [isAuthenticated]);

  async function updateOrderStatus(order: any, newStatus: string) {
    const newHistory = [...(order.status_history || []), { status: newStatus, timestamp: new Date().toISOString(), note: `Status updated to ${newStatus}` }];
    await supabase.from('orders').update({ status: newStatus, status_history: newHistory }).eq('id', order.id);
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
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddBlog, setShowAddBlog] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Resin Works', description: '', image: '', featured: false });
  const [newBlog, setNewBlog] = useState({ title: '', excerpt: '', category: 'Behind the Scenes', image: '', author: 'Sarah Hannie' });
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);

  const [contactInfo, setContactInfo] = useState<any>({ address: '', phone: '', email: '', instagram_url: '', facebook_url: '', twitter_url: '' });
  const [contactLoaded, setContactLoaded] = useState(false);
  const [hours, setHours] = useState<any[]>([]);
  const [hoursLoaded, setHoursLoaded] = useState(false);
  const [editingHourId, setEditingHourId] = useState<number | string | null>(null);
  const [editingHour, setEditingHour] = useState<any | null>(null);
  const [contactSaving, setContactSaving] = useState(false);
  const [businessHourSaving, setBusinessHourSaving] = useState(false);
  const [addProductSaving, setAddProductSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  async function toggleProductVisibility(id: number | string) {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const newHidden = !!target.visible;
    await supabase.from('products').update({ hidden: newHidden }).eq('id', Number(id));
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)));
  }

  async function toggleProductFeatured(id: number | string) {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    await supabase.from('products').update({ featured: !target.featured }).eq('id', Number(id));
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)));
  }

  function deleteProduct(id: number | string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
    } as any;
    setAddProductSaving(true);
    const { data, error } = await supabase.from('products').insert(payload).select('*').limit(1);
    if (!error) {
      const inserted = data && data[0] ? data[0] : { id: `new_${Date.now()}`, ...payload };
      setProducts((prev) => [...prev, { ...(inserted as any), visible: true }]);
      setNewProduct({ name: '', price: '', category: 'Resin Works', description: '', image: '', featured: false });
      setShowAddProduct(false);
    }
    setAddProductSaving(false);
  }

  const [editingProductId, setEditingProductId] = useState<number | string | null>(null);
  const [editingData, setEditingData] = useState<any | null>(null);

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
    };
    setEditSaving(true);
    await supabase.from('products').update(payload).eq('id', Number(editingProductId));
    setProducts((prev) => prev.map((p) => (p.id === editingProductId ? { ...p, ...payload } : p)));
    setEditingProductId(null);
    setEditingData(null);
    setEditSaving(false);
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
      if (!res.ok) { alert(String(json?.error || 'Upload failed')); return ''; }
      return String(json.url || '');
    } catch { return ''; }
  }

  function toggleBlogVisibility(id: number | string) {
    setBlogs((prev) => prev.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)));
  }

  function deleteBlog(id: number | string) {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  }

  function addBlog() {
    if (newBlog.title && newBlog.excerpt) {
      setBlogs((prev) => [
        ...prev,
        {
          ...newBlog,
          id: `blog_${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          likes: 0,
          hearts: 0,
          claps: 0,
          views: 0,
          comments: [],
          visible: true,
        },
      ] as BlogAdmin[]);
      setNewBlog({ title: '', excerpt: '', category: 'Behind the Scenes', image: '', author: 'Sarah Hannie' });
      setShowAddBlog(false);
    }
  }

  useEffect(() => {
    async function loadContact() {
      if (!isAuthenticated) return;
      const { data: c } = await supabase.from('contact_info').select('*').order('updated_at', { ascending: false }).limit(1);
      setContactInfo(c && c[0] ? c[0] : { address: '', phone: '', email: '', instagram_url: '', facebook_url: '', twitter_url: '' });
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

  async function saveContactInfoAdmin() {
    setContactSaving(true);
    const payload = {
      address: contactInfo.address || '',
      phone: contactInfo.phone || '',
      email: contactInfo.email || '',
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
  }

  function cancelEditBusinessHour() {
    setEditingHourId(null);
    setEditingHour(null);
  }

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-[#F7F3EC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-[#F7F3EC] flex items-center justify-center">
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
    <div className="pt-24 pb-20 min-h-screen bg-[#F7F3EC]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-black">Admin Panel</h1>
            <p className="text-black/60 mt-2">Welcome, {user?.full_name || user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl">
            <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
              <ShoppingCart className="w-4 h-4 mr-2" /> Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" /> Products
            </TabsTrigger>
            <TabsTrigger value="blog" className="rounded-lg data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" /> Blog
            </TabsTrigger>
            <TabsTrigger value="contact" className="rounded-lg data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" /> Contact
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-black/60">No orders yet</div>
                ) : (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-black font-semibold mb-3">Active Orders</h3>
                      <div className="space-y-4">
                        {orders.filter((o) => o.status !== 'pending').map((order) => (
                          <div key={order.id} className={cn('p-4 bg-white rounded-xl border')}>
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
                              <p className="text-black/70">{order.address}, {order.landmark && `${order.landmark}, `}{order.city}, {order.state}</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex flex-wrap gap-2">
                                {order.items?.slice(0, 2).map((item: any, i: number) => (
                                  <img key={i} src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                                ))}
                                {order.items?.length > 2 && (
                                  <span className="w-10 h-10 rounded bg-[#E5DCC5] flex items-center justify-center text-xs font-medium">+{order.items.length - 2}</span>
                                )}
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
                            </div>
                          </div>
                        ))}
                        {orders.filter((o) => o.status !== 'pending').length === 0 && (
                          <div className="text-black/60">No active orders</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-black font-semibold mb-3">Pending Orders</h3>
                      <div className="space-y-4">
                        {orders.filter((o) => o.status === 'pending').map((order) => (
                          <div key={order.id} className={cn('p-4 rounded-xl border border-yellow-300 bg-yellow-50')}>
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
                              <p className="text-black/70">{order.address}, {order.landmark && `${order.landmark}, `}{order.city}, {order.state}</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
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
                            </div>
                          </div>
                        ))}
                        {orders.filter((o) => o.status === 'pending').length === 0 && (
                          <div className="text-black/60">No pending orders</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Product Management</CardTitle>
                <Button onClick={() => setShowAddProduct(true)} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white">
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
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
                    <Textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="mb-4" />
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-black/60">Upload Main Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setUploadingMain(true);
                            const url = await uploadFile(f, 'products');
                            if (url) setNewProduct((np) => ({ ...np, image: url }));
                            setUploadingMain(false);
                          }}
                        />
                        {uploadingMain && <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />}
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-black/60">Upload Additional Images</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            if (!files.length) return;
                            setUploadingExtra(true);
                            const urls: string[] = [];
                            for (const f of files) {
                              const u = await uploadFile(f, 'products');
                              if (u) urls.push(u);
                            }
                            setNewProduct((np) => ({ ...(np as any), images: [ ...(((np as any).images) || []), ...urls ] }));
                            setUploadingExtra(false);
                          }}
                        />
                        {uploadingExtra && <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />}
                      </div>
                    </div>
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
                  {products.map((product) => (
                    <div key={product.id} className={cn('flex items-center gap-4 p-4 bg-white rounded-xl border transition-opacity', !product.visible && 'opacity-50')}>
                      <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-black truncate">{product.name}</h4>
                          {product.featured && <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">Featured</Badge>}
                        </div>
                        <p className="text-sm text-black/60">{product.category} · ${product.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleProductFeatured(product.id)} className={cn('p-2 rounded-lg transition-colors', product.featured ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'hover:bg-gray-100 text-gray-400')}>
                          <Star className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleProductVisibility(product.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                          {product.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEditProduct(product)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Blog Management</CardTitle>
                <Button onClick={() => setShowAddBlog(true)} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white">
                  <Plus className="w-4 h-4 mr-2" /> Add Post
                </Button>
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
                  {blogs.map((post) => (
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
                        <button onClick={() => deleteBlog(post.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                        <div className="flex items-center justify-between gap-4">
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
                            <div className="flex items-center gap-2">
                <Button onClick={saveBusinessHour} disabled={businessHourSaving} className="bg-green-600 hover:bg-green-700 text-white">
                  {businessHourSaving ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>) : (<><Save className="w-4 h-4 mr-2" /> Save</>)}
                </Button>
                <Button onClick={cancelEditBusinessHour} className="bg-black hover:bg-black/90 text-white">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                            </div>
                          ) : (
                            <Button onClick={() => editBusinessHour(hour.id)} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white">Edit</Button>
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
    {editingProductId && editingData && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg">
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
  </>);
}