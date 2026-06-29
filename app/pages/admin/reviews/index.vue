<script setup lang="ts">
import { MessageSquareReply, Send, Star } from "@lucide/vue";
import { toast } from "vue-sonner";
import { formatDate } from "@/utils/adminFormat";
import type { ReviewItem } from "@/composables/useAdminApi";

definePageMeta({ layout: "admin", middleware: "admin" });

const route = useRoute();
const api = useAdminApi();
const pendingOnly = ref(route.query.pending === "true");
const page = ref(1);
const answers = reactive<Record<number, string>>({});
const sending = ref<number | null>(null);

const query = computed(() => ({
  page: page.value,
  pending: pendingOnly.value ? true : undefined,
}));

watch(pendingOnly, () => {
  page.value = 1;
});

const { data: reviews, pending, refresh } = await useAsyncData("admin-reviews", () => api.getReviews(query.value), {
  watch: [query],
});

async function answerReview(review: ReviewItem) {
  const text = answers[review.id]?.trim();
  if (!text) {
    toast.error("Введите ответ на отзыв");
    return;
  }

  sending.value = review.id;
  try {
    await api.answerReview(review.id, text);
    answers[review.id] = "";
    await refresh();
    toast.success("Ответ опубликован");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Не удалось отправить ответ");
  } finally {
    sending.value = null;
  }
}
</script>

<template>
  <div class="admin-page">
    <AdminHeader kicker="Community" title="Отзывы" description="Отвечайте покупателям и закрывайте отзывы без ответа" />

    <div class="admin-stack">
      <section class="admin-filter-bar">
        <div class="admin-segmented">
            <button type="button" :class="{ active: !pendingOnly }" @click="pendingOnly = false">Все отзывы</button>
            <button type="button" :class="{ active: pendingOnly }" @click="pendingOnly = true">Без ответа</button>
        </div>
      </section>

      <div v-if="pending" class="admin-loading">Загружаю отзывы...</div>
      <div v-else-if="reviews?.items.length" class="space-y-5">
        <article v-for="review in reviews.items" :key="review.id" class="admin-message-card">
          <div class="admin-message-head">
            <div class="admin-product-cell">
              <img class="admin-product-image" :src="review.product.mainImage" :alt="review.product.name" />
              <div>
                <h2 class="admin-card-heading">{{ review.product.name }}</h2>
                <p class="admin-card-copy">
                  {{ review.user.name || review.user.email }} · {{ formatDate(review.createdAt) }}
                </p>
              </div>
            </div>
            <div class="admin-actions-row">
              <span class="badge-amber gap-1.5">
                <Star />
                {{ review.rating }}/5
              </span>
              <AdminStatusBadge :status="review.isAnswered" type="answer" />
            </div>
          </div>

          <div class="admin-message-body">
            <div class="grid gap-4 md:grid-cols-2">
              <div v-if="review.advantages" class="admin-note">
                <strong>Плюсы:</strong>
                <div>{{ review.advantages }}</div>
              </div>
              <div v-if="review.disadvantages" class="admin-note">
                <strong>Минусы:</strong>
                <div>{{ review.disadvantages }}</div>
              </div>
            </div>

            <div v-if="review.comment" class="admin-note">
              <strong>Комментарий:</strong>
              <div>{{ review.comment }}</div>
            </div>

            <div v-if="review.reviewPhotos.length" class="admin-photo-strip">
              <img v-for="photo in review.reviewPhotos" :key="photo.id" :src="photo.url" alt="" />
            </div>

            <div v-if="review.reviewAnswers.length" class="space-y-3">
              <div v-for="answer in review.reviewAnswers" :key="answer.id" class="admin-answer">
                <strong>{{ answer.user?.name || "Администратор" }}</strong>
                <div>{{ answer.text }}</div>
              </div>
            </div>

            <form class="space-y-3" @submit.prevent="answerReview(review)">
              <textarea v-model="answers[review.id]" rows="4" placeholder="Ответ администратора" />
              <div class="flex justify-end">
                <button class="admin-button-primary" type="submit" :disabled="sending === review.id">
                  <Send />
                  {{ sending === review.id ? "Отправка..." : "Ответить" }}
                </button>
              </div>
            </form>
          </div>
        </article>

        <div v-if="reviews.pagination.pages > 1" class="admin-pagination">
          <button class="admin-button-secondary" type="button" :disabled="page <= 1" @click="page--">Назад</button>
          <span>Страница {{ reviews.pagination.page }} из {{ reviews.pagination.pages }}</span>
          <button class="admin-button-secondary" type="button" :disabled="page >= reviews.pagination.pages"
            @click="page++">Вперед</button>
        </div>
      </div>

      <div v-else class="admin-empty">
        <MessageSquareReply />
        Отзывов для выбранного фильтра нет
      </div>
    </div>
  </div>
</template>
