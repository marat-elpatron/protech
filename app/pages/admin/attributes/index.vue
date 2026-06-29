<script setup lang="ts">
import { Check, Pencil, Plus, Tags, Trash2, X } from "@lucide/vue";
import { toast } from "vue-sonner";
import type { AttributeItem } from "@/composables/useAdminApi";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();
const form = reactive({ name: "", unit: "" });
const saving = ref(false);
const editingId = ref<number | null>(null);
const editing = reactive({ name: "", unit: "" });

const { data: attributes, pending, refresh } = await useAsyncData("admin-attributes", () => api.getAttributes(), {
  default: () => [] as AttributeItem[],
});

async function createAttribute() {
  if (!form.name.trim()) {
    toast.error("Введите название атрибута");
    return;
  }

  saving.value = true;
  try {
    await api.createAttribute({ name: form.name.trim(), unit: form.unit.trim() });
    form.name = "";
    form.unit = "";
    await refresh();
    toast.success("Атрибут создан");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось создать атрибут");
  } finally {
    saving.value = false;
  }
}

function startEdit(attribute: AttributeItem) {
  editingId.value = attribute.id;
  editing.name = attribute.name;
  editing.unit = attribute.unit;
}

async function saveEdit(attributeId: number) {
  if (!editing.name.trim()) {
    toast.error("Название не может быть пустым");
    return;
  }

  try {
    await api.updateAttribute(attributeId, {
      name: editing.name.trim(),
      unit: editing.unit.trim(),
    });
    editingId.value = null;
    await refresh();
    toast.success("Атрибут обновлен");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось обновить атрибут");
  }
}

async function deleteAttribute(attribute: AttributeItem) {
  if (!confirm(`Удалить атрибут "${attribute.name}"?`)) return;

  try {
    await api.deleteAttribute(attribute.id);
    await refresh();
    toast.success("Атрибут удален");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось удалить атрибут");
  }
}
</script>

<template>
  <div class="admin-page">
    <AdminHeader kicker="Catalog" title="Атрибуты" description="Справочник характеристик для карточек товаров" />

    <div class="admin-stack">
      <section class="admin-card">
        <div class="admin-card-header">
          <div>
            <h2 class="admin-card-heading">Новый атрибут</h2>
            <p class="admin-card-copy">Например: объем памяти, диагональ, мощность</p>
          </div>
          <Tags />
        </div>
        <form class="grid gap-4 lg:grid-cols-[minmax(180px,1fr)_minmax(160px,0.7fr)_auto] lg:items-end"
          @submit.prevent="createAttribute">
          <div class="admin-field">
            <label for="attribute-name">Название</label>
            <input id="attribute-name" v-model="form.name" placeholder="Мощность" />
          </div>
          <div class="admin-field">
            <label for="attribute-unit">Единица измерения</label>
            <input id="attribute-unit" v-model="form.unit" placeholder="Вт" />
          </div>
          <div>
            <button class="admin-button-primary w-full lg:w-auto" type="submit" :disabled="saving">
              <Plus />
              {{ saving ? "Создание..." : "Создать" }}
            </button>
          </div>
        </form>
      </section>

      <section class="admin-card">
        <div class="admin-card-header">
          <div>
            <h2 class="admin-card-heading">Все атрибуты</h2>
            <p class="admin-card-copy">{{ attributes.length }} записей</p>
          </div>
        </div>
        <div>
          <div v-if="pending" class="admin-loading">Загружаю атрибуты...</div>
          <div v-else-if="attributes.length">
            <div class="admin-data-list">
              <div
                class="admin-data-header lg:grid-cols-[90px_minmax(200px,1fr)_minmax(130px,0.7fr)_minmax(100px,0.6fr)_minmax(130px,auto)]">
                <span>ID</span>
                <span>Название</span>
                <span>Единица</span>
                <span>В товарах</span>
                <span>Действия</span>
              </div>
              <article v-for="attribute in attributes" :key="attribute.id"
                class="admin-data-row lg:grid-cols-[90px_minmax(200px,1fr)_minmax(130px,0.7fr)_minmax(100px,0.6fr)_minmax(130px,auto)]">
                <div class="admin-data-cell">
                  <div class="admin-cell-label">ID</div>
                  <div class="admin-cell-value">#{{ attribute.id }}</div>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Название</div>
                  <input v-if="editingId === attribute.id" v-model="editing.name"
                    @keydown.enter.prevent="saveEdit(attribute.id)" />
                  <strong v-else class="text-sm text-stone-950 dark:text-white">{{ attribute.name }}</strong>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Единица</div>
                  <input v-if="editingId === attribute.id" v-model="editing.unit"
                    @keydown.enter.prevent="saveEdit(attribute.id)" />
                  <span v-else class="admin-cell-value">{{ attribute.unit || "—" }}</span>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">В товарах</div>
                  <span class="badge-green">{{ attribute._count.productAttributes }}</span>
                </div>
                <div class="admin-data-cell">
                  <div class="admin-cell-label">Действия</div>
                  <div class="admin-actions-row">
                    <template v-if="editingId === attribute.id">
                      <button class="admin-icon-action" type="button" title="Сохранить"
                        @click="saveEdit(attribute.id)">
                        <Check />
                      </button>
                      <button class="admin-icon-action" type="button" title="Отмена" @click="editingId = null">
                        <X />
                      </button>
                    </template>
                    <template v-else>
                      <button class="admin-icon-action" type="button" title="Редактировать"
                        @click="startEdit(attribute)">
                        <Pencil />
                      </button>
                      <button class="admin-icon-danger" type="button" title="Удалить"
                        @click="deleteAttribute(attribute)">
                        <Trash2 />
                      </button>
                    </template>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <div v-else class="admin-empty">Атрибутов пока нет</div>
        </div>
      </section>
    </div>
  </div>
</template>
