<template>
  <ion-page class="page-background">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/account"></ion-back-button>
        </ion-buttons>
        <ion-title class="ion-text-center pr-16">Chat</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="message-container">
        <div class="no-chat-history">
          <ion-icon :icon="chatbubbleOutline" size="large"></ion-icon>
          <h2>No Chat History</h2>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { IonPage, IonContent, IonBackButton, IonButtons, IonHeader, IonToolbar, IonTitle } from '@ionic/vue';
import { chatbubbleOutline } from 'ionicons/icons';
</script>
<style scoped>
.page-background {
  background: linear-gradient(to bottom, #C8AD7E, #FFF7D0);
}
ion-toolbar {
  --background: linear-gradient(to right, #C8AD7E, #FFFFFF);
}
ion-content {
  --background: transparent;
}
.message-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}
.no-chat-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}
.no-chat-history ion-icon {
  margin-bottom: 12px;
  font-size: 48px;
}
</style>