<template>
    <ion-page>
        <ion-tabs>
            <ion-router-outlet></ion-router-outlet>

            <ion-tab-bar slot="bottom" class="h-20">
                <ion-tab-button tab="home" href="/home">
                    <ion-icon :icon="home" />
                    <ion-label>Home</ion-label>
                </ion-tab-button>
                <ion-tab-button tab="cart" href="/cart">
                    <ion-icon :icon="cart" />
                    <ion-label>Cart</ion-label>
                    <ion-badge v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</ion-badge>
                </ion-tab-button>
                <ion-tab-button tab="orders" href="/orders">
                    <ion-icon :icon="receipt" />
                    <ion-label>Orders</ion-label>
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
import {
    IonPage,
    IonTabs,
    IonTab,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonIcon,
    IonFab,
    IonFabButton,
    IonBadge
} from "@ionic/vue";

import { home, notifications, people, statsChart, add, receipt, cart, person } from "ionicons/icons";

const router = useRouter()
const cartStore = useCartStore();
</script>

<style scoped>
ion-tab-bar {
    --background: #ffffff;
    --border: none;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    position: relative;
    z-index: 2;
}

ion-tab-button {
    --color: #1b1b1b;
    --color-selected: #F0E68D;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
}

ion-tab-button:hover {
    --color: #F0E68D;
    transform: translateY(-2px);
}

ion-tab-button::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background: #F0E68D;
    transition: width 0.3s ease;
}

ion-tab-button.tab-selected::before {
    width: 30px;
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

.fab-center {
    left: 50%;
    bottom: 5%;
    transform: translateX(-50%);
    z-index: 9999;
}

.big-fab {
    width: 60px;
    /* Customize size */
    height: 60px;
    font-size: 40px !important;
    /* Increase icon size */
}

.cart-badge {
    position: absolute;
    transform: translateX(25%);
    bottom: 0;
    --background: #ff4961;
    --color: white;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 28px;

}

ion-tabs {
    position: relative;
    z-index: 1;
}
</style>