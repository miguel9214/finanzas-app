<template>
  <div class="container mt-4">
    <h2>Categorías</h2>
    <button class="btn btn-success" @click="abrirModal()">Nueva Categoría</button>

    <ul class="list-group mt-3">
      <li v-for="categoria in categorias" :key="categoria.id" class="list-group-item d-flex justify-content-between align-items-center">
        {{ categoria.name }} - <span class="badge bg-info">{{ traducirTipo(categoria.type) }}</span>
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
            <input type="text" class="form-control mb-3" v-model="categoria.name" placeholder="Nombre de la categoría" />
            <select class="form-select" v-model="categoria.type">
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
            </select>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary" @click="guardarCategoria">{{ esEdicion ? 'Actualizar' : 'Guardar' }}</button>
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

const cargarCategorias = async () => {
  try {
    categorias.value = await useApi('categories');
  } catch (error) {
    errorMessage.value = 'Error al cargar categorías';
    console.error("Error al cargar categorías:", error);
  }
};

const abrirModal = (cat = null) => {
  esEdicion.value = !!cat;
  categoria.value = cat ? { ...cat } : { id: null, name: '', type: 'income' };

  modalInstance = new bootstrap.Modal(document.getElementById('categoriaModal'));
  modalInstance.show();
};

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
    Swal.fire('Error', 'No se pudo eliminar la categoría', 'error');
  }
};

const traducirTipo = (tipo) => {
  return tipo === 'income' ? 'Ingreso' : 'Gasto';
};

onMounted(cargarCategorias);
</script>
