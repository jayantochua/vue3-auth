<!-- src/components/FormDialog.vue -->
<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "Form Dialog"
  },
  initialData: {
    type: Object,
    default: () => ({
      name: "",
      email: "",
      message: ""
    })
  },
  onClose: {
    type: Function,
    required: true
  }
});

const formData = ref({
  name: props.initialData.name || "",
  email: props.initialData.email || "",
  message: props.initialData.message || ""
});

const isValid = ref(true);
const errorMessage = ref("");

function validateForm() {
  isValid.value = true;
  errorMessage.value = "";

  if (!formData.value.name) {
    isValid.value = false;
    errorMessage.value = "Nama harus diisi";
    return false;
  }

  if (!formData.value.email) {
    isValid.value = false;
    errorMessage.value = "Email harus diisi";
    return false;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) {
    isValid.value = false;
    errorMessage.value = "Format email tidak valid";
    return false;
  }

  return true;
}

function submitForm() {
  if (validateForm()) {
    props.onClose(true, formData.value);
  }
}

function cancel() {
  props.onClose(false);
}
</script>

<template>
  <div class="form-dialog">
    <div class="dialog-header">
      <h3>{{ title }}</h3>
    </div>

    <div class="dialog-body">
      <div class="error-message" v-if="!isValid">{{ errorMessage }}</div>

      <div class="form-group">
        <label for="name">Nama</label>
        <input id="name" v-model="formData.name" type="text" placeholder="Masukkan nama Anda" />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="formData.email" type="email" placeholder="Masukkan email Anda" />
      </div>

      <div class="form-group">
        <label for="message">Pesan</label>
        <textarea
          id="message"
          v-model="formData.message"
          rows="4"
          placeholder="Masukkan pesan Anda"
        ></textarea>
      </div>
    </div>

    <div class="dialog-footer">
      <button class="btn-cancel" @click="cancel">Batal#</button>
      <button class="btn-submit" @click="submitForm">Send</button>
    </div>
  </div>
</template>

<style scoped>
.form-dialog {
  width: 100%;
  min-width: 400px;
  max-width: 500px;
}

.dialog-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.dialog-body {
  padding: 20px;
}

.error-message {
  padding: 10px;
  margin-bottom: 15px;
  background-color: #fed7d7;
  color: #c53030;
  border-radius: 4px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 94%;

  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.btn-cancel {
  background-color: #f2f2f2;
  color: #333;
}

.btn-submit {
  background-color: #3490dc;
  color: white;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

.btn-submit:hover {
  background-color: #2779bd;
}
</style>