<script setup lang="ts">
import { Check, FolderPlus, Pencil, Trash2, X } from "@lucide/vue";
import { toast } from "vue-sonner";
import type { CategoryItem } from "@/composables/useAdminApi";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();
const newName = ref("");
const saving = ref(false);
const editingId = ref<number | null>(null);
const editingName = ref("");

const { data: categories, pending, refresh } = await useAsyncData("admin-categories", () => api.getCategories(), {
  default: () => [] as CategoryItem[],
});

async function createCategory() {
  const name = newName.value.trim();
  if (!name) {
    toast.error("Введите название категории");
    return;
  }

  saving.value = true;
  try {
    await api.createCategory(name);
    newName.value = "";
    await refresh();
    toast.success("Категория создана");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось создать категорию");
  } finally {
    saving.value = false;
  }
}

function startEdit(category: CategoryItem) {
  editingId.value = category.id;
  editingName.value = category.name;
}

async function saveEdit(categoryId: number) {
  const name = editingName.value.trim();
  if (!name) {
    toast.error("Название не может быть пустым");
    return;
  }

  try {
    await api.updateCategory(categoryId, name);
    editingId.value = null;
    await refresh();
    toast.success("Категория обновлена");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось обновить категорию");
  }
}

async function deleteCategory(category: CategoryItem) {
  if (!confirm(`Удалить категорию "${category.name}"?`)) return;

  try {
    await api.deleteCategory(category.id);
    await refresh();
    toast.success("Категория удалена");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось удалить категорию");
  }
}
</script>

<template>
  <div class="admin-page">
    <AdminHeader kicker="Catalog" title="Категории"
      description="Создание, редактирование и удаление товарных категорий" />

    <div class="admin-stack">
      <section class="admin-card">
        <div class="admin-card-header">
          <div>
            <h2 class="admin-card-heading">Новая категория</h2>
            <p class="admin-card-copy">Категорию можно также создать прямо из формы товара</p>
          </div>
          <FolderPlus />
        </div>
        <form class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]" @submit.prevent="createCategory">
          <input v-model="newName" placeholder="Например, Смартфоны" />
          <button class="admin-button-primary" type="submit" :disabled="saving">
            <FolderPlus />
            {{ saving ? "Создание..." : "Создать категорию" }}
          </button>
        </form>
      </section>

      <section class="admin-card">
        <div class="admin-card-header">
          <div>
            <h2 class="admin-card-heading">Все категории</h2>
            <p class="admin-card-copy">{{ categories.length }} записей</p>
          </div>
        </div>
        <div>
          <div v-if="pending" class="admin-loading">Загружаю категории...</div>
          <div v-else-if="categories.length">
            <div class="admin-data-list">
              <div class="admin-data-header lg:grid-cols-[90px_minmax(220px,1fr)_minmax(120px,auto)]">
                <span>ID</span>
                <span>Название</span>
                <span>Действия</span>
              </div>
              <article v-for="category in categories" :key="category.id"
                class="admin-data-row lg:grid-cols-[90px_minmax(220px,1fr)_minmax(120px,auto)]">
                <div class="admin-data-cell">
                  <div class="admin-cell-label">ID</div>
                  <div class="admin-cell-value">#{{ category.id }}</div>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Название</div>
                  <input v-if="editingId === category.id" v-model="editingName"
                    @keydown.enter.prevent="saveEdit(category.id)" />
                  <strong v-else class="text-sm text-stone-950 dark:text-white">{{ category.name }}</strong>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Действия</div>
                  <div class="admin-actions-row">
                    <template v-if="editingId === category.id">
                      <button class="admin-icon-action" type="button" title="Сохранить"
                        @click="saveEdit(category.id)">
                        <Check />
                      </button>
                      <button class="admin-icon-action" type="button" title="Отмена" @click="editingId = null">
                        <X />
                      </button>
                    </template>
                    <template v-else>
                      <button class="admin-icon-action" type="button" title="Редактировать" @click="startEdit(category)">
                        <Pencil />
                      </button>
                      <button class="admin-icon-danger" type="button" title="Удалить"
                        @click="deleteCategory(category)">
                        <Trash2 />
                      </button>
                    </template>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <div v-else class="admin-empty">Категорий пока нет</div>
        </div>
      </section>
    </div>
  </div>
</template>
