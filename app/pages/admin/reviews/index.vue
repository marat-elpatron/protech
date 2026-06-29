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
  <div>
    <AdminHeader
      kicker="Community"
      title="Отзывы"
      description="Отвечайте покупателям и закрывайте отзывы без ответа"
    />

    <div class="admin-content stack-lg">
      <section class="panel">
        <div class="panel-body toolbar">
          <div class="segmented">
            <button type="button" :class="{ active: !pendingOnly }" @click="pendingOnly = false">Все отзывы</button>
            <button type="button" :class="{ active: pendingOnly }" @click="pendingOnly = true">Без ответа</button>
          </div>
        </div>
      </section>

      <div v-if="pending" class="empty-state">Загружаю отзывы...</div>
      <div v-else-if="reviews?.items.length" class="review-grid">
        <article v-for="review in reviews.items" :key="review.id" class="review-card">
          <div class="panel-header">
            <div class="entity-cell">
              <img class="thumb" :src="review.product.mainImage" :alt="review.product.name" />
              <div>
                <h2 class="panel-title">{{ review.product.name }}</h2>
                <p class="panel-description">
                  {{ review.user.name || review.user.email }} · {{ formatDate(review.createdAt) }}
                </p>
              </div>
            </div>
            <div class="toolbar" style="justify-content: flex-end">
              <span class="badge badge-amber">
                <Star style="width: 14px; height: 14px; margin-right: 5px; fill: currentColor" />
                {{ review.rating }}/5
              </span>
              <AdminStatusBadge :status="review.isAnswered" type="answer" />
            </div>
          </div>

          <div class="review-card-body">
            <div class="form-grid">
              <div v-if="review.advantages" class="answer-box">
                <strong>Плюсы:</strong>
                <div>{{ review.advantages }}</div>
              </div>
              <div v-if="review.disadvantages" class="answer-box">
                <strong>Минусы:</strong>
                <div>{{ review.disadvantages }}</div>
              </div>
            </div>

            <div v-if="review.comment" class="answer-box">
              <strong>Комментарий:</strong>
              <div>{{ review.comment }}</div>
            </div>

            <div v-if="review.reviewPhotos.length" class="media-grid">
              <img v-for="photo in review.reviewPhotos" :key="photo.id" class="thumb thumb-lg" :src="photo.url" alt="" />
            </div>

            <div v-if="review.reviewAnswers.length" class="stack">
              <div v-for="answer in review.reviewAnswers" :key="answer.id" class="answer-box">
                <strong>{{ answer.user?.name || "Администратор" }}</strong>
                <div style="margin-top: 6px">{{ answer.text }}</div>
              </div>
            </div>

            <form class="stack" @submit.prevent="answerReview(review)">
              <textarea v-model="answers[review.id]" class="textarea" rows="4" placeholder="Ответ администратора" />
              <div class="toolbar" style="justify-content: flex-end">
                <button class="btn btn-primary" type="submit" :disabled="sending === review.id">
                  <Send />
                  {{ sending === review.id ? "Отправка..." : "Ответить" }}
                </button>
              </div>
            </form>
          </div>
        </article>

        <div v-if="reviews.pagination.pages > 1" class="pagination">
          <button class="btn btn-secondary" type="button" :disabled="page <= 1" @click="page--">Назад</button>
          <span class="muted">Страница {{ reviews.pagination.page }} из {{ reviews.pagination.pages }}</span>
          <button class="btn btn-secondary" type="button" :disabled="page >= reviews.pagination.pages" @click="page++">Вперед</button>
        </div>
      </div>

      <div v-else class="empty-state">
        <MessageSquareReply style="width: 32px; height: 32px; margin-bottom: 8px" />
        Отзывов для выбранного фильтра нет
      </div>
    </div>
  </div>
</template>
