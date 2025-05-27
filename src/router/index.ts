import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import OnBoardingPage from '@/views/OnBoarding.vue';
import RegisterPage from '@/views/RegisterView.vue';
import LoginPage from '@/views/LoginView.vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import { useAuthStore } from '@/stores/authStore';
import MessagesView from '../views/MessagesView.vue'
import ChatView from '../views/ChatView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'OnBoarding',
    component: OnBoardingPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/',
    component: BottomNavigation,
    meta: { requiresAuth: true },
    children: [
      {
        path: '/home',
        name: 'home',
        component: () => import('../views/HomeView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/category/:id',
        name: 'category',
        component: () => import('../views/CategoryView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/orders',
        name: 'orders',
        component: () => import('../views/Orders/OrdersView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/cart',
        name: 'cart',
        component: () => import('../views/Orders/CartView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/notifications',
        name: 'notifications',
        component: () => import('@/views/NotificationView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/account',
        name: 'account',
        component: () => import('../views/Account/AccountView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/messages',
        name: 'messages',
        component: MessagesView,
        meta: { requiresAuth: true },
      },


    ],
  },
  {
    path: '/chat/:id',
    name: 'chat',
    component: ChatView,
    meta: { requiresAuth: true },
  },
  {
    path: '/orders/:id',
    name: 'orderDetails',
    component: () => import('../views/Orders/OrderDetailsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/account/edit',
    name: 'accountEdit',
    component: () => import('../views/Account/AccountEditView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/account/message',
    name: 'accountMessage',
    component: () => import('../views/Account/AccountMessageView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/customize-cake',
    name: 'customizeCake',
    component: () => import('../views/CustomizeCakeView.vue'),
    meta: { requiresAuth: true },
  },


];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  await authStore.loadUser();

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.user) {
      console.log('not authenticated');
      next({ name: 'Login' }); // Redirect to login if no valid auth data
    } else {
      next(); // Allow access
    }
  } else {
    if (authStore.user && to.name === 'Login') {
      next({ name: 'home' }); // Redirect to dashboard if already authenticated and trying to access login
    } else if (authStore.user && to.name === 'OnBoarding') {
      next({ name: 'home' }); // Redirect to dashboard if already authenticated and trying to access home
    } else {
      next(); // Allow access to routes that do not require authentication
    }
  }
});

export default router;