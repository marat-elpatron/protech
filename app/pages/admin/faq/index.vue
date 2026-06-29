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
  <div>
    <AdminHeader
      kicker="Support"
      title="FAQ"
      description="Отвечайте на вопросы покупателей в разделе вопросов и ответов"
    />

    <div class="admin-content stack-lg">
      <section class="panel">
        <div class="panel-body toolbar">
          <div class="segmented">
            <button type="button" :class="{ active: !pendingOnly }" @click="pendingOnly = false">Все вопросы</button>
            <button type="button" :class="{ active: pendingOnly }" @click="pendingOnly = true">Без ответа</button>
          </div>
        </div>
      </section>

      <div v-if="pending" class="empty-state">Загружаю вопросы...</div>
      <div v-else-if="faq?.items.length" class="question-grid">
        <article v-for="question in faq.items" :key="question.id" class="question-card">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">{{ question.title }}</h2>
              <p class="panel-description">
                {{ question.user.name || question.user.email }} · {{ formatDate(question.createdAt) }}
              </p>
            </div>
            <AdminStatusBadge :status="question.isAnswered" type="answer" />
          </div>

          <div class="question-card-body">
            <div class="answer-box">
              <strong>Вопрос:</strong>
              <div style="margin-top: 6px">{{ question.comment }}</div>
            </div>

            <div v-if="question.shopQuestionImages.length" class="media-grid">
              <img
                v-for="image in question.shopQuestionImages"
                :key="image.id"
                class="thumb thumb-lg"
                :src="image.url"
                alt=""
              />
            </div>

            <div v-if="question.shopAnswers.length" class="stack">
              <div v-for="answer in question.shopAnswers" :key="answer.id" class="answer-box">
                <strong>{{ answer.user?.name || "Администратор" }}</strong>
                <div style="margin-top: 6px">{{ answer.comment }}</div>
              </div>
            </div>

            <form class="stack" @submit.prevent="answerQuestion(question)">
              <textarea v-model="answers[question.id]" class="textarea" rows="4" placeholder="Ответ на вопрос" />
              <div class="toolbar" style="justify-content: flex-end">
                <button class="btn btn-primary" type="submit" :disabled="sending === question.id">
                  <Send />
                  {{ sending === question.id ? "Отправка..." : "Ответить" }}
                </button>
              </div>
            </form>
          </div>
        </article>

        <div v-if="faq.pagination.pages > 1" class="pagination">
          <button class="btn btn-secondary" type="button" :disabled="page <= 1" @click="page--">Назад</button>
          <span class="muted">Страница {{ faq.pagination.page }} из {{ faq.pagination.pages }}</span>
          <button class="btn btn-secondary" type="button" :disabled="page >= faq.pagination.pages" @click="page++">Вперед</button>
        </div>
      </div>

      <div v-else class="empty-state">
        <HelpCircle style="width: 32px; height: 32px; margin-bottom: 8px" />
        Вопросов для выбранного фильтра нет
      </div>
    </div>
  </div>
</template>
