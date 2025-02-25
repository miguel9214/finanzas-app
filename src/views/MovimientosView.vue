<template>
  <div class="container mt-4">
    <h2>Movimientos</h2>
    
    <div class="d-flex justify-content-between mb-3">
      <input v-model="searchQuery" class="form-control w-50" placeholder="Buscar movimiento..." />
      <button class="btn btn-success" @click="openCreateModal">Nuevo Movimiento</button>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th>#</th>
            <th>Descripción</th>
            <th>Monto</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th>Comprobante</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(mov, index) in movimientos" :key="mov.id">
            <td>{{ calculateIndex(index) }}</td>
            <td>{{ mov.description || 'Sin descripción' }}</td>
            <td>${{ Number(mov.amount).toFixed(2) }}</td>
            <td>{{ obtenerNombreCategoria(mov.category_id) }}</td>
            <td>{{ mov.date }}</td>
            <td>
              <a v-if="mov.receipt_image" :href="getImageUrl(mov.receipt_image)" target="_blank">
                Ver Imagen
              </a>
              <span v-else>Sin imagen</span>
            </td>
            <td>
              <button class="btn btn-warning btn-sm me-2" @click="openEditModal(mov)">Editar</button>
              <button class="btn btn-danger btn-sm" @click="confirmDelete(mov.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="goToPage(currentPage - 1)">Anterior</button>
        </li>
        <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
          <button class="page-link" @click="goToPage(page)">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="goToPage(currentPage + 1)">Siguiente</button>
        </li>
      </ul>
    </nav>

    <!-- Modal para Crear/Editar Movimiento -->
    <div class="modal fade" id="movimientoModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ form.id ? 'Editar Movimiento' : 'Nuevo Movimiento' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input type="text" class="form-control mb-3" v-model="form.description" placeholder="Descripción (opcional)" />
            <input type="number" class="form-control mb-3" v-model="form.amount" placeholder="Monto" />
            <select class="form-select mb-3" v-model="form.category_id">
              <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">{{ categoria.name }}</option>
            </select>
            <input type="date" class="form-control mb-3" v-model="form.date" />
            <input type="file" class="form-control mb-3" @change="subirImagen" accept="image/*" />
            <div v-if="imagenPreview" class="text-center">
              <img :src="imagenPreview" class="img-thumbnail" style="max-width: 100px;" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary" @click="saveMovimiento">{{ form.id ? 'Actualizar' : 'Guardar' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useApi } from "../composables/use-api";
import Swal from "sweetalert2";
import * as bootstrap from "bootstrap";

const movimientos = ref([]);
const categorias = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = 5;
const imagenFile = ref(null);
const imagenPreview = ref(null);
const form = ref({
  id: null,
  description: "",
  amount: "",
  category_id: null,
  date: new Date().toISOString().split('T')[0],
  receipt_image: null
});

// Cargar movimientos paginados
const fetchMovimientos = async (page = 1, search = "") => {
  try {
    const response = await useApi(`transactions?page=${page}&itemsPerPage=${itemsPerPage}&search=${search}`);
    movimientos.value = response.transactions.data.map(mov => ({ ...mov, amount: Number(mov.amount) }));
    currentPage.value = response.transactions.current_page;
    totalPages.value = response.transactions.last_page;
  } catch (error) {
    console.error("Error al cargar los movimientos:", error);
  }
};

// Cargar categorías
const fetchCategorias = async () => {
  try {
    categorias.value = await useApi("categories");
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
};

const obtenerNombreCategoria = (id) => {
  const categoria = categorias.value.find(cat => cat.id === id);
  return categoria ? categoria.name : "Desconocida";
};

const openEditModal = (mov) => {
  form.value = { ...mov };
  imagenPreview.value = mov.receipt_image ? getImageUrl(mov.receipt_image) : null;
  new bootstrap.Modal(document.getElementById("movimientoModal")).show();
};

const openCreateModal = () => {
  form.value = { id: null, description: "", amount: "", category_id: categorias.value[0]?.id || null, date: new Date().toISOString().split('T')[0], receipt_image: null };
  imagenPreview.value = null;
  new bootstrap.Modal(document.getElementById("movimientoModal")).show();
};

const saveMovimiento = async () => {
  try {
    const formData = new FormData();
    formData.append("description", form.value.description);
    formData.append("amount", form.value.amount);
    formData.append("category_id", form.value.category_id);
    formData.append("date", form.value.date);
    if (imagenFile.value) {
      formData.append("receipt_image", imagenFile.value);
    }

    if (form.value.id) {
      await useApi(`transactions/${form.value.id}`, "PUT", formData);
      Swal.fire("Actualizado", "Movimiento actualizado exitosamente", "success");
    } else {
      await useApi("transactions", "POST", formData);
      Swal.fire("Creado", "Movimiento agregado exitosamente", "success");
    }
    fetchMovimientos(currentPage.value);
  } catch (error) {
    Swal.fire("Error", "No se pudo guardar el movimiento", "error");
  }
};

const confirmDelete = (id) => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esto",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then(async (result) => {
    if (result.isConfirmed) {
      await useApi(`transactions/${id}`, "DELETE");
      fetchMovimientos(currentPage.value);
      Swal.fire("Eliminado", "Movimiento eliminado exitosamente", "success");
    }
  });
};

const goToPage = (page) => {
  fetchMovimientos(page, searchQuery.value);
};

const calculateIndex = (index) => {
  return (currentPage.value - 1) * itemsPerPage + index + 1;
};

onMounted(() => {
  fetchMovimientos();
  fetchCategorias();
});

watch(searchQuery, () => fetchMovimientos(1, searchQuery.value));
</script>
