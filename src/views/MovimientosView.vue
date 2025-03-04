<template>
  <div class="custom-container mt-3">
    <div class="card shadow">
      <div class="card-header text-center bg-primary text-white">
        <h3>Gestión de movimientos</h3>
      </div>

      <div class="card-body">
        <input
          type="text"
          v-model="searchQuery"
          class="form-control mb-4 shadow-sm"
          placeholder="Buscar movimiento..."
        />

        <button class="btn btn-primary mb-4" @click="openCreateModal">Crear movimiento</button>

        <div class="table-responsive">
          <table class="table table-bordered table-hover">
            <thead class="bg-light">
              <tr>
                <th>#</th>
                <th>Descripcion</th>
                <th>Cantidad</th>
                <th>Categoria</th>
                <th>Soporte</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!customers.length">
                <td colspan="6">No se encontraron clientes.</td>
              </tr>
              <tr
                v-else
                v-for="(customer, index) in customers"
                :key="customer.id"
              >
                <td>{{ calculateIndex(index) }}</td>
                <td>{{ customer.dni }}</td>
                <td>{{ customer.name }}</td>
                <td>{{ customer.email }}</td>
                <td>{{ customer.phone }}</td>
                <td>{{ customer.address }}</td>
                <td>
                  <button class="btn btn-warning btn-sm" @click="openEditModal(customer)">Editar</button>
                  <button class="btn btn-danger btn-sm" @click="confirmDelete(customer.id)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="pagination d-flex align-items-center justify-content-center mt-3"
        >
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            Anterior
          </button>
          <span>Página {{ currentPage }} de {{ totalPages }}</span>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div class="modal fade" id="customerModal" tabindex="-1" aria-labelledby="customerModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="customerModalLabel">{{ showEditForm ? 'Editar Cliente' : 'Crear Cliente' }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="showEditForm ? updateCliente() : createCliente()">
            <div class="form-group">
              <label for="name">DNI</label>
              <input type="text" v-model="form.dni" class="form-control" required />
            </div>
            <div class="form-group">
              <label for="name">Nombre</label>
              <input type="text" v-model="form.name" class="form-control" required />
            </div>
            <div class="form-group">
              <label for="email">Correo</label>
              <input type="email" v-model="form.email" class="form-control" required />
            </div>
            <div class="form-group">
              <label for="phone">Teléfono</label>
              <input type="text" v-model="form.phone" class="form-control" required />
            </div>
            <div class="form-group">
              <label for="address">Dirección</label>
              <input type="text" v-model="form.address" class="form-control" required />
            </div>
            <div class="d-flex justify-content-between mt-4">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-success">{{ showEditForm ? 'Actualizar' : 'Crear' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { useApi } from "@/composables/use-api";
import Swal from "sweetalert2";
import * as bootstrap from "bootstrap";

const transactions = ref([]);
const categories = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = 5;
const showCreateForm = ref(false);
const showEditForm = ref(false);
const form = ref({
  id: null,
  name: "",
  email: "",
  phone: "",
  address: ""
});

// Fetch paginated customers
const fetchTransaction = async (page = 1, search = "") => {
  try {
    const response = await useApi(
      `transactions?page=${page}&itemsPerPage=${itemsPerPage}&search=${search}`
    );
    transactions.value = response.transaction.data; // Clientes filtrados
    currentPage.value = response.transaction.current_page; // Página actual
    totalPages.value = response.transaction.last_page; // Total de páginas
  } catch (error) {
    console.error("Error al cargar los movimientos:", error);
  }
};

// Crear cliente
// const createCliente = async () => {
//   try {
//     await useApi("customer", "POST", form.value);
//     fetchCustomers(currentPage.value);
//     cancelForm();
//     Swal.fire("Éxito", "Cliente creado exitosamente", "success");
//   } catch (error) {
//     console.error("Error al crear el cliente:", error);
//     Swal.fire("Error", "No se pudo crear el cliente", "error");
//   }
// };

// Editar cliente
const openEditModal = (customer) => {
  form.value = { ...customer };
  showEditForm.value = true;
  showCreateForm.value = false;
  new bootstrap.Modal(document.getElementById('customerModal')).show();
};

// Actualizar cliente
// const updateCliente = async () => {
//   try {
//     await useApi(`customer/${form.value.id}`, "PUT", form.value);
//     fetchCustomers(currentPage.value);
//     cancelForm();
//     Swal.fire("Éxito", "Cliente actualizado exitosamente", "success");
//   } catch (error) {
//     console.error("Error al actualizar el cliente:", error);
//     Swal.fire("Error", "No se pudo actualizar el cliente", "error");
//   }
// };

// Eliminar cliente
// const confirmDelete = (id) => {
//   Swal.fire({
//     title: "¿Estás seguro?",
//     text: "No podrás revertir esto",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#3085d6",
//     cancelButtonColor: "#d33",
//     confirmButtonText: "Sí, eliminar"
//   }).then(async (result) => {
//     if (result.isConfirmed) {
//       try {
//         await useApi(`customer/${id}`, "DELETE");
//         fetchCustomers(currentPage.value);
//         Swal.fire("Eliminado", "Cliente eliminado exitosamente", "success");
//       } catch (error) {
//         console.error("Error al eliminar el cliente:", error);
//         Swal.fire("Error", "No se pudo eliminar el cliente", "error");
//       }
//     }
//   });
// };

// Cancelar formulario
const cancelForm = () => {
  form.value = {
    id: null,
    name: "",
    email: "",
    phone: "",
    address: ""
  };
  showCreateForm.value = false;
  showEditForm.value = false;
  const modalElement = document.getElementById('customerModal');
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) {
    modalInstance.hide();
  }
};

// Abrir modal de creación
const openCreateModal = () => {
  cancelForm();
  showCreateForm.value = true;
  showEditForm.value = false;
  new bootstrap.Modal(document.getElementById('customerModal')).show();
};

// Cambiar de página
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchCustomers(page, searchQuery.value);
  }
};

// Calcular índice global
const calculateIndex = (index) => {
  return (currentPage.value - 1) * itemsPerPage + index + 1;
};

// Cargar clientes al montar el componente
onMounted(() => {
  fetchCustomers();
});

watch(searchQuery, (newQuery) => {
  fetchCustomers(1, newQuery); // Reinicia a la página 1 cuando se busca algo nuevo
});
</script>

<style scoped>
.custom-container {
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  font-size: 1.5rem;
}

.pagination button {
  background-color: #4e73df;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: bold;
  margin: 0 5px;
}

.pagination button:disabled {
  background-color: #e0e0e0;
  color: #7a7a7a;
}

.pagination span {
  font-weight: bold;
  color: #4e73df;
}
</style>