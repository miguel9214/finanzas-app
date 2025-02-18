<template>
    <div class="container mt-4">
      <h2>Movimientos</h2>
      <button class="btn btn-success" @click="nuevoMovimiento">Nuevo Movimiento</button>
      <ul class="list-group mt-3">
        <li v-for="movimiento in movimientos" :key="movimiento.id" class="list-group-item">
          {{ movimiento.descripcion }} - <span class="badge bg-primary">{{ movimiento.monto }}</span>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import Swal from 'sweetalert2';
  
  const movimientos = ref([]);
  
  const cargarMovimientos = async () => {
    try {
      const res = await fetch("https://finanzasbackend-production.up.railway.app/api/transactions");
      movimientos.value = await res.json();
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
    }
  };
  
  const nuevoMovimiento = async () => {
    const { value: descripcion } = await Swal.fire({
      title: 'Nuevo Movimiento',
      input: 'text',
      showCancelButton: true,
    });
  
    if (!descripcion) return;
  
    try {
      await fetch("https://finanzasbackend-production.up.railway.app/api/transactions", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion,
          monto: Math.floor(Math.random() * 1000), 
          categoria_id: 1, 
          fecha: new Date().toISOString().split('T')[0],
        }),
      });
  
      Swal.fire('¡Movimiento agregado!', '', 'success');
      cargarMovimientos();
    } catch (error) {
      console.error("Error al agregar movimiento:", error);
      Swal.fire('Error', 'No se pudo agregar el movimiento', 'error');
    }
  };
  
  onMounted(() => cargarMovimientos());
  </script>
  