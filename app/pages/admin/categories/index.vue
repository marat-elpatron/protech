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
  <div>
    <AdminHeader
      kicker="Catalog"
      title="Категории"
      description="Создание, редактирование и удаление товарных категорий"
    />

    <div class="admin-content stack-lg">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Новая категория</h2>
            <p class="panel-description">Категорию можно также создать прямо из формы товара</p>
          </div>
          <FolderPlus style="color: var(--admin-primary)" />
        </div>
        <form class="panel-body toolbar" @submit.prevent="createCategory">
          <input v-model="newName" class="input" style="max-width: 520px" placeholder="Например, Смартфоны" />
          <button class="btn btn-primary" type="submit" :disabled="saving">
            <FolderPlus />
            {{ saving ? "Создание..." : "Создать категорию" }}
          </button>
        </form>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Все категории</h2>
            <p class="panel-description">{{ categories.length }} записей</p>
          </div>
        </div>
        <div class="panel-body">
          <div v-if="pending" class="empty-state">Загружаю категории...</div>
          <div v-else-if="categories.length" class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th style="width: 190px">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="category in categories" :key="category.id">
                  <td>{{ category.id }}</td>
                  <td>
                    <input
                      v-if="editingId === category.id"
                      v-model="editingName"
                      class="input compact"
                      @keydown.enter.prevent="saveEdit(category.id)"
                    />
                    <strong v-else>{{ category.name }}</strong>
                  </td>
                  <td>
                    <div class="toolbar" style="justify-content: flex-start">
                      <template v-if="editingId === category.id">
                        <button class="btn btn-soft btn-icon" type="button" title="Сохранить" @click="saveEdit(category.id)">
                          <Check />
                        </button>
                        <button class="btn btn-secondary btn-icon" type="button" title="Отмена" @click="editingId = null">
                          <X />
                        </button>
                      </template>
                      <template v-else>
                        <button class="btn btn-secondary btn-icon" type="button" title="Редактировать" @click="startEdit(category)">
                          <Pencil />
                        </button>
                        <button class="btn btn-danger btn-icon" type="button" title="Удалить" @click="deleteCategory(category)">
                          <Trash2 />
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">Категорий пока нет</div>
        </div>
      </section>
    </div>
  </div>
</template>
