'use client';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Package, FileText, Eye, EyeOff, Star, Trash2, Plus, Save, X, Mail, Bell, ShoppingCart, Loader2, LogOut } from 'lucide-react';
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
    const authenticated = await base44.auth.isAuthenticated();
    if (authenticated) {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }

  function handleLogin() {
    base44.auth.redirectToLogin(window.location.href);
    checkAuth();
  }

  function handleLogout() {
    base44.auth.logout();
    setIsAuthenticated(false);
  }

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) return;
      setOrdersLoading(true);
      const data = await base44.entities.Order.list('-created_date');
      setOrders(data);
      setOrdersLoading(false);
    }
    loadOrders();
  }, [isAuthenticated]);

  async function updateOrderStatus(order: any, newStatus: string) {
    const newHistory = [...(order.status_history || []), { status: newStatus, timestamp: new Date().toISOString(), note: `Status updated to ${newStatus}` }];
    const updated = await base44.entities.Order.update(order.id, { status: newStatus, status_history: newHistory });
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  const [settings, setSettings] = useState({ showBlog: true, showShop: true, showCatering: true, showResin: true, showBeads: true, emailNotifications: true, orderAlerts: true });

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

  function toggleProductVisibility(id: number | string) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)));
  }

  function toggleProductFeatured(id: number | string) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)));
  }

  function deleteProduct(id: number | string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function addProduct() {
    if (newProduct.name && newProduct.price) {
      setProducts((prev) => [
        ...prev,
        { ...newProduct, id: `new_${Date.now()}`, price: parseFloat(newProduct.price), rating: 0, visible: true } as ProductAdmin,
      ]);
      setNewProduct({ name: '', price: '', category: 'Resin Works', description: '', image: '', featured: false });
      setShowAddProduct(false);
    }
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
            <p className="text-black/60 mt-2">Sign in to access the admin panel</p>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogin} className="w-full bg-[#D4AF37] hover:bg-[#C4A030] text-white">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="p-4 bg-white rounded-xl border">
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
                        </SelectContent>
                      </Select>
                      <Input placeholder="Image URL" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} />
                    </div>
                    <Textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="mb-4" />
                    <div className="flex gap-2">
                      <Button onClick={addProduct} className="bg-green-600 hover:bg-green-700 text-white">
                        <Save className="w-4 h-4 mr-2" />Save
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddProduct(false)}>
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
                  ].map((item: any) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-[#F7F3EC] rounded-lg">
                      <span className="text-black">{item.label}</span>
                      <Switch checked={(settings as any)[item.key]} onCheckedChange={(checked) => setSettings({ ...settings, [item.key]: checked })} />
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
                    <Switch checked={settings.emailNotifications} onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#F7F3EC] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-black">Order Alerts</span>
                    </div>
                    <Switch checked={settings.orderAlerts} onCheckedChange={(checked) => setSettings({ ...settings, orderAlerts: checked })} />
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-black/60 mb-3">Rating Request Email Template</p>
                    <div className="p-4 bg-[#F7F3EC] rounded-lg border border-dashed border-[#D4AF37]/30">
                      <p className="text-sm text-black/70">
                        <strong>Subject:</strong> How was your purchase from Maison Hannie?
                      </p>
                      <p className="text-sm text-black/70 mt-2">
                        <strong>Preview:</strong> "Thank you for your recent purchase! We'd love to hear your feedback..."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}