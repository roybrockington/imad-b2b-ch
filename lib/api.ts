const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function to set cookie
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export interface Supplier {
  id: number;
  code: number;
  name: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postcode?: string | null;
  web?: string | null;
  email?: string | null;
  phone?: string | null;
  fax?: string | null;
  region_id?: number | null;
}

export interface Brand {
  id: number;
  code: string;
  name: string;
  slug: string;
  // Description fields
  description_en?: string | null;
  description_de?: string | null;
  description_fr?: string | null;
  description_nl?: string | null;
  description_pl?: string | null;
  // Manufacturer fields
  mfr?: string | null;
  mfr_address?: string | null;
  mfr_city?: string | null;
  mfr_country?: string | null;
  mfr_postcode?: string | null;
  mfr_web?: string | null;
  mfr_email?: string | null;
  mfr_tel?: string | null;
  mfr_fax?: string | null;
  // Importer fields
  imp?: string | null;
  imp_address?: string | null;
  imp_city?: string | null;
  imp_country?: string | null;
  imp_postcode?: string | null;
  imp_web?: string | null;
  imp_email?: string | null;
  imp_tel?: string | null;
  imp_fax?: string | null;
  // Office (Responsible Entity) fields
  off?: string | null;
  off_address?: string | null;
  off_city?: string | null;
  off_country?: string | null;
  off_postcode?: string | null;
  off_web?: string | null;
  off_email?: string | null;
  off_tel?: string | null;
  off_fax?: string | null;
}

export interface Category {
  id: number;
  code: string;
  parent_id: number | null;
  name_en: string;
  name_fr: string;
  name_de: string;
  name_nl: string;
  name_pl: string;
  desc_en: string;
  desc_fr: string;
  desc_de: string;
  desc_nl: string;
  desc_pl: string;
  img: string;
}

export interface ProductDescription {
  id: number;
  product_id: number;
  name1_de: string;
  name1_en: string;
  name1_pl: string;
  name1_fr: string;
  name1_nl: string;
  name2_de: string;
  name2_en: string;
  name2_pl: string;
  name2_fr: string;
  name2_nl: string;
  text1_de: string | null;
  text1_en: string | null;
  text1_pl: string | null;
  text1_fr: string | null;
  text1_nl: string | null;
  text2_de: string | null;
  text2_en: string | null;
  text2_pl: string | null;
  text2_fr: string | null;
  text2_nl: string | null;
  image1: string | null;
  image2: string | null;
  image3: string | null;
  image4: string | null;
  image5: string | null;
  image6: string | null;
  alt1: string | null;
  alt2: string | null;
  alt3: string | null;
  alt4: string | null;
  alt5: string | null;
  alt6: string | null;
}

export interface Xware {
  id: number;
  code: string;
  product_id: number;
  stock: number;
  discount: string;
  type: string;
}

export interface ProductVariant {
  id: number;
  code: string;
  name: string;
  variant_name: string | null;
  slug: string;
}

export interface Product {
  id: number;
  code: string;
  variant: number | null;
  name: string;
  category_id: number;
  brand_id: number;
  ssp_eu: string;
  ssp_pl: string;
  ssp_cz: string;
  ssp_uk: string | null;
  trade_eu: string;
  trade_pl: string;
  trade_cz: string;
  trade_uk: string | null;
  promo_start: string | null;
  promo_end: string | null;
  qty_break: number;
  qty_discount: string;
  qty_break_uk: number | null;
  qty_discount_uk: string | null;
  promo_eu: string | null;
  promo_pl: string;
  promo_cz: string;
  promo_uk: string | null;
  ean: string | null;
  available_for_sale: boolean;
  bundle: boolean;
  esd: boolean;
  published: boolean;
  freight: boolean;
  embargo: boolean;
  stock: number;
  stock_uk: number | null;
  eta: string | null;
  eta_uk: string | null;
  created_at: string;
  updated_at: string;
  manufacturer_supplier_id?: number | null;
  office_supplier_id?: number | null;
  importer_supplier_id?: number | null;
  description?: ProductDescription;
  brand?: Brand;
  category?: Category;
  xware?: Xware[];
  variants?: ProductVariant[];
  canonical_url?: string;
  manufacturer_supplier?: Supplier | null;
  office_supplier?: Supplier | null;
  importer_supplier?: Supplier | null;
}

export interface PaginatedProducts {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface Region {
  id: number;
  code: string;
  name: string;
  currency: string;
}

export interface Discount {
  id: number;
  account_id: number;
  brand_id: number;
  discount: string;
  auth: boolean;
}

export interface CategoryDiscount {
  id: number;
  account_id: number;
  category_id: number;
  brand_id: number;
  discount: string;
  auth: boolean;
}

export interface Country {
  id: number;
  code: string;
  name: string;
  shipping_eur?: string;
  shipping_czk?: string;
  shipping_gbp?: string;
  shipping_pln?: string;
  freight_eur?: string;
  freight_czk?: string;
  freight_gbp?: string;
  freight_pln?: string;
}

export interface Currency {
  id: number;
  code: string;
  name: string;
}

export interface Account {
  id: number;
  code: number;
  name: string;
  region_id: number;
  country_id?: number;
  currency_id?: number;
  discount: string;
  insurance: string;
  freeShipping: boolean;
  region?: Region;
  country?: Country;
  currency?: Currency;
  discounts?: Discount[];
  category_discounts?: CategoryDiscount[];
}

export interface Address {
  id: number;
  code: string;
  name1: string;
  name2: string;
  address1: string;
  address2: string;
  city: string;
  postcode: string;
  country: string;
  tel: string;
  email: string;
  account_id: number;
  invoicing: number;
  default: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  account_id: number | null;
  account?: Account;
  roles?: string[];
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  featured_image: string | null;
  featured_image_url: string | null;
  published: boolean;
  published_at: string | null;
  author_id: number;
  author?: {
    id: number;
    name: string;
  };
  brands?: Brand[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedArticles {
  data: Article[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface Career {
  id: number;
  start_date: string;
  location: string;
  published: boolean;
  // Multilingual position fields
  position_en?: string | null;
  position_de?: string | null;
  position_fr?: string | null;
  position_nl?: string | null;
  position_pl?: string | null;
  // Multilingual tasks fields
  tasks_en?: string | null;
  tasks_de?: string | null;
  tasks_fr?: string | null;
  tasks_nl?: string | null;
  tasks_pl?: string | null;
  // Multilingual profile fields
  profile_en?: string | null;
  profile_de?: string | null;
  profile_fr?: string | null;
  profile_nl?: string | null;
  profile_pl?: string | null;
  // Multilingual expectations fields
  expectations_en?: string | null;
  expectations_de?: string | null;
  expectations_fr?: string | null;
  expectations_nl?: string | null;
  expectations_pl?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Slide {
  id: number;
  title?: string | null;
  caption_en?: string | null;
  caption_de?: string | null;
  caption_nl?: string | null;
  caption_pl?: string | null;
  caption_fr?: string | null;
  background?: string | null;
  video?: string | null;
  link?: string | null;
  order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Territory {
  country: string;
  brands: string[];
}

export interface DashboardStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  revenue: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  company?: string;
  phone?: string;
  turnstile_token?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
        setCookie('auth_token', token, 7);
      } else {
        localStorage.removeItem('auth_token');
        deleteCookie('auth_token');
      }
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.setToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }
      const error = await response.json().catch(() => ({}));
      console.error('API Error Response:', error);

      // Format validation errors if present
      if (error.errors) {
        const validationMessages = Object.entries(error.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        throw new Error(`Validation failed: ${validationMessages}`);
      }

      throw new Error(`${error.message || 'API request failed'} (status ${response.status})`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterData): Promise<{ token: string; user: User; message: string }> {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    return this.request('/logout', { method: 'POST' });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data: { email: string; token: string; password: string; password_confirmation: string }): Promise<{ message: string }> {
    return this.request('/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/user');
  }

  // Product endpoints
  async getProducts(params?: {
    page?: number;
    search?: string;
    available_for_sale?: boolean;
  }): Promise<PaginatedProducts> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.available_for_sale !== undefined) {
      searchParams.set('available_for_sale', params.available_for_sale.toString());
    }

    const query = searchParams.toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  async searchProducts(query: string, limit: number = 5): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('search', query);
    searchParams.set('limit', limit.toString());

    return this.request(`/products?${searchParams.toString()}`);
  }

  async getProduct(id: number): Promise<Product> {
    return this.request(`/products/${id}`);
  }

  async createProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number): Promise<void> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Brand endpoints
  async getBrands(): Promise<Brand[]> {
    return this.request('/brands');
  }

  async getAdminBrands(): Promise<Array<Brand & { products_count: number }>> {
    return this.request('/admin/brands');
  }

  async getBrand(name: string, page?: number, categoryId?: number): Promise<{
    brand: Brand;
    categories: Category[];
    products: PaginatedProducts;
    child_categories?: Category[];
    selected_category?: Category;
  }> {
    const searchParams = new URLSearchParams();
    if (page) searchParams.set('page', page.toString());
    if (categoryId) searchParams.set('category_id', categoryId.toString());
    const query = searchParams.toString();
    // Name should already be converted to URL-friendly slug (spaces to dashes)
    return this.request(`/brands/${name}${query ? `?${query}` : ''}`);
  }

  async getProductByBrandAndName(brandName: string, productName: string): Promise<Product> {
    // Names should already be converted to URL-friendly slugs (spaces to dashes)
    return this.request(`/brands/${brandName}/${productName}`);
  }

  async getProductByBrandProductAndVariant(brandName: string, productName: string, variantSlug: string): Promise<Product> {
    // Names should already be converted to URL-friendly slugs (spaces to dashes)
    return this.request(`/brands/${brandName}/${productName}/${variantSlug}`);
  }

  // Territory endpoints
  async getTerritories(): Promise<Territory[]> {
    return this.request('/territories');
  }

  // Order endpoints
  async createOrder(orderData: any): Promise<{ id: number; order: any }> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(id: number): Promise<any> {
    return this.request(`/orders/${id}`);
  }

  async getAddresses(): Promise<Address[]> {
    return this.request('/addresses');
  }

  async getCountry(code: string): Promise<Country> {
    return this.request(`/countries/${code}`);
  }

  async getUserOrders(page: number = 1): Promise<any> {
    return this.request(`/user/orders?page=${page}`);
  }

  // Admin order management
  async getAdminOrders(params?: { page?: number; status?: string; search?: string; per_page?: number }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return this.request(`/admin/orders${query ? `?${query}` : ''}`);
  }

  async updateOrderStatus(orderId: number, status: string): Promise<any> {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Order export queue endpoints
  async getOrderExports(params?: { page?: number; region?: string; search?: string; per_page?: number }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.region) searchParams.set('region', params.region);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return this.request(`/admin/order-exports${query ? `?${query}` : ''}`);
  }

  async getOrderExportStatistics(): Promise<any> {
    return this.request('/admin/order-exports/statistics');
  }

  async markOrderItemsAsExported(orderItemIds: number[]): Promise<any> {
    return this.request('/admin/order-exports/mark-exported', {
      method: 'POST',
      body: JSON.stringify({ order_item_ids: orderItemIds }),
    });
  }

  async exportOrderItemsToSage(orderItemIds: number[]): Promise<any> {
    return this.request('/admin/order-exports/export-to-sage', {
      method: 'POST',
      body: JSON.stringify({ order_item_ids: orderItemIds }),
    });
  }

  // CSV Import endpoints
  async processCsvImport(items: Array<{ code: string; quantity: number }>): Promise<{
    found: Array<{ product: Product; quantity: number }>;
    not_found: Array<{ code: string; quantity: number }>;
  }> {
    return this.request('/products/csv-import', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  // Article endpoints (public)
  async getArticles(params?: { page?: number; brand_id?: number; search?: string; per_page?: number }): Promise<PaginatedArticles> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.brand_id) searchParams.set('brand_id', params.brand_id.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return this.request(`/articles${query ? `?${query}` : ''}`);
  }

  async getArticle(slug: string): Promise<Article> {
    return this.request(`/articles/${slug}`);
  }

  // Admin article management
  async getAdminArticles(params?: { page?: number; published?: boolean; brand_id?: number; search?: string; per_page?: number }): Promise<PaginatedArticles> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.published !== undefined) searchParams.set('published', params.published.toString());
    if (params?.brand_id) searchParams.set('brand_id', params.brand_id.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return this.request(`/admin/articles${query ? `?${query}` : ''}`);
  }

  async getAdminArticle(id: number): Promise<Article> {
    return this.request(`/admin/articles/${id}`);
  }

  async createArticle(formData: FormData): Promise<{ article: Article; message: string }> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}/admin/articles`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create article');
    }

    return response.json();
  }

  async updateArticle(id: number, formData: FormData): Promise<{ article: Article; message: string }> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    formData.append('_method', 'PUT');

    const response = await fetch(`${API_URL}/admin/articles/${id}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update article');
    }

    return response.json();
  }

  async deleteArticle(id: number): Promise<{ message: string }> {
    return this.request(`/admin/articles/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadArticleImage(file: File): Promise<{ path: string; url: string; message: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}/admin/articles/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to upload image');
    }

    return response.json();
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request('/admin/stats');
  }

  // Career methods
  async getCareers(): Promise<Career[]> {
    return this.request('/careers');
  }

  async getAdminCareers(): Promise<Career[]> {
    return this.request('/admin/careers');
  }

  async getCareer(id: number): Promise<Career> {
    return this.request(`/admin/careers/${id}`);
  }

  async createCareer(data: Omit<Career, 'id' | 'created_at' | 'updated_at'>): Promise<Career> {
    return this.request('/admin/careers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCareer(id: number, data: Partial<Omit<Career, 'id' | 'created_at' | 'updated_at'>>): Promise<Career> {
    return this.request(`/admin/careers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCareer(id: number): Promise<void> {
    return this.request(`/admin/careers/${id}`, {
      method: 'DELETE',
    });
  }

  // Slide methods
  async getSlides(): Promise<Slide[]> {
    return this.request('/slides');
  }

  async getAdminSlides(): Promise<Slide[]> {
    return this.request('/admin/slides');
  }

  async getSlide(id: number): Promise<Slide> {
    return this.request(`/admin/slides/${id}`);
  }

  async createSlide(data: Omit<Slide, 'id' | 'created_at' | 'updated_at'>): Promise<Slide> {
    return this.request('/admin/slides', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSlide(id: number, data: Partial<Omit<Slide, 'id' | 'created_at' | 'updated_at'>>): Promise<Slide> {
    return this.request(`/admin/slides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSlide(id: number): Promise<void> {
    return this.request(`/admin/slides/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderSlides(slides: { id: number; order: number }[]): Promise<Slide[]> {
    return this.request('/admin/slides/reorder', {
      method: 'POST',
      body: JSON.stringify({ slides }),
    });
  }
}

export const api = new ApiClient();
