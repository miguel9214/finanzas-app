<template>
  <div class="container mt-4">
    <h2>Categorías</h2>
    <button class="btn btn-success" @click="abrirModal()">Nueva Categoría</button>

    <ul class="list-group mt-3">
      <li
        v-for="categoria in categorias"
        :key="categoria.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        {{ categoria.name }} - <span class="badge bg-info">{{ categoria.type }}</span>
        <div>
          <button class="btn btn-warning btn-sm me-2" @click="abrirModal(categoria)">Editar</button>
          <button class="btn btn-danger btn-sm" @click="eliminarCategoria(categoria.id)">Eliminar</button>
        </div>
      </li>
    </ul>

    <p v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p>

    <!-- Modal para Crear/Editar Categoría -->
    <div class="modal fade" id="categoriaModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ esEdicion ? 'Editar Categoría' : 'Nueva Categoría' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input
              type="text"
              class="form-control mb-3"
              v-model="categoria.name"
              placeholder="Nombre de la categoría"
            />
            <select class="form-select" v-model="categoria.type">
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary" @click="guardarCategoria">
              {{ esEdicion ? 'Actualizar' : 'Guardar' }}
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

const categorias = ref([]);
const errorMessage = ref('');
const categoria = ref({ id: null, name: '', type: 'ingreso' });
const esEdicion = ref(false);
let modalInstance;

// 📌 Cargar categorías desde la API
const cargarCategorias = async () => {
  try {
    categorias.value = await useApi('categories');
  } catch (error) {
    errorMessage.value = 'Error al cargar categorías';
    console.error('Error al cargar categorías:', error);
  }
};

// 📌 Abrir modal para crear o editar categoría
const abrirModal = (cat = null) => {
  esEdicion.value = !!cat;
  categoria.value = cat ? { ...cat } : { id: null, name: '', type: 'ingreso' };

  modalInstance = new bootstrap.Modal(document.getElementById('categoriaModal'));
  modalInstance.show();
};

// 📌 Guardar (crear o editar) una categoría
const guardarCategoria = async () => {
  if (!categoria.value.name.trim()) {
    return Swal.fire('Error', 'El nombre es obligatorio', 'error');
  }

  if (!categoria.value.type) {
    return Swal.fire('Error', 'Debes seleccionar un tipo', 'error');
  }

  try {
    if (esEdicion.value) {
      await useApi(`categories/${categoria.value.id}`, 'PUT', categoria.value);
      Swal.fire('Actualizado', 'Categoría editada con éxito', 'success');
    } else {
      await useApi('categories', 'POST', categoria.value);
      Swal.fire('Creado', 'Categoría añadida con éxito', 'success');
    }

    setTimeout(() => modalInstance.hide(), 300);
    cargarCategorias();
  } catch (error) {
    console.error('Error al guardar categoría:', error);
    Swal.fire('Error', 'No se pudo guardar la categoría', 'error');
  }
};

// 📌 Eliminar una categoría
const eliminarCategoria = async (id) => {
  const confirm = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (!confirm.isConfirmed) return;

  try {
    await useApi(`categories/${id}`, 'DELETE');
    Swal.fire('Eliminado', 'Categoría eliminada con éxito', 'success');
    cargarCategorias();
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    Swal.fire('Error', 'No se pudo eliminar la categoría', 'error');
  }
};

// 📌 Cargar categorías al montar el componente
onMounted(cargarCategorias);
</script>
