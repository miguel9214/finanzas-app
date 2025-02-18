<template>
    <div class="container mt-4">
      <h2>Categorías</h2>
      <button class="btn btn-success" @click="nuevaCategoria">Nueva Categoría</button>
      <ul class="list-group mt-3">
        <li v-for="categoria in categorias" :key="categoria.id" class="list-group-item">
          {{ categoria.nombre }} - <span class="badge bg-info">{{ categoria.tipo }}</span>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import Swal from 'sweetalert2';
  
  const categorias = ref([]);
  
  const cargarCategorias = async () => {
    try {
      const res = await fetch("https://finanzasbackend-production.up.railway.app/api/categories");
      categorias.value = await res.json();
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };
  
  const nuevaCategoria = async () => {
    const { value: nombre } = await Swal.fire({
      title: 'Nueva Categoría',
      input: 'text',
      showCancelButton: true,
    });
  
    if (!nombre) return;
  
    const { value: tipo } = await Swal.fire({
      title: 'Selecciona el tipo',
      input: 'select',
      inputOptions: { ingreso: 'Ingreso', gasto: 'Gasto' },
      inputPlaceholder: 'Selecciona un tipo',
      showCancelButton: true,
    });
  
    if (!tipo) return;
  
    try {
      await fetch("https://finanzasbackend-production.up.railway.app/api/categories", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, tipo }),
      });
  
      Swal.fire('¡Categoría creada!', '', 'success');
      cargarCategorias();
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      Swal.fire('Error', 'No se pudo agregar la categoría', 'error');
    }
  };
  
  onMounted(() => cargarCategorias());
  </script>
  