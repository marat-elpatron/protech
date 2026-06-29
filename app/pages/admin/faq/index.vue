<script setup lang="ts">
import { HelpCircle, Send } from "@lucide/vue";
import { toast } from "vue-sonner";
import { formatDate } from "@/utils/adminFormat";
import type { FaqItem } from "@/composables/useAdminApi";

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

const { data: faq, pending, refresh } = await useAsyncData("admin-faq", () => api.getFaq(query.value), {
  watch: [query],
});

async function answerQuestion(question: FaqItem) {
  const comment = answers[question.id]?.trim();
  if (!comment) {
    toast.error("Введите ответ на вопрос");
    return;
  }

  sending.value = question.id;
  try {
    await api.answerFaq(question.id, comment);
    answers[question.id] = "";
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
    <AdminHeader kicker="Support" title="FAQ"
      description="Отвечайте на вопросы покупателей в разделе вопросов и ответов" />

    <div class="admin-stack">
      <section class="admin-filter-bar">
        <div class="admin-segmented">
            <button type="button" :class="{ active: !pendingOnly }" @click="pendingOnly = false">Все вопросы</button>
            <button type="button" :class="{ active: pendingOnly }" @click="pendingOnly = true">Без ответа</button>
        </div>
      </section>

      <div v-if="pending" class="admin-loading">Загружаю вопросы...</div>
      <div v-else-if="faq?.items.length" class="space-y-5">
        <article v-for="question in faq.items" :key="question.id" class="admin-message-card">
          <div class="admin-message-head">
            <div>
              <h2 class="admin-card-heading">{{ question.title }}</h2>
              <p class="admin-card-copy">
                {{ question.user.name || question.user.email }} · {{ formatDate(question.createdAt) }}
              </p>
            </div>
            <AdminStatusBadge :status="question.isAnswered" type="answer" />
          </div>

          <div class="admin-message-body">
            <div class="admin-note">
              <strong>Вопрос:</strong>
              <div>{{ question.comment }}</div>
            </div>

            <div v-if="question.shopQuestionImages.length" class="admin-photo-strip">
              <img v-for="image in question.shopQuestionImages" :key="image.id" :src="image.url" alt="" />
            </div>

            <div v-if="question.shopAnswers.length" class="space-y-3">
              <div v-for="answer in question.shopAnswers" :key="answer.id" class="admin-answer">
                <strong>{{ answer.user?.name || "Администратор" }}</strong>
                <div>{{ answer.comment }}</div>
              </div>
            </div>

            <form class="space-y-3" @submit.prevent="answerQuestion(question)">
              <textarea v-model="answers[question.id]" rows="4" placeholder="Ответ на вопрос" />
              <div class="flex justify-end">
                <button class="admin-button-primary" type="submit" :disabled="sending === question.id">
                  <Send />
                  {{ sending === question.id ? "Отправка..." : "Ответить" }}
                </button>
              </div>
            </form>
          </div>
        </article>

        <div v-if="faq.pagination.pages > 1" class="admin-pagination">
          <button class="admin-button-secondary" type="button" :disabled="page <= 1" @click="page--">Назад</button>
          <span>Страница {{ faq.pagination.page }} из {{ faq.pagination.pages }}</span>
          <button class="admin-button-secondary" type="button" :disabled="page >= faq.pagination.pages"
            @click="page++">Вперед</button>
        </div>
      </div>

      <div v-else class="admin-empty">
        <HelpCircle />
        Вопросов для выбранного фильтра нет
      </div>
    </div>
  </div>
</template>
