<template>
  <ion-page class="message-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/account" class="back-button"></ion-back-button>
        </ion-buttons>
        <ion-title class="message-title">Chat</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="message-container">
        <div class="empty-state">
          <div class="empty-state-content">
            <div class="empty-state-icon">
              <ion-icon :icon="chatbubbleOutline"></ion-icon>
            </div>
            <h2 class="empty-state-title">No Chat History</h2>
            <p class="empty-state-subtitle">Your conversations will appear here</p>
            <ion-button router-link="/home" class="start-chat-btn" fill="solid">
              Start Shopping
              <ion-icon :icon="arrowForward" slot="end"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// @ts-ignore - These imports are used in the template
import { IonPage, IonContent, IonBackButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonIcon, IonButton } from '@ionic/vue';
// @ts-ignore - These icons are used in the template
import { chatbubbleOutline, arrowForward } from 'ionicons/icons';
</script>

<style scoped>
.message-page {
  --background: linear-gradient(135deg, #FFF7D0 0%, #C8AD7E 100%);
}

ion-header {
  --background: #FFFFFF;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

ion-toolbar {
  --background: #7A5C1E;
  --border-width: 0;
  padding: 8px 16px;
}

.back-button {
  --color: #FFFFFF;
}

.message-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
}

.message-container {
  padding: 16px;
  padding-top: 80px;
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  width: 100%;
  max-width: 400px;
}

.empty-state-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 32px;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.empty-state-icon {
  background: rgba(255, 255, 255, 0.9);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-state-icon ion-icon {
  font-size: 40px;
  color: #7A5C1E;
}

.empty-state-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7A5C1E;
  margin: 0 0 8px 0;
}

.empty-state-subtitle {
  color: #666;
  margin: 0 0 24px 0;
  font-size: 1.1rem;
}

.start-chat-btn {
  --background: #7A5C1E;
  --background-hover: #8B6B2F;
  --background-activated: #8B6B2F;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(122, 92, 30, 0.2);
  height: 48px;
  font-weight: 600;
}

@media (max-width: 480px) {
  .empty-state-content {
    padding: 24px;
  }

  .empty-state-icon {
    width: 64px;
    height: 64px;
  }

  .empty-state-icon ion-icon {
    font-size: 32px;
  }

  .empty-state-title {
    font-size: 1.25rem;
  }

  .empty-state-subtitle {
    font-size: 1rem;
  }
}
</style>