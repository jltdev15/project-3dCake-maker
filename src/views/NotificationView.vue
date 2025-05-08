<template>
    <ion-page class="page-background">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/" text=""></ion-back-button>
                </ion-buttons>
                <ion-title class="ion-text-center pr-12">Notifications</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <div class="notification-container">
                <h1>Notifications</h1>
                <ion-text color="medium" class="no-notifications">
                    <p>No notifications at the moment</p>
                </ion-text>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonText, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/vue';

// Register components
defineOptions({
  components: {
    IonPage,
    IonContent,
    IonText,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton
  }
});
</script>

<style scoped>
.page-background {
    background: linear-gradient(to bottom, #C8AD7E, #FFF7D0);
}

ion-toolbar {
    --background: linear-gradient(to right, #C8AD7E, #FFFFFF);
}

.notification-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
}

.notification-container h1 {
    margin-bottom: 1rem;
}

.notification-container .no-notifications {
    font-size: 1.1rem;
}
ion-content {
    --background: transparent;
}
</style>