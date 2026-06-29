type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown> | unknown[];
  query?: Record<string, string | number | boolean | undefined | null>;
};

function compactQuery(query?: FetchOptions["query"]) {
  if (!query) return undefined;

  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

export function useAdminApi() {
  async function request<T>(url: string, options: FetchOptions = {}): Promise<T> {
    return await $fetch<T>(url, {
      method: options.method ?? "GET",
      body: options.body,
      query: compactQuery(options.query),
      credentials: "include",
    });
  }

  return {
    getDashboard: (query?: FetchOptions["query"]) =>
      request<DashboardStats>("/api/admin/dashboard/stats", { query }),
    getProducts: (query?: FetchOptions["query"]) =>
      request<Paginated<ProductListItem>>("/api/admin/products", { query }),
    getProduct: (id: number) => request<ProductDetail>(`/api/admin/products/${id}`),
    createProduct: (body: Record<string, unknown>) =>
      request<{ success: boolean; product: ProductDetail }>("/api/admin/products", {
        method: "POST",
        body,
      }),
    updateProduct: (id: number, body: Record<string, unknown>) =>
      request<{ success: boolean; product: ProductDetail }>(`/api/admin/products/update/${id}`, {
        method: "POST",
        body,
      }),
    deleteProduct: (id: number) =>
      request<{ success: boolean }>(`/api/admin/products/delete/${id}`, { method: "POST" }),
    getStock: () => request<StockItem[]>("/api/admin/products/stock"),
    updateStock: (productId: number, quantity: number) =>
      request<{ success: boolean; stock: { id: number; quantity: number; updatedAt: string } }>(
        `/api/admin/products/stock/update/${productId}`,
        { method: "POST", body: { quantity } },
      ),
    getAttributes: () => request<AttributeItem[]>("/api/admin/products/attributes"),
    createAttribute: (body: { name: string; unit?: string }) =>
      request<{ success: boolean; attribute: AttributeBase }>("/api/admin/products/attributes", {
        method: "POST",
        body,
      }),
    updateAttribute: (id: number, body: Record<string, unknown>) =>
      request<{ success: boolean; attribute: AttributeBase }>(
        `/api/admin/products/attributes/update/${id}`,
        { method: "POST", body },
      ),
    deleteAttribute: (id: number) =>
      request<{ success: boolean }>(`/api/admin/products/attributes/delete/${id}`, {
        method: "POST",
      }),
    getCategories: () => request<CategoryItem[]>("/api/admin/categories"),
    createCategory: (name: string) =>
      request<{ success: boolean; category: CategoryItem }>("/api/admin/categories", {
        method: "POST",
        body: { name },
      }),
    updateCategory: (categoryId: number, name: string) =>
      request<{ success: boolean; category: CategoryItem }>(
        `/api/admin/categories/update/${categoryId}`,
        { method: "POST", body: { name } },
      ),
    deleteCategory: (categoryId: number) =>
      request<{ success: boolean }>(`/api/admin/categories/delete/${categoryId}`, {
        method: "POST",
      }),
    getPrices: (productId: number) => request<PriceItem[]>(`/api/admin/products/${productId}/price`),
    addPrice: (productId: number, value: number) =>
      request<{ success: boolean; price: PriceItem; product: ProductListItem }>(
        `/api/admin/products/${productId}/price`,
        { method: "POST", body: { value } },
      ),
    getOrders: (query?: FetchOptions["query"]) =>
      request<Paginated<OrderItem>>("/api/admin/orders", { query }),
    updateOrderStatus: (orderId: number, orderStatus: OrderStatus) =>
      request<{ success: boolean; order: OrderItem }>(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        body: { orderStatus },
      }),
    updatePaymentStatus: (orderId: number, paymentStatus: PaymentStatus) =>
      request<{ success: boolean; payment: OrderPayment }>("/api/admin/orders/payment", {
        method: "POST",
        body: { orderId, paymentStatus },
      }),
    getReviews: (query?: FetchOptions["query"]) =>
      request<Paginated<ReviewItem>>("/api/admin/reviews", { query }),
    answerReview: (reviewId: number, text: string) =>
      request<{ success: boolean; answer: ReviewAnswer }>(`/api/admin/reviews/${reviewId}/answer`, {
        method: "POST",
        body: { text },
      }),
    getFaq: (query?: FetchOptions["query"]) =>
      request<Paginated<FaqItem>>("/api/admin/faq", { query }),
    answerFaq: (shopQuestionId: number, comment: string) =>
      request<{ success: boolean; answer: FaqAnswer }>("/api/admin/faq/answer", {
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

export type CategoryItem = { id: number; name: string };

export type AttributeBase = { id: number; name: string; unit: string };

export type AttributeItem = AttributeBase & {
  _count: { productAttributes: number };
};

export type PriceItem = { id: number; value: number | string; createdAt: string };

export type ProductListItem = {
  id: number;
  name: string;
  article: string;
  currentPrice: number | string;
  oldPrice: number | string | null;
  mainImage: string;
  isActive: boolean;
  category: CategoryItem;
  productStocks: { quantity: number }[];
  _count: { reviews: number; orderItems: number };
};

export type ProductDetail = ProductListItem & {
  description: string;
  ozonLink: string | null;
  createdAt: string;
  updatedAt: string;
  productImages: { id: number; url: string }[];
  productAttributes: {
    id: number;
    value: string;
    attributeId: number;
    attribute: AttributeBase;
  }[];
  productPrices: PriceItem[];
};

export type StockItem = {
  id: number;
  quantity: number;
  updatedAt: string;
  product: { id: number; name: string; article: string; isActive: boolean };
};

export type OrderStatus = "NEW" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "UPON_RECEIPT" | "PAID" | "CANCELLED";

export type OrderPayment = {
  amount: number | string;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
};

export type OrderItem = {
  id: number;
  orderStatus: OrderStatus;
  paymentMethod: string;
  obtainingMethod: string;
  createdAt: string;
  updatedAt?: string;
  user: { id: string; name: string | null; email: string } | null;
  payment: OrderPayment | null;
  delivery: {
    address: string;
    apartment?: string | null;
    entrance?: string | null;
    floor?: string | null;
    intercom?: string | null;
    comment?: string | null;
  } | null;
  orderItems: {
    quantity: number;
    price: number | string;
    product: { id: number; name: string; mainImage: string };
  }[];
  _count?: { orderItems: number };
};

export type DashboardRecentOrder = Pick<
  OrderItem,
  "id" | "orderStatus" | "paymentMethod" | "obtainingMethod" | "createdAt" | "updatedAt" | "payment" | "user" | "_count"
>;

export type ReviewAnswer = {
  id: number;
  text: string;
  createdAt?: string;
  user: { name: string | null } | null;
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
  reviewAnswers: ReviewAnswer[];
};

export type FaqAnswer = {
  id: number;
  comment: string;
  createdAt?: string;
  user: { name: string | null } | null;
};

export type FaqItem = {
  id: number;
  title: string;
  comment: string;
  isAnswered: boolean | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  shopQuestionImages: { id: number; url: string }[];
  shopAnswers: FaqAnswer[];
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
  recentOrders: DashboardRecentOrder[];
  analytics: {
    period: { startDate: string; endDate: string; days: number };
    selectedProductId: number | null;
    totals: {
      quantity: number;
      orders: number;
      revenue: number | string;
      averageOrderValue: number | string;
    };
    salesByDay: {
      date: string;
      label: string;
      quantity: number;
      orders: number;
      revenue: number | string;
    }[];
    productSales: {
      productId: number;
      name: string;
      article: string;
      mainImage: string;
      quantity: number;
      orders: number;
      revenue: number | string;
    }[];
    productOptions: { id: number; name: string; article: string }[];
  };
};
