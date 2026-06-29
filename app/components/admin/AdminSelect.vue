<script setup lang="ts">
import { Check, ChevronDown } from "@lucide/vue";
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "reka-ui";

export type AdminSelectOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: AdminSelectOption[];
    placeholder?: string;
    disabled?: boolean;
    ariaLabel?: string;
  }>(),
  {
    placeholder: "Выберите значение",
    disabled: false,
    ariaLabel: undefined,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

function updateValue(value: unknown) {
  emit("update:modelValue", String(value ?? ""));
}
</script>

<template>
  <SelectRoot :model-value="modelValue" :disabled="disabled" @update:model-value="updateValue">
    <SelectTrigger :aria-label="ariaLabel || placeholder">
      <SelectValue :placeholder="placeholder" />
      <SelectIcon as-child>
        <ChevronDown />
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent position="popper" :side-offset="8">
        <SelectViewport>
          <SelectItem v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">
            <SelectItemText>
              <span>
                <span>{{ option.label }}</span>
                <small v-if="option.description">{{ option.description }}</small>
              </span>
            </SelectItemText>
            <SelectItemIndicator>
              <Check />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
