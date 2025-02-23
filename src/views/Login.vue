<template>
    <div>
      <h2>Login</h2>
      <form @submit.prevent="login">
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  </template>
  
  <script>
  import { useApi } from '../composables/useApi';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default {
    setup() {
      const email = ref('');
      const password = ref('');
      const router = useRouter();
  
      const login = async () => {
        try {
          const response = await useApi('login', 'POST', {
            email: email.value,
            password: password.value,
          });
  
          localStorage.setItem('token', response.token);
          router.push('/');
        } catch (error) {
          alert(error.message || 'Error al iniciar sesión');
        }
      };
  
      return {
        email,
        password,
        login,
      };
    },
  };
  </script>