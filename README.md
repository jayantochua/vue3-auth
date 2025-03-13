# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).



npm init vue@latest .
nvm use 18.18.0
npm install axios
npm install vue-router@4 pinia

npm install --save-dev @types/node
npm install --save-dev @vue/runtime-dom

----

Untuk membuat project baru di folder Windows dengan lokasi `E:\Vue3\vue-auth-example`, Anda perlu melakukan langkah-langkah berikut:

1. Buka Command Prompt (cmd) atau PowerShell
   - Tekan `Win + R`, ketik `cmd` dan tekan Enter
   - Atau cari "PowerShell" di menu Start

2. Pertama, pindah ke drive E: dengan perintah:
   ```
   E:
   ```

3. Buat folder jika belum ada:
   ```
   mkdir E:\Vue3
   ```

4. Navigasi ke folder Vue3:
   ```
   cd E:\Vue3
   ```

5. Di dalam folder ini, jalankan perintah:
   ```
   npm init vue@latest
   ```

6. Ketika ditanya untuk nama project, masukkan `vue-auth-example` atau Anda bisa langsung membuat dengan nama tersebut:
   ```
   npm init vue@latest vue-auth-example
   ```

7. Jawab pertanyaan-pertanyaan selama setup sesuai yang disebutkan:
   - Project name: vue-auth-example
   - Add TypeScript? No
   - Add JSX Support? No
   - Add Vue Router for Single Page Application development? Yes
   - Add Pinia for state management? Yes
   - Add Vitest for Unit Testing? No
   - Add an End-to-End Testing Solution? No
   - Add ESLint for code quality? No
   - Add Prettier for code formatting? No

8. Setelah proses selesai, masuk ke folder project yang baru dibuat:
   ```
   cd vue-auth-example
   ```

9. Install dependensi:
   ```
   npm install
   ```

10. Salin file-file yang telah dibuat sebelumnya ke struktur folder yang sesuai di `E:\Vue3\vue-auth-example\src\`

11. Jalankan aplikasi:
    ```
    npm run dev
    ```

Dengan demikian, project Vue.js dengan autentikasi dan protected routes akan dibuat dan berjalan di lokasi `E:\Vue3\vue-auth-example`.