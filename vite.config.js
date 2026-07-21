import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Served at the custom domain root (himhims.com via CNAME), so base stays '/'.
export default defineConfig({
  plugins: [vue()],
  base: '/'
});
