<template>
  <ion-app>
    <ion-router-outlet></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
// @ts-ignore - These imports are used in the template
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { Capacitor } from "@capacitor/core";

const platform = Capacitor.getPlatform();
onMounted(async () => {
  if (platform === "android") {
    await GoogleAuth.initialize({
      clientId:
        "843645413677-kkvo0ccvqdacfk1u1vpicp3eokv8h812.apps.googleusercontent.com", // Android
      scopes: ["profile", "email"],
      grantOfflineAccess: true,
    });
  } else if (platform === "web") {
    await GoogleAuth.initialize({
      clientId:
        "696030414223-3agj1n6c6qpqvv2egakoi5okbv621e2o.apps.googleusercontent.com", // Web
      scopes: ["profile", "email"],
      grantOfflineAccess: true,
    });
  }
});


</script>

<style lang="scss" scoped>


</style>