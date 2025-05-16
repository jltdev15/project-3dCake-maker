<template>
  <ion-page>
    <ion-content>
      <div class="onboarding-container">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="brand-text">
            <h1 class="brand-title">PSALM</h1>
            <h2 class="brand-subtitle">Cakes</h2>
            <p class="brand-tagline">Where Dreams Become Delicious Reality</p>
          </div>
          <img src="/images/top-cake.png" alt="Decorative cake" class="hero-image" />
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <div class="logo-wrapper">
            <img src="/images/logo.webp" alt="PSALM Cakes Logo" class="brand-logo">
          </div>

          <div class="cta-card">
            <div class="cta-header">
              <h2 class="cta-title">Create Your Dream Cake</h2>
              <p class="cta-subtitle">Begin your sweet journey with us today</p>
            </div>

            <div class="action-buttons">
              <ion-button expand="block" class="primary-btn" :router-link="{name: 'Register'}">
                Get Started
                <ion-icon :icon="arrowForward" slot="end"></ion-icon>
              </ion-button>
              <ion-button expand="block" class="secondary-btn" :router-link="{name: 'Login'}">
                Sign In
              </ion-button>
            </div>
          </div>
        </div>

        <img src="/images/home-cakce.png" alt="Decorative cake" class="bottom-image" />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { arrowForward } from 'ionicons/icons';

// Register components
defineOptions({
  components: {
    IonPage,
    IonContent,
    IonButton,
    IonIcon
  }
});
</script>

<style scoped>
ion-content {
  --background: linear-gradient(135deg, #F0E68D 0%, #CAD08E 100%);
}

.onboarding-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.hero-section {
  padding: 2rem 1.5rem;
  position: relative;
  z-index: 1;
}

.brand-text {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #58091F;
  margin: 0;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.brand-subtitle {
  font-size: 2.5rem;
  font-weight: 700;
  color: #58091F;
  margin: 0;
  line-height: 1.2;
}

.brand-tagline {
  font-size: 1.1rem;
  color: #58091F;
  font-style: italic;
  margin-top: 0.5rem;
  opacity: 0.9;
}

.hero-image {
  position: absolute;
  right: -10%;
  top: 0;
  width: 300px;
  transform: rotate(-15deg);
  opacity: 0.8;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1.5rem;
  position: relative;
  z-index: 2;
}

.logo-wrapper {
  margin-bottom: 2rem;
}

.brand-logo {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.brand-logo:hover {
  transform: scale(1.05);
}

.cta-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.cta-header {
  text-align: center;
  margin-bottom: 2rem;
}

.cta-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.cta-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.primary-btn {
  --background: #58091F;
  --background-hover: #7a0c2a;
  --background-activated: #7a0c2a;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(88, 9, 31, 0.2);
  height: 56px;
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.secondary-btn {
  --background: transparent;
  --background-hover: rgba(88, 9, 31, 0.1);
  --background-activated: rgba(88, 9, 31, 0.1);
  --color: #58091F;
  --border-radius: 12px;
  --border-width: 2px;
  --border-color: #58091F;
  height: 56px;
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.bottom-image {
  position: absolute;
  left: -5%;
  bottom: -5%;
  width: 250px;
  transform: rotate(15deg);
  opacity: 0.8;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  z-index: 0;
}

@media (max-width: 768px) {
  .hero-image {
    width: 200px;
    right: -15%;
  }
  
  .bottom-image {
    width: 180px;
  }
  
  .brand-title {
    font-size: 2.8rem;
  }
  
  .brand-subtitle {
    font-size: 2rem;
  }
}
</style>
