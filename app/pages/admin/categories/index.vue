<script setup lang="ts">
import { toast } from "vue-sonner";
import { Plus, Pencil, Trash2, FolderTree } from "@lucide/vue";
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
const editingItem = ref<{ id: number; name: string } | null>(null);
const deleteItem = ref<{ id: number; name: string } | null>(null);
const loading = ref(false);
const formName = ref("");

const { data, pending, refresh } = await useAsyncData("categories", () => api.getCategories());

function openCreate() {
  editingItem.value = null;
  formName.value = "";
  dialogOpen.value = true;
}

function openEdit(item: { id: number; name: string }) {
  editingItem.value = item;
  formName.value = item.name;
  dialogOpen.value = true;
}

async function handleSave() {
  if (!formName.value.trim()) {
    toast.error("Укажите название");
    return;
  }
  loading.value = true;
  try {
    if (editingItem.value) {
      await api.updateCategory(0, editingItem.value.id, formName.value);
      toast.success("Категория обновлена");
    } else {
      await api.createCategory(formName.value);
      toast.success("Категория создана");
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
  if (!deleteItem.value) return;
  try {
    await api.deleteCategory(0, deleteItem.value.id);
    toast.success("Категория удалена");
    deleteItem.value = null;
    await refresh();
  } catch {
    toast.error("Невозможно удалить — есть привязанные товары");
  }
}
</script>

<template>
  <div>
    <AdminHeader
      title="Категории"
      description="Управление категориями каталога"
      :breadcrumbs="[{ label: 'Admin', href: '/admin' }, { label: 'Категории' }]"
    >
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
                <TableHead>ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead class="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in data" :key="item.id">
                <TableCell class="text-muted-foreground">#{{ item.id }}</TableCell>
                <TableCell class="font-medium">{{ item.name }}</TableCell>
                <TableCell>
                  <div class="flex gap-1">
                    <Button variant="ghost" size="icon" @click="openEdit(item)">
                      <Pencil class="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" @click="deleteItem = item">
                      <Trash2 class="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div v-else-if="!pending" class="flex flex-col items-center gap-3 py-16">
            <FolderTree class="size-12 text-muted-foreground/40" />
            <p class="text-muted-foreground">Категорий пока нет</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ editingItem ? "Редактировать категорию" : "Новая категория" }}</DialogTitle>
        </DialogHeader>
        <div class="space-y-2 py-2">
          <Label>Название</Label>
          <Input v-model="formName" placeholder="Смартфоны" />
        </div>
        <DialogFooter>
          <Button variant="outline" @click="dialogOpen = false">Отмена</Button>
          <Button :disabled="loading" @click="handleSave">
            {{ loading ? "Сохранение..." : "Сохранить" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog :open="!!deleteItem" @update:open="deleteItem = null">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить «{{ deleteItem?.name }}»?</AlertDialogTitle>
          <AlertDialogDescription>Категория должна быть без привязанных товаров.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="confirmDelete">
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
