type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown> | unknown[];
  query?: Record<string, string | number | boolean | undefined>;
};

export function useAdminApi() {
  async function request<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const response = await $fetch(url, {
      method: options.method ?? "GET",
      body: options.body,
      query: options.query,
      credentials: "include",
    });

    return response as T;
  }

  return {
    getDashboard: () => request<DashboardStats>("/api/admin/dashboard/stats"),
    getProducts: (query?: Record<string, string | number | boolean | undefined>) =>
      request<Paginated<ProductListItem>>("/api/admin/products", { query }),
    getProduct: (id: number) => request<ProductDetail>(`/api/admin/products/${id}`),
    createProduct: (body: Record<string, unknown>) =>
      request("/api/admin/products", { method: "POST", body }),
    updateProduct: (id: number, body: Record<string, unknown>) =>
      request(`/api/admin/products/update/${id}`, { method: "POST", body }),
    deleteProduct: (id: number) =>
      request(`/api/admin/products/delete/${id}`, { method: "POST" }),
    getStock: () => request<StockItem[]>("/api/admin/products/stock"),
    updateStock: (productId: number, quantity: number) =>
      request(`/api/admin/products/stock/update/${productId}`, {
        method: "POST",
        body: { quantity },
      }),
    getAttributes: () => request<AttributeItem[]>("/api/admin/products/attributes"),
    createAttribute: (body: { name: string; unit?: string }) =>
      request("/api/admin/products/attributes", { method: "POST", body }),
    updateAttribute: (id: number, body: Record<string, unknown>) =>
      request(`/api/admin/products/attributes/update/${id}`, { method: "POST", body }),
    deleteAttribute: (id: number) =>
      request(`/api/admin/products/attributes/delete/${id}`, { method: "POST" }),
    getCategories: () => request<CategoryItem[]>("/api/admin/categories"),
    createCategory: (name: string) =>
      request("/api/admin/categories", { method: "POST", body: { name } }),
    updateCategory: (categoryId: number, name: string) =>
      request(`/api/admin/categories/update/${categoryId}`, {
        method: "POST",
        body: { name },
      }),
    deleteCategory: (categoryId: number) =>
      request(`/api/admin/categories/delete/${categoryId}`, { method: "POST" }),
    getPrices: (productId: number) =>
      request<PriceItem[]>(`/api/admin/products/${productId}/price`),
    addPrice: (productId: number, value: number) =>
      request(`/api/admin/products/${productId}/price`, {
        method: "POST",
        body: { value },
      }),
    getOrders: (query?: Record<string, string | number | boolean | undefined>) =>
      request<Paginated<OrderItem>>("/api/admin/orders", { query }),
    updateOrderStatus: (orderId: number, orderStatus: string) =>
      request(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        body: { orderStatus },
      }),
    updatePaymentStatus: (orderId: number, paymentStatus: string) =>
      request("/api/admin/orders/payment", {
        method: "POST",
        body: { orderId, paymentStatus },
      }),
    getReviews: (query?: Record<string, string | number | boolean | undefined>) =>
      request<Paginated<ReviewItem>>("/api/admin/reviews", { query }),
    answerReview: (reviewId: number, text: string) =>
      request(`/api/admin/reviews/${reviewId}/answer`, {
        method: "POST",
        body: { text },
      }),
    getFaq: (query?: Record<string, string | number | boolean | undefined>) =>
      request<Paginated<FaqItem>>("/api/admin/faq", { query }),
    answerFaq: (shopQuestionId: number, comment: string) =>
      request("/api/admin/faq/answer", {
        method: "POST",
        body: { shopQuestionId, comment },
      }),
    uploadImage: (file: File) => {
      const body = new FormData();
      body.append("file", file);
      return $fetch<{ url: string }>("/api/admin/upload", {
        method: "POST",
        body,
        credentials: "include",
      });
    },
  };
}

export type Paginated<T> = {
  items: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type DashboardStats = {
  stats: {
    productsTotal: number;
    productsActive: number;
    ordersTotal: number;
    ordersNew: number;
    reviewsPending: number;
    faqPending: number;
    lowStock: number;
    revenuePaid: number | string;
  };
  recentOrders: OrderItem[];
};

export type ProductListItem = {
  id: number;
  name: string;
  article: string;
  currentPrice: number | string;
  oldPrice: number | string | null;
  mainImage: string;
  isActive: boolean;
  category: { id: number; name: string };
  productStocks: { quantity: number }[];
  _count: { reviews: number; orderItems: number };
};

export type ProductDetail = ProductListItem & {
  description: string;
  ozonLink: string | null;
  productImages: { id: number; url: string }[];
  productAttributes: {
    id: number;
    value: string;
    attributeId: number;
    attribute: { id: number; name: string; unit: string };
  }[];
  productPrices: { id: number; value: number | string; createdAt: string }[];
};

export type StockItem = {
  id: number;
  quantity: number;
  updatedAt: string;
  product: { id: number; name: string; article: string; isActive: boolean };
};

export type AttributeItem = {
  id: number;
  name: string;
  unit: string;
  _count: { productAttributes: number };
};

export type CategoryItem = { id: number; name: string };

export type PriceItem = { id: number; value: number | string; createdAt: string };

export type OrderItem = {
  id: number;
  orderStatus: string;
  paymentMethod: string;
  obtainingMethod: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
  payment: {
    amount: number | string;
    paymentStatus: string;
    paidAt: string | null;
  } | null;
  delivery: { address: string } | null;
  orderItems: {
    quantity: number;
    price: number | string;
    product: { id: number; name: string; mainImage: string };
  }[];
  _count?: { orderItems: number };
};

export type ReviewItem = {
  id: number;
  rating: number;
  advantages: string | null;
  disadvantages: string | null;
  comment: string | null;
  isAnswered: boolean | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  product: { id: number; name: string; mainImage: string };
  reviewPhotos: { id: number; url: string }[];
  reviewAnswers: { id: number; text: string; user: { name: string | null } | null }[];
};

export type FaqItem = {
  id: number;
  title: string;
  comment: string;
  isAnswered: boolean | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  shopQuestionImages: { id: number; url: string }[];
  shopAnswers: { id: number; comment: string; user: { name: string | null } | null }[];
};
