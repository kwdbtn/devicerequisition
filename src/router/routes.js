const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "/", component: () => import("pages/IndexPage.vue") },
      {
        path: "/requests",
        component: () => import("components/TableView.vue"),
      },
    ],
  },

  {
    path: "/login",
    name: "login",
    component: () => import("components/LoginView.vue"),
    meta: { requiresAuth: false },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    name: "notFound",
    component: () => import("pages/ErrorNotFound.vue"),
    meta: { requiresAuth: false },
  },
];

export default routes;
