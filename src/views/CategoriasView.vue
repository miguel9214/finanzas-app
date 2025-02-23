<template>
  <div class="container mt-4">
    <!-- Título y Botón de Nueva Categoría -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold text-primary">
        <i class="bi bi-tags me-2"></i>Categorías
      </h2>
      <button class="btn btn-success" @click="abrirModal()">
        <i class="bi bi-plus-circle me-2"></i>Nueva Categoría
      </button>
    </div>

    <!-- Lista de Categorías -->
    <ul class="list-group">
      <li
        v-for="categoria in categorias"
        :key="categoria.id"
        class="list-group-item d-flex justify-content-between align-items-center shadow-sm mb-3"
      >
        <div>
          <span class="fw-bold">{{ categoria.name }}</span> -
          <span :class="`badge ${categoria.type === 'income' ? 'bg-success' : 'bg-danger'}`">
            {{ traducirTipo(categoria.type) }}
          </span>
        </div>
        <div>
          <button class="btn btn-warning btn-sm me-2" @click="abrirModal(categoria)">
            <i class="bi bi-pencil"></i> Editar
          </button>
          <button class="btn btn-danger btn-sm" @click="eliminarCategoria(categoria.id)">
            <i class="bi bi-trash"></i> Eliminar
          </button>
        </div>
      </li>
    </ul>

    <!-- Mensaje de Error -->
    <p v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p>

    <!-- Modal para Crear/Editar Categoría -->
    <div class="modal fade" id="categoriaModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-tags me-2"></i>{{ esEdicion ? 'Editar Categoría' : 'Nueva Categoría' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <!-- Campo de Nombre -->
            <div class="mb-3">
              <label for="nombre" class="form-label">Nombre</label>
              <input
                type="text"
                class="form-control"
                id="nombre"
                v-model="categoria.name"
                placeholder="Nombre de la categoría"
              />
            </div>

            <!-- Campo de Tipo -->
            <div class="mb-3">
              <label for="tipo" class="form-label">Tipo</label>
              <select class="form-select" v-model="categoria.type">
                <option value="income">Ingreso</option>
                <option value="expense">Gasto</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-2"></i>Cancelar
            </button>
            <button class="btn btn-primary" @click="guardarCategoria">
              <i class="bi bi-save me-2"></i>{{ esEdicion ? 'Actualizar' : 'Guardar' }}
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
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Importar Bootstrap JS

const categorias = ref([]);
const errorMessage = ref('');
const categoria = ref({ id: null, name: '', type: 'income' });
const esEdicion = ref(false);
let modalInstance;

// Cargar categorías
const cargarCategorias = async () => {
  try {
    categorias.value = await useApi('categories');
  } catch (error) {
    errorMessage.value = 'Error al cargar categorías';
    console.error("Error al cargar categorías:", error);
  }
};

// Abrir modal para crear/editar
const abrirModal = (cat = null) => {
  esEdicion.value = !!cat;
  categoria.value = cat ? { ...cat } : { id: null, name: '', type: 'income' };

  modalInstance = new bootstrap.Modal(document.getElementById('categoriaModal'));
  modalInstance.show();
};

// Guardar o actualizar categoría
const guardarCategoria = async () => {
  if (!categoria.value.name.trim()) {
    return Swal.fire('Error', 'El nombre es obligatorio', 'error');
  }

  if (!['income', 'expense'].includes(categoria.value.type)) {
    return Swal.fire('Error', 'Tipo inválido', 'error');
  }

  try {
    if (esEdicion.value) {
      await useApi(`categories/${categoria.value.id}`, 'PUT', categoria.value);
      Swal.fire('Actualizado', 'Categoría editada con éxito', 'success');
    } else {
      await useApi('categories', 'POST', categoria.value);
      Swal.fire('Creado', 'Categoría añadida con éxito', 'success');
    }

    modalInstance.hide();
    cargarCategorias();
  } catch (error) {
    Swal.fire('Error', 'No se pudo guardar la categoría', 'error');
  }
};

// Eliminar categoría
const eliminarCategoria = async (id) => {
  const confirm = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (!confirm.isConfirmed) return;

  try {
    await useApi(`categories/${id}`, 'DELETE');
    Swal.fire('Eliminado', 'Categoría eliminada con éxito', 'success');
    cargarCategorias();
  } catch (error) {
    Swal.fire('Error', 'No se pudo eliminar la categoría', 'error');
  }
};

// Traducir tipo de categoría
const traducirTipo = (tipo) => {
  return tipo === 'income' ? 'Ingreso' : 'Gasto';
};

// Cargar categorías al montar el componente
onMounted(cargarCategorias);
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