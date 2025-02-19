<template>
  <div class="container mt-4">
    <h2>Movimientos</h2>
    <button class="btn btn-success" @click="abrirModal()">Nuevo Movimiento</button>

    <ul class="list-group mt-3">
      <li v-for="movimiento in movimientos" :key="movimiento.id" class="list-group-item d-flex justify-content-between align-items-center">
        {{ movimiento.description }} - <span class="badge bg-primary">{{ movimiento.amount }}</span>
      </li>
    </ul>

    <p v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p>

    <!-- Modal para Crear Movimiento -->
    <div class="modal fade" id="movimientoModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nuevo Movimiento</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input type="text" class="form-control mb-3" v-model="movimiento.description" placeholder="Descripción (opcional)" />
            <input type="number" class="form-control mb-3" v-model="movimiento.amount" placeholder="Monto" />
            <select class="form-select mb-3" v-model="movimiento.category_id">
              <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">{{ categoria.name }}</option>
            </select>
            <input type="date" class="form-control" v-model="movimiento.date" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary" @click="guardarMovimiento">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useApi } from '../composables/use-api';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const movimientos = ref([]);
const categorias = ref([]);
const errorMessage = ref('');
const movimiento = ref({
  description: '',
  amount: '',
  category_id: null,
  date: new Date().toISOString().split('T')[0] // Fecha actual por defecto
});
let modalInstance;

const cargarMovimientos = async () => {
  try {
    movimientos.value = await useApi('transactions');
  } catch (error) {
    errorMessage.value = 'Error al cargar movimientos';
    console.error("Error al cargar movimientos:", error);
  }
};

const cargarCategorias = async () => {
  try {
    categorias.value = await useApi('categories');
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
};

const abrirModal = () => {
  movimiento.value = {
    description: '',
    amount: '',
    category_id: categorias.value.length ? categorias.value[0].id : null,
    date: new Date().toISOString().split('T')[0]
  };

  modalInstance = new bootstrap.Modal(document.getElementById('movimientoModal'));
  modalInstance.show();
};

const guardarMovimiento = async () => {
  if (!movimiento.value.amount || !movimiento.value.category_id || !movimiento.value.date) {
    return Swal.fire('Error', 'Todos los campos son obligatorios excepto la descripción', 'error');
  }

  try {
    await useApi('transactions', 'POST', movimiento.value);
    Swal.fire('¡Movimiento agregado!', '', 'success');
    modalInstance.hide();
    cargarMovimientos();
  } catch (error) {
    console.error("Error al agregar movimiento:", error);
    Swal.fire('Error', 'No se pudo agregar el movimiento', 'error');
  }
};

onMounted(() => {
  cargarMovimientos();
  cargarCategorias();
});
</script>
