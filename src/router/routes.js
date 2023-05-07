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
        component: () => import("pages/DeviceRequests.vue"),
      },
      {
        path: "/requests/expired",
        component: () => import("pages/ExpiredRequests.vue"),
      },
      {
        path: "/requests/mine",
        component: () => import("pages/MyRequests.vue"),
      },
      {
        path: "/requests/onbehalf",
        component: () => import("pages/OnbehalfRequests.vue"),
      },
      {
        path: "/requests/verification",
        component: () => import("pages/VerificationForm.vue"),
      },
    ],
  },

  {
    path: "/login",
    name: "login",
    component: () => import("pages/LoginView.vue"),
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
