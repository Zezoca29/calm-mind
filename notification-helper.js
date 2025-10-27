// notification-helper.js - Sistema de notificações para o módulo de sono

class NotificationHelper {
    constructor() {
        this.notificationPermission = 'default';
        this.init();
    }

    async init() {
        if ('Notification' in window) {
            this.notificationPermission = Notification.permission;
        }

        // Listen for messages from service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
                this.handleServiceWorkerMessage(event.data);
            });
        }

        // Start notification scheduler
        this.startNotificationScheduler();
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('Notificações não suportadas');
            return false;
        }

        const permission = await Notification.requestPermission();
        this.notificationPermission = permission;
        return permission === 'granted';
    }

    async showNotification(title, options = {}) {
        if (this.notificationPermission !== 'granted') {
            console.warn('Permissão de notificação não concedida');
            return;
        }

        const defaultOptions = {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200],
            requireInteraction: false
        };

        const notificationOptions = { ...defaultOptions, ...options };

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            // Send to service worker
            navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                title: title,
                options: notificationOptions
            });
        } else {
            // Fallback to regular notification
            new Notification(title, notificationOptions);
        }
    }

    handleServiceWorkerMessage(data) {
        if (!data) return;

        switch (data.type) {
            case 'TRIGGER_SLEEP_REMINDER':
                this.triggerSleepReminder();
                break;
            case 'TRIGGER_MORNING_REMINDER':
                this.triggerMorningReminder();
                break;
            case 'CHECK_NOTIFICATIONS':
                this.checkScheduledNotifications(data.hour, data.minute);
                break;
        }
    }

    triggerSleepReminder() {
        const enabled = localStorage.getItem('sleepReminderEnabled') === 'true';
        if (enabled) {
            this.showNotification('Hora de Dormir! 🌙', {
                body: 'Lembre-se de manter uma rotina de sono regular para melhor saúde.',
                tag: 'sleep-reminder'
            });
        }
    }

    triggerMorningReminder() {
        const enabled = localStorage.getItem('morningReminderEnabled') === 'true';
        if (enabled) {
            this.showNotification('Como foi seu sono? 😴', {
                body: 'Registre como você dormiu ontem para acompanhar sua saúde.',
                tag: 'morning-reminder'
            });
        }
    }

    checkScheduledNotifications(hour, minute) {
        const sleepEnabled = localStorage.getItem('sleepReminderEnabled') === 'true';
        const morningEnabled = localStorage.getItem('morningReminderEnabled') === 'true';

        // Check sleep reminder (22:00)
        if (sleepEnabled && hour === 22 && minute === 0) {
            this.triggerSleepReminder();
        }

        // Check morning reminder (8:00)
        if (morningEnabled && hour === 8 && minute === 0) {
            this.triggerMorningReminder();
        }
    }

    startNotificationScheduler() {
        // Check every minute for scheduled notifications
        setInterval(() => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            this.checkScheduledNotifications(hour, minute);
        }, 60000);

        // Also check immediately
        const now = new Date();
        this.checkScheduledNotifications(now.getHours(), now.getMinutes());
    }

    // Schedule a custom notification
    scheduleNotification(title, body, time) {
        const now = new Date();
        const scheduledTime = new Date(time);
        const delay = scheduledTime - now;

        if (delay > 0) {
            setTimeout(() => {
                this.showNotification(title, { body });
            }, delay);
            return true;
        }
        return false;
    }
}

// Export singleton instance
const notificationHelper = new NotificationHelper();

// Make it available globally
if (typeof window !== 'undefined') {
    window.notificationHelper = notificationHelper;
}