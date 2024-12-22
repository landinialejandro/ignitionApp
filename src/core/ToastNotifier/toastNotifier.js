// Archivo: src/core/ToastNotifier/toastNotifier.js

export class ToastNotifier {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'toast-notifier-container';
        document.body.appendChild(this.container);
    }

    fire(message, type = 'info', options = {}) {
        const notification = document.createElement('div');
        notification.textContent = message;
        // Agregar clases dinámicas
        notification.classList.add('toast');
        notification.classList.add(`toast-${type}`);

        this.container.appendChild(notification);

        // Mostrar notificación
        setTimeout(() => (notification.style.opacity = '1'), 10);

        const duration = options.timer || 6000;
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => this.container.removeChild(notification), 600);
        }, duration);
    }
}
