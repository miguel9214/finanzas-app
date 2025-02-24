<template>
  <div class="container mt-4">
    <!-- Título y Botón de Nuevo Movimiento -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold text-primary">
        <i class="bi bi-cash-coin me-2"></i>Movimientos
      </h2>
      <button class="btn btn-success" @click="abrirModal()">
        <i class="bi bi-plus-circle me-2"></i>Nuevo Movimiento
      </button>
    </div>

    <ul class="list-group mt-3">
      <li v-for="movimiento in movimientos" :key="movimiento.id" class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          {{ movimiento.description }} - <span class="badge bg-primary">{{ movimiento.amount }}</span>
          <div v-if="movimiento.receipt_image">
            <img :src="getImageUrl(movimiento.receipt_image)" alt="Recibo" class="img-thumbnail mt-2" width="100" />
          </div>
        </div>
      </li>
    </ul>

    <!-- Mensaje de Error -->
    <p v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p>

    <!-- Modal para Crear Movimiento -->
    <div class="modal fade" id="movimientoModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-cash-coin me-2"></i>Nuevo Movimiento
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input type="text" class="form-control mb-3" v-model="movimiento.description" placeholder="Descripción (opcional)" />
            <input type="number" class="form-control mb-3" v-model="movimiento.amount" placeholder="Monto" />
            <select class="form-select mb-3" v-model="movimiento.category_id">
              <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">{{ categoria.name }}</option>
            </select>
            <input type="date" class="form-control mb-3" v-model="movimiento.date" />
            <input type="file" class="form-control" @change="handleFileUpload" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-2"></i>Cancelar
            </button>
            <button class="btn btn-primary" @click="guardarMovimiento">
              <i class="bi bi-save me-2"></i>Guardar
            </button>
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
  date: new Date().toISOString().split('T')[0],
  receipt_image: null,
});
let modalInstance;

// Cargar movimientos
const cargarMovimientos = async () => {
  try {
    movimientos.value = await useApi('transactions');
    // Asociar categorías a los movimientos
    movimientos.value = movimientos.value.map((movimiento) => {
      movimiento.category = categorias.value.find((cat) => cat.id === movimiento.category_id);
      return movimiento;
    });
  } catch (error) {
    errorMessage.value = 'Error al cargar movimientos';
    console.error("Error al cargar movimientos:", error);
  }
};

// Cargar categorías
const cargarCategorias = async () => {
  try {
    categorias.value = await useApi('categories');
    if (categorias.value.length) {
      movimiento.value.category_id = categorias.value[0].id; // Seleccionar la primera categoría por defecto
    }
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
};

// Abrir modal para crear movimiento
const abrirModal = () => {
  movimiento.value = {
    description: '',
    amount: '',
    category_id: categorias.value.length ? categorias.value[0].id : null,
    date: new Date().toISOString().split('T')[0],
    receipt_image: null,
  };

  modalInstance = new bootstrap.Modal(document.getElementById('movimientoModal'));
  modalInstance.show();
};

const handleFileUpload = (event) => {
  movimiento.value.receipt_image = event.target.files[0];
};

const guardarMovimiento = async () => {
  if (!movimiento.value.amount || !movimiento.value.category_id || !movimiento.value.date) {
    return Swal.fire('Error', 'Todos los campos son obligatorios excepto la descripción', 'error');
  }

  try {
    const formData = new FormData();
    formData.append('description', movimiento.value.description || '');
    formData.append('amount', movimiento.value.amount);
    formData.append('category_id', movimiento.value.category_id);
    formData.append('date', movimiento.value.date);
    if (movimiento.value.receipt_image) {
      formData.append('receipt_image', movimiento.value.receipt_image);
    }

    await useApi('transactions', 'POST', formData, { 'Content-Type': 'multipart/form-data' });

    Swal.fire('¡Movimiento agregado!', '', 'success');
    modalInstance.hide();
    cargarMovimientos();
  } catch (error) {
    console.error("Error al agregar movimiento:", error);
    Swal.fire('Error', 'No se pudo agregar el movimiento', 'error');
  }
};

const getImageUrl = (path) => {
  return `${import.meta.env.VITE_API_URL}/storage/${path}`;
};

onMounted(() => {
  cargarCategorias().then(() => cargarMovimientos());
});
</script>

<style scoped>
.list-group-item {
  border-radius: 8px;
  transition: transform 0.2s;
}
.list-group-item:hover {
  transform: translateY(-2px);
}
.badge {
  font-size: 0.9rem;
}
</style>