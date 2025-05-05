<template>
  <ion-page>
    <ion-content>
      <div class="top-text">
        <p class="text-4xl">PSALM</p>
        <p  class="text-4xl">Cakes</p>
        <p class="italic text-xl">Customized</p>
      </div>
      <img src="/images/top-cake.png" alt="Cake at top" class="cake-top" />
      <div class="container flex flex-col items-center justify-center">
        <div class="logo-container">
          <img src="/images/logo.webp" alt="Cake Logo" class="rounded-full h-48 mb-9 w-auto mx-auto">
        </div>
        <div class="auth-panel ">

          <div class=" border-white border-8 rounded-4xl ">
            <h2>CUSTOMIZE YOUR DREAM CAKE!</h2>
            <h3>Start Your Sweet Journey With Us!</h3>
          </div>

          <div class="button-group">
            <ion-button expand="block" :router-link="{name: 'Register'}">Sign Up</ion-button>
            <ion-button expand="block" :router-link="{name: 'Login'}">Log In</ion-button>
          </div>
        </div>
      </div>
      <img src="/images/home-cakce.png" alt="Cake at bottom" class="cake-bottom" />
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
  z-index: 9999;
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

.cake-bottom {
  position: absolute;
  left: 15%;
  bottom: 0;
  transform: translateX(-50%);
  width: 250px; /* Adjust as needed */
  z-index: -999;
  pointer-events: none; /* Allows clicks to pass through */
  opacity: 0.7; /* Added opacity */
}
.cake-top {
  position: absolute;
  right: 10%;
  top: 0;
  transform: translateX(50%);
  width: 300px; /* Adjust as needed */
  z-index: -999;
  pointer-events: none; /* Allows clicks to pass through */
  opacity: 0.7; /* Added opacity */
}
.top-text {
  position: absolute;
  left: 25%;
  top: 3%;
  transform: translateX(-50%);
  color: #58091F;

  font-weight: 600;
}
</style>
