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
  <div>
    <AdminHeader
      kicker="Catalog"
      title="Атрибуты"
      description="Справочник характеристик для карточек товаров"
    />

    <div class="admin-content stack-lg">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Новый атрибут</h2>
            <p class="panel-description">Например: объем памяти, диагональ, мощность</p>
          </div>
          <Tags style="color: var(--admin-teal)" />
        </div>
        <form class="panel-body form-grid-3" @submit.prevent="createAttribute">
          <div class="field">
            <label for="attribute-name">Название</label>
            <input id="attribute-name" v-model="form.name" class="input" placeholder="Мощность" />
          </div>
          <div class="field">
            <label for="attribute-unit">Единица измерения</label>
            <input id="attribute-unit" v-model="form.unit" class="input" placeholder="Вт" />
          </div>
          <div class="field" style="justify-content: end">
            <button class="btn btn-primary" type="submit" :disabled="saving">
              <Plus />
              {{ saving ? "Создание..." : "Создать" }}
            </button>
          </div>
        </form>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Все атрибуты</h2>
            <p class="panel-description">{{ attributes.length }} записей</p>
          </div>
        </div>
        <div class="panel-body">
          <div v-if="pending" class="empty-state">Загружаю атрибуты...</div>
          <div v-else-if="attributes.length" class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Единица</th>
                  <th>В товарах</th>
                  <th style="width: 190px">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="attribute in attributes" :key="attribute.id">
                  <td>{{ attribute.id }}</td>
                  <td>
                    <input
                      v-if="editingId === attribute.id"
                      v-model="editing.name"
                      class="input compact"
                      @keydown.enter.prevent="saveEdit(attribute.id)"
                    />
                    <strong v-else>{{ attribute.name }}</strong>
                  </td>
                  <td>
                    <input
                      v-if="editingId === attribute.id"
                      v-model="editing.unit"
                      class="input compact"
                      @keydown.enter.prevent="saveEdit(attribute.id)"
                    />
                    <span v-else>{{ attribute.unit || "—" }}</span>
                  </td>
                  <td>{{ attribute._count.productAttributes }}</td>
                  <td>
                    <div class="toolbar" style="justify-content: flex-start">
                      <template v-if="editingId === attribute.id">
                        <button class="btn btn-soft btn-icon" type="button" title="Сохранить" @click="saveEdit(attribute.id)">
                          <Check />
                        </button>
                        <button class="btn btn-secondary btn-icon" type="button" title="Отмена" @click="editingId = null">
                          <X />
                        </button>
                      </template>
                      <template v-else>
                        <button class="btn btn-secondary btn-icon" type="button" title="Редактировать" @click="startEdit(attribute)">
                          <Pencil />
                        </button>
                        <button class="btn btn-danger btn-icon" type="button" title="Удалить" @click="deleteAttribute(attribute)">
                          <Trash2 />
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">Атрибутов пока нет</div>
        </div>
      </section>
    </div>
  </div>
</template>
