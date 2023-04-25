<script setup>
import HeaderView from './../components/HeaderView.vue'
import SideBar from './../components/SideBar.vue'
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <header-view />
    <side-bar />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>


