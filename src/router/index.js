import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CategoriasView from '../views/CategoriasView.vue';
import MovimientosView from '../views/MovimientosView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/categorias', component: CategoriasView },
  { path: '/movimientos', component: MovimientosView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
