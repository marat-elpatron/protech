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
    <AdminHeader kicker="Catalog" title="Атрибуты" description="Справочник характеристик для карточек товаров" />

    <div>
      <section>
        <div>
          <div>
            <h2>Новый атрибут</h2>
            <p>Например: объем памяти, диагональ, мощность</p>
          </div>
          <Tags />
        </div>
        <form @submit.prevent="createAttribute">
          <div>
            <label for="attribute-name">Название</label>
            <input id="attribute-name" v-model="form.name" placeholder="Мощность" />
          </div>
          <div>
            <label for="attribute-unit">Единица измерения</label>
            <input id="attribute-unit" v-model="form.unit" placeholder="Вт" />
          </div>
          <div>
            <button type="submit" :disabled="saving">
              <Plus />
              {{ saving ? "Создание..." : "Создать" }}
            </button>
          </div>
        </form>
      </section>

      <section>
        <div>
          <div>
            <h2>Все атрибуты</h2>
            <p>{{ attributes.length }} записей</p>
          </div>
        </div>
        <div>
          <div v-if="pending">Загружаю атрибуты...</div>
          <div v-else-if="attributes.length">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Единица</th>
                  <th>В товарах</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="attribute in attributes" :key="attribute.id">
                  <td>{{ attribute.id }}</td>
                  <td>
                    <input v-if="editingId === attribute.id" v-model="editing.name"
                      @keydown.enter.prevent="saveEdit(attribute.id)" />
                    <strong v-else>{{ attribute.name }}</strong>
                  </td>
                  <td>
                    <input v-if="editingId === attribute.id" v-model="editing.unit"
                      @keydown.enter.prevent="saveEdit(attribute.id)" />
                    <span v-else>{{ attribute.unit || "—" }}</span>
                  </td>
                  <td>{{ attribute._count.productAttributes }}</td>
                  <td>
                    <div>
                      <template v-if="editingId === attribute.id">
                        <button type="button" title="Сохранить" @click="saveEdit(attribute.id)">
                          <Check />
                        </button>
                        <button type="button" title="Отмена" @click="editingId = null">
                          <X />
                        </button>
                      </template>
                      <template v-else>
                        <button type="button" title="Редактировать" @click="startEdit(attribute)">
                          <Pencil />
                        </button>
                        <button type="button" title="Удалить" @click="deleteAttribute(attribute)">
                          <Trash2 />
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else>Атрибутов пока нет</div>
        </div>
      </section>
    </div>
  </div>
</template>
