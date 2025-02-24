<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container">
      <!-- Logo o nombre de la aplicación -->
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <i class="bi bi-wallet2 me-2"></i>Finanzas
      </router-link>

      <!-- Botón para colapsar el menú en dispositivos móviles -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Menú de navegación -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <!-- Enlace a Categorías -->
          <li class="nav-item">
            <router-link class="nav-link" to="/categorias">
              <i class="bi bi-tags me-1"></i>Categorías
            </router-link>
          </li>

          <!-- Enlace a Movimientos -->
          <li class="nav-item">
            <router-link class="nav-link" to="/movimientos">
              <i class="bi bi-cash-coin me-1"></i>Movimientos
            </router-link>
          </li>

          <!-- Menú dinámico para autenticación -->
          <li class="nav-item dropdown" v-if="isAuthenticated">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="navbarDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="bi bi-person-circle me-1"></i>Mi Cuenta
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
              <li>
                <button class="dropdown-item" @click="logout">
                  <i class="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
                </button>
              </li>
            </ul>
          </li>

          <!-- Enlace a Login si no está autenticado -->
          <li class="nav-item" v-else>
            <router-link class="nav-link" to="/login">
              <i class="bi bi-box-arrow-in-right me-1"></i>Iniciar Sesión
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isAuthenticated = ref(false);

// Verificar si el usuario está autenticado
const checkAuth = () => {
  const token = localStorage.getItem('token');
  isAuthenticated.value = !!token;
};

// Cerrar sesión
const logout = () => {
  localStorage.removeItem('token');
  isAuthenticated.value = false;
  router.push('/login');
};

// Verificar autenticación al montar el componente
onMounted(() => {
  checkAuth();
});
</script>

<style scoped>
.navbar {
  padding: 1rem 0;
}
.navbar-brand {
  font-size: 1.5rem;
  font-weight: 600;
}
.nav-link {
  font-size: 1rem;
  font-weight: 500;
}
.nav-link:hover {
  color: rgba(255, 255, 255, 0.8);
}
.dropdown-menu {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.dropdown-item {
  font-size: 0.9rem;
}
</style>