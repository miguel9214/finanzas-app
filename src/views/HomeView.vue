
<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8 text-center">
        <!-- Título principal -->
        <h1 class="display-4 fw-bold text-primary mb-4">Bienvenido a Finanzas</h1>
        <!-- Descripción -->
        <p class="lead text-secondary mb-4">
          Administra tus ingresos y gastos de manera fácil y eficiente.
        </p>
        <!-- Botón de acción -->
        <div class="d-grid gap-3 d-md-flex justify-content-center">
          <router-link to="/movimientos" class="btn btn-primary btn-lg">
            <i class="bi bi-cash-coin me-2"></i>Ver Movimientos
          </router-link>
          <router-link to="/categorias" class="btn btn-outline-primary btn-lg">
            <i class="bi bi-tags me-2"></i>Gestionar Categorías
          </router-link>
        </div>
      </div>
    </div>

    <!-- Sección de características -->
    <div class="row mt-5">
      <div class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-graph-up display-4 text-success mb-3"></i>
            <h3 class="card-title">Seguimiento de Gastos</h3>
            <p class="card-text text-muted">
              Registra y analiza tus gastos para tomar mejores decisiones financieras.
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-piggy-bank display-4 text-warning mb-3"></i>
            <h3 class="card-title">Ahorro Inteligente</h3>
            <p class="card-text text-muted">
              Establece metas de ahorro y sigue tu progreso de manera sencilla.
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-bar-chart display-4 text-info mb-3"></i>
            <h3 class="card-title">Reportes Detallados</h3>
            <p class="card-text text-muted">
              Genera reportes visuales para entender mejor tus finanzas.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
};
</script>

<style scoped>
/* Estilos personalizados */
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-5px);
}
</style>