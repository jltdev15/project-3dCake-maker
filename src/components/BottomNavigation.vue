<template>
    <ion-page>
        <ion-tabs>
            <ion-router-outlet></ion-router-outlet>

            <ion-tab-bar slot="bottom" class="nav-bar">
                <ion-tab-button tab="home" href="/home">
                    <ion-icon :icon="home" />
                    <ion-label>Home</ion-label>
                </ion-tab-button>
                <ion-tab-button tab="cart" href="/cart">
                    <div class="cart-button-wrapper">
                        <ion-icon :icon="cart" />
                        <ion-label>Cart</ion-label>
                        <ion-badge v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</ion-badge>
                    </div>
                </ion-tab-button>
                <ion-tab-button tab="orders" href="/orders">
                    <ion-icon :icon="receipt" />
                    <ion-label>Orders</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="messages" href="/messages">
                    <div class="message-button-wrapper">
                        <ion-icon :icon="chatbubble" />
                        <ion-label>Messages</ion-label>
                        <ion-badge v-if="messageStore.unreadMessagesCount > 0" class="message-badge">{{ messageStore.unreadMessagesCount }}</ion-badge>
                    </div>
                </ion-tab-button>

                <ion-tab-button tab="account" href="/account">
                    <ion-icon :icon="person" />
                    <ion-label>Me</ion-label>
                </ion-tab-button>
            </ion-tab-bar>

        </ion-tabs>

    </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useCartStore } from '../stores/cartStore';
import { useMessageStore } from '../stores/messageStore';
import { onMounted } from 'vue';
import {
    IonPage,
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonIcon,
    IonBadge
} from "@ionic/vue";

import { home, receipt, cart, person, chatbubble } from "ionicons/icons";

const router = useRouter()
const cartStore = useCartStore();
const messageStore = useMessageStore();

onMounted(() => {
    // Initialize message store to check for unread messages
    messageStore.checkUnreadMessages();
});
</script>

<style scoped>
.nav-bar {
    --background: rgba(255, 255, 255, 0.95);
    --border: none;
    backdrop-filter: blur(10px);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
    height: 70px;
    padding: 8px 0;
    position: relative;
    z-index: 1000;
}

ion-tab-button {
    --color: #7A5C1E;
    --color-selected: #7A5C1E;
    --ripple-color: transparent;
    transition: all 0.3s ease;
    position: relative;
    overflow: visible;
}

ion-tab-button::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background: #7A5C1E;
    border-radius: 3px 3px 0 0;
    transition: width 0.3s ease;
}

ion-tab-button.tab-selected::before {
    width: 24px;
}

ion-tab-button.tab-selected {
    --background: transparent;
}

ion-tab-button:hover {
    --color: #8B6B2F;
    transform: translateY(-2px);
}

ion-icon {
    font-size: 24px;
    transition: all 0.3s ease;
}

ion-tab-button:hover ion-icon {
    transform: scale(1.1);
}

ion-tab-button.tab-selected ion-icon {
    transform: scale(1.1);
}

ion-label {
    font-size: 12px;
    font-weight: 500;
    margin-top: 4px;
}

.cart-button-wrapper, .message-button-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.cart-badge, .message-badge {
    position: absolute;
    top: -4px;
    right: -8px;
    --background: #dc3545;
    --color: white;
    font-size: 12px;
    font-weight: 600;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}

.message-badge {
    min-width: 20px;
    height: 20px;
    right: -8px;
    top: -4px;
    padding: 0 6px;
}

ion-tabs {
    position: relative;
    z-index: 1;
}

@media (max-width: 360px) {
    .nav-bar {
        height: 60px;
        padding: 4px 0;
    }

    ion-icon {
        font-size: 20px;
    }

    ion-label {
        font-size: 10px;
    }

    .cart-badge {
        font-size: 10px;
        min-width: 18px;
        height: 18px;
    }
}
</style>