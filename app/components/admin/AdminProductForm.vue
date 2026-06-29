<script setup lang="ts">
import { Plus, Save, Trash2 } from "@lucide/vue";
import { toast } from "vue-sonner";
import type { AttributeItem, CategoryItem, ProductDetail } from "@/composables/useAdminApi";

type ProductFormState = {
  name: string;
  description: string;
  currentPrice: number;
  oldPrice: number | null;
  article: string;
  mainImage: string;
  ozonLink: string;
  categoryId: number;
  isActive: boolean;
  productImages: { url: string }[];
  productAttributes: { attributeId: number; value: string }[];
};

const props = withDefaults(
  defineProps<{
    categories: CategoryItem[];
    attributes: AttributeItem[];
    initial?: ProductDetail | null;
    loading?: boolean;
  }>(),
  {
    initial: null,
    loading: false,
  },
);

const emit = defineEmits<{
  submit: [payload: Record<string, unknown>];
}>();

const api = useAdminApi();
const router = useRouter();
const localCategories = ref<CategoryItem[]>([]);
const localAttributes = ref<AttributeItem[]>([]);
const creatingCategory = ref(false);
const creatingAttribute = ref(false);
const newCategoryName = ref("");
const newAttributeName = ref("");
const newAttributeUnit = ref("");

const form = reactive<ProductFormState>(buildState(props.initial));
const categoryModel = computed({
  get: () => (form.categoryId ? String(form.categoryId) : ""),
  set: (value: string) => {
    form.categoryId = Number(value);
  },
});
const categoryOptions = computed(() =>
  localCategories.value.map((category) => ({
    value: String(category.id),
    label: category.name,
  })),
);
const attributeOptions = computed(() =>
  localAttributes.value.map((attribute) => ({
    value: String(attribute.id),
    label: attribute.name,
    description: attribute.unit || undefined,
  })),
);

watch(
  () => props.categories,
  (categories) => {
    localCategories.value = [...categories];
    if (!form.categoryId && categories[0]) {
      form.categoryId = categories[0].id;
    }
  },
  { immediate: true, deep: true },
);

watch(
  () => props.attributes,
  (attributes) => {
    localAttributes.value = [...attributes];
  },
  { immediate: true, deep: true },
);

watch(
  () => props.initial,
  (initial) => {
    Object.assign(form, buildState(initial));
  },
  { deep: true },
);

function buildState(product?: ProductDetail | null): ProductFormState {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    currentPrice: Number(product?.currentPrice ?? 0),
    oldPrice: product?.oldPrice ? Number(product.oldPrice) : null,
    article: product?.article ?? "",
    mainImage: product?.mainImage ?? "",
    ozonLink: product?.ozonLink ?? "",
    categoryId: product?.category?.id ?? props.categories[0]?.id ?? 0,
    isActive: product?.isActive ?? true,
    productImages: product?.productImages?.map((image) => ({ url: image.url })) ?? [],
    productAttributes:
      product?.productAttributes?.map((item) => ({
        attributeId: item.attributeId,
        value: item.value,
      })) ?? [],
  };
}

async function createCategory() {
  const name = newCategoryName.value.trim();
  if (!name) {
    toast.error("Укажите название категории");
    return;
  }

  creatingCategory.value = true;
  try {
    const { category } = await api.createCategory(name);
    localCategories.value = [...localCategories.value, category].sort((a, b) =>
      a.name.localeCompare(b.name, "ru"),
    );
    form.categoryId = category.id;
    newCategoryName.value = "";
    toast.success("Категория создана");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось создать категорию");
  } finally {
    creatingCategory.value = false;
  }
}

async function createAttribute() {
  const name = newAttributeName.value.trim();
  const unit = newAttributeUnit.value.trim();
  if (!name) {
    toast.error("Укажите название атрибута");
    return;
  }

  creatingAttribute.value = true;
  try {
    const { attribute } = await api.createAttribute({ name, unit });
    const created = { ...attribute, _count: { productAttributes: 0 } };
    localAttributes.value = [...localAttributes.value, created].sort((a, b) =>
      a.name.localeCompare(b.name, "ru"),
    );
    form.productAttributes.push({ attributeId: created.id, value: "" });
    newAttributeName.value = "";
    newAttributeUnit.value = "";
    toast.success("Атрибут создан");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось создать атрибут");
  } finally {
    creatingAttribute.value = false;
  }
}

function addGalleryImage() {
  form.productImages.push({ url: "" });
}

function addAttributeRow() {
  form.productAttributes.push({
    attributeId: localAttributes.value[0]?.id ?? 0,
    value: "",
  });
}

function toPayload() {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    description: form.description.trim(),
    currentPrice: Number(form.currentPrice),
    article: form.article.trim(),
    mainImage: form.mainImage.trim(),
    categoryId: Number(form.categoryId),
    isActive: form.isActive,
    productImages: form.productImages
      .map((image) => ({ url: image.url.trim() }))
      .filter((image) => image.url),
    productAttributes: form.productAttributes
      .filter((item) => item.attributeId && item.value.trim())
      .map((item) => ({ attributeId: Number(item.attributeId), value: item.value.trim() })),
  };

  if (form.oldPrice && Number(form.oldPrice) > 0) payload.oldPrice = Number(form.oldPrice);
  if (form.ozonLink.trim()) payload.ozonLink = form.ozonLink.trim();

  return payload;
}

function handleSubmit() {
  if (!form.name.trim() || !form.article.trim() || !form.description.trim()) {
    toast.error("Заполните название, артикул и описание");
    return;
  }

  if (!form.mainImage.trim()) {
    toast.error("Добавьте главное изображение товара");
    return;
  }

  if (!form.categoryId) {
    toast.error("Выберите или создайте категорию");
    return;
  }

  if (Number(form.currentPrice) <= 0) {
    toast.error("Цена должна быть больше нуля");
    return;
  }

  const attributeIds = form.productAttributes
    .filter((item) => item.attributeId && item.value.trim())
    .map((item) => item.attributeId);

  if (new Set(attributeIds).size !== attributeIds.length) {
    toast.error("Атрибуты товара не должны повторяться");
    return;
  }

  emit("submit", toPayload());
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <div>
        <section>
          <div>
            <div>
              <h2>Основная информация</h2>
              <p>Название, описание, категория и статус публикации</p>
            </div>
          </div>
          <div>
            <div>
              <div>
                <label for="product-name">Название</label>
                <input id="product-name" v-model="form.name" placeholder="Например, iPhone 15 Pro" />
              </div>
              <div>
                <label for="product-article">Артикул</label>
                <input id="product-article" v-model="form.article" placeholder="SKU-001" />
              </div>
              <div>
                <label for="product-category">Категория</label>
                <AdminSelect v-model="categoryModel" :options="categoryOptions" placeholder="Выберите категорию"
                  aria-label="Категория товара" />
              </div>
            </div>

            <div>
              <label for="product-description">Описание</label>
              <textarea id="product-description" v-model="form.description" rows="6" />
            </div>

            <div>
              <div>
                <div>Показывать в каталоге</div>
                <div>Неактивные товары остаются в админке, но скрыты от покупателей.</div>
              </div>
              <button :class="{ active: form.isActive }" type="button" :aria-pressed="form.isActive"
                @click="form.isActive = !form.isActive" />
            </div>

            <div>
              <div>
                <div>
                  <div>
                    <h3>Быстро создать категорию</h3>
                    <p>Новая категория сразу привяжется к товару</p>
                  </div>
                  <button type="button" :disabled="creatingCategory" @click="createCategory">
                    <Plus />
                    {{ creatingCategory ? "Создание..." : "Создать" }}
                  </button>
                </div>
                <input v-model="newCategoryName" placeholder="Название новой категории"
                  @keydown.enter.prevent="createCategory" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div>
            <div>
              <h2>Атрибуты товара</h2>
              <p>Технические характеристики можно создать прямо здесь</p>
            </div>
            <button type="button" @click="addAttributeRow">
              <Plus />
              Добавить
            </button>
          </div>
          <div>
            <div>
              <div>
                <div>
                  <div>
                    <label for="new-attribute-name">Новый атрибут</label>
                    <input id="new-attribute-name" v-model="newAttributeName" placeholder="Мощность" />
                  </div>
                  <div>
                    <label for="new-attribute-unit">Единица</label>
                    <input id="new-attribute-unit" v-model="newAttributeUnit" placeholder="Вт, ГБ, мм" />
                  </div>
                </div>
                <div>
                  <button type="button" :disabled="creatingAttribute" @click="createAttribute">
                    <Plus />
                    {{ creatingAttribute ? "Создание..." : "Создать атрибут" }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="form.productAttributes.length">
              <div v-for="(item, index) in form.productAttributes" :key="index">
                <AdminSelect :model-value="item.attributeId ? String(item.attributeId) : ''" :options="attributeOptions"
                  placeholder="Атрибут" :aria-label="`Атрибут ${index + 1}`"
                  @update:model-value="item.attributeId = Number($event)" />
                <input v-model="item.value" placeholder="Значение" />
                <button type="button" @click="form.productAttributes.splice(index, 1)">
                  <Trash2 />
                </button>
              </div>
            </div>
            <div v-else>Характеристики пока не добавлены</div>
          </div>
        </section>
      </div>

      <div>
        <section>
          <div>
            <div>
              <h2>Главное фото</h2>
              <p>Используется в каталоге и карточке товара</p>
            </div>
          </div>
          <div>
            <AdminImageUpload v-model="form.mainImage" label="" />
          </div>
        </section>

        <section>
          <div>
            <div>
              <h2>Цена и маркетплейс</h2>
              <p>Текущая цена, старая цена и ссылка на Ozon</p>
            </div>
          </div>
          <div>
            <div>
              <div>
                <label for="current-price">Цена</label>
                <input id="current-price" v-model.number="form.currentPrice" min="0" step="0.01" type="number" />
              </div>
              <div>
                <label for="old-price">Старая цена</label>
                <input id="old-price" v-model.number="form.oldPrice" min="0" step="0.01" type="number" />
              </div>
            </div>
            <div>
              <label for="ozon-link">Ссылка Ozon</label>
              <input id="ozon-link" v-model="form.ozonLink" placeholder="https://ozon.ru/..." />
            </div>
          </div>
        </section>
      </div>
    </div>

    <section>
      <div>
        <div>
          <h2>Галерея</h2>
          <p>Дополнительные изображения товара</p>
        </div>
        <button type="button" @click="addGalleryImage">
          <Plus />
          Добавить фото
        </button>
      </div>
      <div>
        <div v-if="form.productImages.length">
          <div v-for="(image, index) in form.productImages" :key="index">
            <AdminImageUpload :model-value="image.url" compact label="" @update:model-value="image.url = $event" />
            <button type="button" @click="form.productImages.splice(index, 1)">
              <Trash2 />
              Удалить
            </button>
          </div>
        </div>
        <div v-else>Дополнительные изображения пока не добавлены</div>
      </div>
    </section>

    <div>
      <button type="button" @click="router.back()">Отмена</button>
      <button type="submit" :disabled="loading">
        <Save />
        {{ loading ? "Сохранение..." : initial ? "Сохранить товар" : "Создать товар" }}
      </button>
    </div>
  </form>
</template>
