import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import store from '@/store';

const routes = [
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/insert',
    name: 'Insert',
    component: () => import('../views/AddTools.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/edit/:id',
    name: 'edit',
    component: () => import('@/views/EditScorecard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/hls',
    name: 'hls',
    component: () => import('../views/ALL_HLS.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/hls/:serialNumber',
    name: 'HLSWithSerialNumber',
    component: () => import('../views/HLS.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/panel',
    name: 'panel',
    component: () => import('../views/AdminPanel.vue'),
    meta: { requiresAuth: true , requiresAdmin: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/editprofile',
    name: 'editprofile',
    component: () => import('../views/EditProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/aaaa:id',
    name: 'aaaa',
    component: () => import('@/views/ReviewEditRequests.vue'),
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const auth = getAuth(); // Get the Firebase auth instance

  onAuthStateChanged(auth, user => {
    if (requiresAuth && !user) {
      next({ name: 'login' });
    } else {
      // Check if the route requires admin role
      if (to.meta.requiresAdmin) {
        // Check if the user is authenticated
        if (user) {
          // Check if the user has admin role
          if (store.getters.userRole === 'admin') {
            next();
          } else {
            // Redirect to unauthorized page or home page
            next({ name: 'home' });
          }
        } else {
          // Redirect to login page
          next({ name: 'login' });
        }
      } else {
        next();
      }
    }
  });
});

export default router;
