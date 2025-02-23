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

    <!-- Lista de Movimientos -->
    <ul class="list-group">
      <li
        v-for="movimiento in movimientos"
        :key="movimiento.id"
        class="list-group-item d-flex justify-content-between align-items-center shadow-sm mb-3"
      >
        <div>
          <span class="fw-bold">{{ movimiento.description || 'Sin descripción' }}</span> -
          <span class="badge bg-primary">{{ movimiento.amount }}</span>
        </div>
        <div>
          <span class="text-muted me-3">{{ formatoFecha(movimiento.date) }}</span>
          <span
            v-if="movimiento.category"
            :class="`badge ${movimiento.category.type === 'income' ? 'bg-success' : 'bg-danger'}`"
          >
            {{ movimiento.category.name }}
          </span>
          <span v-else class="badge bg-warning">Sin categoría</span>
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
            <!-- Campo de Descripción -->
            <div class="mb-3">
              <label for="descripcion" class="form-label">Descripción (opcional)</label>
              <input
                type="text"
                class="form-control"
                id="descripcion"
                v-model="movimiento.description"
                placeholder="Descripción"
              />
            </div>

            <!-- Campo de Monto -->
            <div class="mb-3">
              <label for="monto" class="form-label">Monto</label>
              <input
                type="number"
                class="form-control"
                id="monto"
                v-model="movimiento.amount"
                placeholder="Monto"
              />
            </div>

            <!-- Campo de Categoría -->
            <div class="mb-3">
              <label for="categoria" class="form-label">Categoría</label>
              <select class="form-select" v-model="movimiento.category_id">
                <option
                  v-for="categoria in categorias"
                  :key="categoria.id"
                  :value="categoria.id"
                >
                  {{ categoria.name }}
                </option>
              </select>
            </div>

            <!-- Campo de Fecha -->
            <div class="mb-3">
              <label for="fecha" class="form-label">Fecha</label>
              <input
                type="date"
                class="form-control"
                id="fecha"
                v-model="movimiento.date"
              />
            </div>
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
  date: new Date().toISOString().split('T')[0], // Fecha actual por defecto
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
  };

  modalInstance = new bootstrap.Modal(document.getElementById('movimientoModal'));
  modalInstance.show();
};

// Guardar movimiento
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

// Formatear fecha
const formatoFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Cargar datos al montar el componente
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