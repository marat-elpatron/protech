<script setup lang="ts">
import { toast } from "vue-sonner";
import { MessageSquare, Star, Send } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReviewItem } from "@/composables/useAdminApi";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useAdminApi();
const tab = ref("pending");
const page = ref(1);
const answerDialog = ref<ReviewItem | null>(null);
const answerText = ref("");
const loading = ref(false);

const { data, pending, refresh } = await useAsyncData(
  "reviews",
  () =>
    api.getReviews({
      page: page.value,
      pending: tab.value === "pending",
    }),
  { watch: [page, tab] },
);

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function openAnswer(review: ReviewItem) {
  answerDialog.value = review;
  answerText.value = "";
}

async function submitAnswer() {
  if (!answerDialog.value || !answerText.value.trim()) {
    toast.error("Введите текст ответа");
    return;
  }
  loading.value = true;
  try {
    await api.answerReview(answerDialog.value.id, answerText.value);
    toast.success("Ответ опубликован");
    answerDialog.value = null;
    await refresh();
  } catch {
    toast.error("Не удалось отправить ответ");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <AdminHeader
      title="Отзывы"
      description="Модерация и ответы на отзывы покупателей"
      :breadcrumbs="[{ label: 'Admin', href: '/admin' }, { label: 'Отзывы' }]"
    />

    <div class="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <Tabs v-model="tab" @update:model-value="page = 1">
        <TabsList>
          <TabsTrigger value="pending">Без ответа</TabsTrigger>
          <TabsTrigger value="all">Все</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" class="mt-4 space-y-4">
          <div v-if="pending" class="space-y-3">
            <Skeleton v-for="i in 3" :key="i" class="h-32 rounded-xl" />
          </div>
          <template v-else-if="data?.items.length">
            <Card v-for="review in data.items" :key="review.id">
              <CardContent class="p-4">
                <div class="flex gap-4">
                  <img :src="review.product.mainImage" class="size-16 rounded-lg object-cover" />
                  <div class="flex-1 space-y-2">
                    <div class="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p class="font-medium">{{ review.product.name }}</p>
                        <p class="text-sm text-muted-foreground">{{ review.user.name || review.user.email }}</p>
                      </div>
                      <div class="flex items-center gap-2">
                        <Badge v-if="review.isAnswered" variant="outline">Отвечен</Badge>
                        <Badge v-else variant="secondary">Без ответа</Badge>
                        <div class="flex">
                          <Star v-for="i in review.rating" :key="i" class="size-3.5 fill-amber-400 text-amber-400" />
                        </div>
                      </div>
                    </div>
                    <p v-if="review.comment" class="text-sm">{{ review.comment }}</p>
                    <p v-if="review.advantages" class="text-xs text-emerald-600">+ {{ review.advantages }}</p>
                    <p v-if="review.disadvantages" class="text-xs text-destructive">− {{ review.disadvantages }}</p>
                    <div v-if="review.reviewAnswers.length" class="rounded-lg bg-muted p-3 text-sm">
                      <p class="mb-1 font-medium text-primary">Ответ магазина:</p>
                      <p>{{ review.reviewAnswers[0].text }}</p>
                    </div>
                    <div class="flex items-center justify-between pt-1">
                      <span class="text-xs text-muted-foreground">{{ formatDate(review.createdAt) }}</span>
                      <Button v-if="!review.isAnswered" size="sm" @click="openAnswer(review)">
                        <Send class="size-3.5" />
                        Ответить
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </template>
          <div v-else class="flex flex-col items-center gap-3 py-16">
            <MessageSquare class="size-12 text-muted-foreground/40" />
            <p class="text-muted-foreground">Отзывов не найдено</p>
          </div>
        </TabsContent>

        <TabsContent value="all" class="mt-4 space-y-4">
          <div v-if="pending" class="space-y-3">
            <Skeleton v-for="i in 3" :key="i" class="h-32 rounded-xl" />
          </div>
          <template v-else-if="data?.items.length">
            <Card v-for="review in data.items" :key="review.id">
              <CardContent class="p-4">
                <div class="flex gap-4">
                  <img :src="review.product.mainImage" class="size-16 rounded-lg object-cover" />
                  <div class="flex-1 space-y-2">
                    <div class="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p class="font-medium">{{ review.product.name }}</p>
                        <p class="text-sm text-muted-foreground">{{ review.user.name || review.user.email }}</p>
                      </div>
                      <Badge :variant="review.isAnswered ? 'outline' : 'secondary'">
                        {{ review.isAnswered ? "Отвечен" : "Без ответа" }}
                      </Badge>
                    </div>
                    <p v-if="review.comment" class="text-sm">{{ review.comment }}</p>
                    <div v-if="review.reviewAnswers.length" class="rounded-lg bg-muted p-3 text-sm">
                      <p>{{ review.reviewAnswers[0].text }}</p>
                    </div>
                    <div class="flex items-center justify-between pt-1">
                      <span class="text-xs text-muted-foreground">{{ formatDate(review.createdAt) }}</span>
                      <Button v-if="!review.isAnswered" size="sm" variant="outline" @click="openAnswer(review)">
                        Ответить
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </template>
          <div v-else class="flex flex-col items-center gap-3 py-16">
            <MessageSquare class="size-12 text-muted-foreground/40" />
            <p class="text-muted-foreground">Отзывов не найдено</p>
          </div>
        </TabsContent>
      </Tabs>

      <div v-if="data && data.pagination.pages > 1" class="flex justify-center gap-2">
        <Button variant="outline" size="sm" :disabled="page <= 1" @click="page--">Назад</Button>
        <span class="flex items-center px-3 text-sm text-muted-foreground">{{ page }} / {{ data.pagination.pages }}</span>
        <Button variant="outline" size="sm" :disabled="page >= data.pagination.pages" @click="page++">Далее</Button>
      </div>
    </div>

    <Dialog :open="!!answerDialog" @update:open="answerDialog = null">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ответ на отзыв</DialogTitle>
        </DialogHeader>
        <div v-if="answerDialog" class="space-y-4">
          <div class="rounded-lg bg-muted p-3 text-sm">
            <p class="font-medium">{{ answerDialog.product.name }}</p>
            <p v-if="answerDialog.comment" class="mt-1 text-muted-foreground">{{ answerDialog.comment }}</p>
          </div>
          <div class="space-y-2">
            <Label>Ваш ответ</Label>
            <Textarea v-model="answerText" rows="4" placeholder="Спасибо за отзыв..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="answerDialog = null">Отмена</Button>
          <Button :disabled="loading" @click="submitAnswer">
            <Send class="size-4" />
            {{ loading ? "Отправка..." : "Отправить" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
