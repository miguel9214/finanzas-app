<template>
  <!-- Navbar -->
  <Navbar />

  <!-- Contenido principal -->
  <main class="container mt-4">
    <router-view />
  </main>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
</script>

<style>
/* Estilos globales */
body {
  font-family: 'Arial', sans-serif;
  background-color: #f8f9fa;
}
</style>