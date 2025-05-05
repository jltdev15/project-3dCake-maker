<template>
  <ion-page>
    <ion-content>
      <div class="container flex flex-col items-center justify-center">
        <div class="logo-container">
          <img src="/images/logo.webp" alt="Cake Logo" class="rounded-full h-64 mb-9 w-auto mx-auto">
        </div>
        <div class="auth-panel ">

          <div class=" border-white border-8 rounded-4xl ">
            <h2>CUSTOMIZE YOUR DREAM CAKE!</h2>
            <h3>Start Your Sweet Journey With Us!</h3>
          </div>

          <div class="button-group">
            <ion-button expand="block" router-link="/signup">Sign Up</ion-button>
            <ion-button expand="block" router-link="/login">Log In</ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton } from '@ionic/vue';

// Register components
defineOptions({
  components: {
    IonPage,
    IonContent,
    IonButton
  }
});
</script>

<style scoped>
ion-content {
  --background: linear-gradient(to bottom, #F0E68D, #CAD08E);
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.auth-panel {
  background: rgba(239, 239, 239, 0.708);
  padding: 1.2rem;
  border-radius: 24px;
  box-shadow: none;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.auth-panel h2 {
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.auth-panel h3 {
  margin-bottom: 2rem;
  color: #666;
  font-size: 0.9rem;
  font-weight: normal;
}

.button-group {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;

}

ion-button {
  --background: transparent;
  --background-hover: transparent;
  --background-focused: transparent;
  --background-activated: transparent;
  --color: #010000;
  --border-radius: 999px;
  --border-width: 8px;
  --border-style: solid;
  --border-color: rgb(255, 255, 255);
  --box-shadow: none;
  height: 56px;
  font-weight: 500;
  font-size: 1.3rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0.5rem 0;
}
</style>
