import type { CategoryItem, ProductDetail } from "@/composables/useAdminApi";

export type ProductFormState = {
  name: string;
  description: string;
  currentPrice: number;
  oldPrice: number | undefined;
  article: string;
  mainImage: string;
  ozonLink: string;
  categoryId: number | undefined;
  isActive: boolean;
  productImages: { url: string }[];
  productAttributes: { attributeId: number; value: string }[];
};

export function buildProductFormState(
  initial?: ProductDetail | null,
  categories: CategoryItem[] = [],
): ProductFormState {
  return {
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    currentPrice: initial ? Number(initial.currentPrice) : 0,
    oldPrice: initial?.oldPrice ? Number(initial.oldPrice) : undefined,
    article: initial?.article ?? "",
    mainImage: initial?.mainImage ?? "",
    ozonLink: initial?.ozonLink ?? "",
    categoryId: initial?.category?.id ?? categories[0]?.id,
    isActive: initial?.isActive ?? true,
    productImages: initial?.productImages?.map((image) => ({ url: image.url })) ?? [],
    productAttributes:
      initial?.productAttributes?.map((item) => ({
        attributeId: item.attributeId ?? item.attribute.id,
        value: item.value,
      })) ?? [],
  };
}

export function productFormToPayload(form: ProductFormState) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    currentPrice: form.currentPrice,
    oldPrice: form.oldPrice || undefined,
    article: form.article.trim(),
    mainImage: form.mainImage.trim(),
    ozonLink: form.ozonLink.trim() || undefined,
    categoryId: form.categoryId,
    isActive: form.isActive,
    productImages: form.productImages
      .map((image) => ({ url: image.url.trim() }))
      .filter((image) => image.url),
    productAttributes: form.productAttributes
      .map((attribute) => ({
        attributeId: attribute.attributeId,
        value: attribute.value.trim(),
      }))
      .filter((attribute) => attribute.attributeId > 0 && attribute.value),
  };
}
