<template>
  <div class="container mt-4">
    <h2>Categorías</h2>

    <div class="d-flex justify-content-between mb-3">
      <input v-model="searchQuery" class="form-control w-50" placeholder="Buscar categoría..." />
      <button class="btn btn-success" @click="abrirModal()">Nueva Categoría</button>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cat, index) in categorias" :key="cat.id">
            <td>{{ calcularIndice(index) }}</td>
            <td>{{ cat.name }}</td>
            <td><span class="badge" :class="cat.type === 'income' ? 'bg-success' : 'bg-danger'">{{ traducirTipo(cat.type) }}</span></td>
            <td>
              <button class="btn btn-warning btn-sm me-2" @click="abrirModal(cat)">Editar</button>
              <button class="btn btn-danger btn-sm" @click="eliminarCategoria(cat.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: paginaActual === 1 }">
          <button class="page-link" @click="cambiarPagina(paginaActual - 1)">Anterior</button>
        </li>
        <li class="page-item" v-for="pagina in totalPaginas" :key="pagina" :class="{ active: pagina === paginaActual }">
          <button class="page-link" @click="cambiarPagina(pagina)">{{ pagina }}</button>
        </li>
        <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
          <button class="page-link" @click="cambiarPagina(paginaActual + 1)">Siguiente</button>
        </li>
      </ul>
    </nav>

    <!-- Modal para Crear/Editar Categoría -->
    <div class="modal fade" id="categoriaModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-tags me-2"></i> {{ esEdicion ? "Editar Categoría" : "Nueva Categoría" }}
            </h5>
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
            <button class="btn btn-primary" @click="guardarCategoria">
              {{ esEdicion ? "Actualizar" : "Guardar" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import Swal from "sweetalert2";
import { useApi } from "../composables/use-api";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

const categorias = ref([]);
const searchQuery = ref("");
const paginaActual = ref(1);
const totalPaginas = ref(1);
const elementosPorPagina = 5;
const categoria = ref({ id: null, name: "", type: "income" });
const esEdicion = ref(false);
let modalInstance;

// Cargar categorías con paginación y búsqueda
const cargarCategorias = async (pagina = 1, search = "") => {
  try {
    const response = await useApi(`categories?page=${pagina}&search=${search}`);
    categorias.value = response.categories.data || [];
    paginaActual.value = response.categories.current_page;
    totalPaginas.value = response.categories.last_page;
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    categorias.value = [];
  }
};

// Cambiar de página
const cambiarPagina = (pagina) => {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    cargarCategorias(pagina, searchQuery.value);
  }
};

// Calcular índice en la tabla
const calcularIndice = (index) => {
  return (paginaActual.value - 1) * elementosPorPagina + index + 1;
};

// Traducir tipo de categoría
const traducirTipo = (tipo) => {
  return tipo === "income" ? "Ingreso" : "Gasto";
};

// Abrir modal para crear/editar categoría
const abrirModal = (cat = null) => {
  esEdicion.value = !!cat;
  categoria.value = cat ? { ...cat } : { id: null, name: "", type: "income" };

  modalInstance = new bootstrap.Modal(document.getElementById("categoriaModal"));
  modalInstance.show();
};

// Guardar o actualizar categoría
const guardarCategoria = async () => {
  if (!categoria.value.name.trim()) {
    return Swal.fire("Error", "El nombre es obligatorio", "error");
  }

  if (!categoria.value.type) {
    return Swal.fire("Error", "Debes seleccionar un tipo", "error");
  }

  try {
    if (esEdicion.value) {
      await useApi(`categories/${categoria.value.id}`, "PUT", categoria.value);
      Swal.fire("Actualizado", "Categoría editada con éxito", "success");
    } else {
      await useApi("categories", "POST", categoria.value);
      Swal.fire("Creado", "Categoría añadida con éxito", "success");
    }

    modalInstance.hide();
    cargarCategorias(paginaActual.value);
  } catch (error) {
    console.error("Error al guardar categoría:", error);
    Swal.fire("Error", "No se pudo guardar la categoría", "error");
  }
};

// Confirmar y eliminar una categoría
const eliminarCategoria = async (id) => {
  const confirm = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!confirm.isConfirmed) return;

  try {
    await useApi(`categories/${id}`, "DELETE");
    Swal.fire("Eliminado", "Categoría eliminada con éxito", "success");
    cargarCategorias(paginaActual.value);
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    Swal.fire("Error", "No se pudo eliminar la categoría", "error");
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  cargarCategorias();
});

// Actualizar categorías al buscar
watch(searchQuery, () => cargarCategorias(1, searchQuery.value));
</script>

<style scoped>
.table {
  border-radius: 8px;
  overflow: hidden;
}
.badge {
  font-size: 0.9rem;
}
</style>
