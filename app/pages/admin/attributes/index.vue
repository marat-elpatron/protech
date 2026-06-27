<script setup lang="ts">
import { toast } from "vue-sonner";
import { Plus, Pencil, Trash2, Tags } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();
const dialogOpen = ref(false);
const editingId = ref<number | null>(null);
const deleteId = ref<number | null>(null);
const loading = ref(false);

const form = reactive({ name: "", unit: "" });

const { data, pending, refresh } = await useAsyncData("attributes", () => api.getAttributes());

function openCreate() {
  editingId.value = null;
  form.name = "";
  form.unit = "";
  dialogOpen.value = true;
}

function openEdit(item: { id: number; name: string; unit: string }) {
  editingId.value = item.id;
  form.name = item.name;
  form.unit = item.unit;
  dialogOpen.value = true;
}

async function handleSave() {
  if (!form.name.trim()) {
    toast.error("Укажите название");
    return;
  }
  loading.value = true;
  try {
    if (editingId.value) {
      await api.updateAttribute(editingId.value, { name: form.name, unit: form.unit });
      toast.success("Характеристика обновлена");
    } else {
      await api.createAttribute({ name: form.name, unit: form.unit });
      toast.success("Характеристика создана");
    }
    dialogOpen.value = false;
    await refresh();
  } catch {
    toast.error("Ошибка сохранения");
  } finally {
    loading.value = false;
  }
}

async function confirmDelete() {
  if (!deleteId.value) return;
  try {
    await api.deleteAttribute(deleteId.value);
    toast.success("Удалено");
    deleteId.value = null;
    await refresh();
  } catch {
    toast.error("Не удалось удалить");
  }
}
</script>

<template>
  <div>
    <AdminHeader title="Характеристики" description="Справочник атрибутов товаров"
      :breadcrumbs="[{ label: 'Admin', href: '/admin' }, { label: 'Характеристики' }]">
      <template #actions>
        <Button @click="openCreate">
          <Plus class="size-4" />
          Добавить
        </Button>
      </template>
    </AdminHeader>

    <div class="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <Card>
        <CardContent class="p-0">
          <Table v-if="data?.length">
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Единица</TableHead>
                <TableHead>Использований</TableHead>
                <TableHead class="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in data" :key="item.id">
                <TableCell class="font-medium">{{ item.name }}</TableCell>
                <TableCell class="text-muted-foreground">{{ item.unit || "—" }}</TableCell>
                <TableCell>{{ item._count.productAttributes }}</TableCell>
                <TableCell>
                  <div class="flex gap-1">
                    <Button variant="ghost" size="icon" @click="openEdit(item)">
                      <Pencil class="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" @click="deleteId = item.id">
                      <Trash2 class="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div v-else-if="!pending" class="flex flex-col items-center gap-3 py-16">
            <Tags class="size-12 text-muted-foreground/40" />
            <p class="text-muted-foreground">Характеристик пока нет</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ editingId ? "Редактировать" : "Новая характеристика" }}</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <Label>Название</Label>
            <Input v-model="form.name" placeholder="Объём памяти" />
          </div>
          <div class="space-y-2">
            <Label>Единица измерения</Label>
            <Input v-model="form.unit" placeholder="ГБ, мм, Вт..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="dialogOpen = false">Отмена</Button>
          <Button :disabled="loading" @click="handleSave">
            {{ loading ? "Сохранение..." : "Сохранить" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog :open="!!deleteId" @update:open="deleteId = null">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить характеристику?</AlertDialogTitle>
          <AlertDialogDescription>Связанные значения у товаров также будут удалены.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="confirmDelete">
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
