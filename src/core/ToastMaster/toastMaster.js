// * file: src/core/ToastMaster/toastMaster.js

/**
 * Clase Toastmaster para gestionar mensajes, errores y registro de acciones.
 * Integra SweetAlert2 y la consola para manejar mensajes,
 * además de registrar acciones o eventos en un sistema externo o local.
 */
class Toastmaster {
    constructor(options = {}) {
        if (Toastmaster.instance) {
            return Toastmaster.instance; // Patrón singleton
        }

        this.isSwalAvailable = typeof Swal !== 'undefined';

        if (this.isSwalAvailable) {
            this.Toast = Swal.mixin({
                toast: options.toast ?? true,
                position: 'top-end',
                showConfirmButton: false,
                timerProgressBar: true,
                ...options.swalOptions,
            });
        } else if (!options.silent) {
            console.warn('SweetAlert2 no está disponible. Los mensajes se mostrarán solo en la consola.');
        }

        this.messageTypes = this._initializeMessageTypes(options.messageTypes);
        this.logStore = options.logStore || []; // Donde almacenar los logs de acciones

        Toastmaster.instance = this;
    }

    /**
     * Inicializa los tipos de mensajes por defecto con opciones personalizadas.
     * 
     * @private
     * @param {Object} customMessageTypes - Tipos de mensajes personalizados.
     * @returns {Object} - Configuración final de tipos de mensajes.
     */
    _initializeMessageTypes(customMessageTypes) {
        const defaultMessageTypes = {
            success: { style: 'background: green; color: white', icon: 'info', timer: 2500, consoleIcon: ' 🟢' },
            info: { style: 'background: white; color: green', icon: 'info', timer: 2000, consoleIcon: ' \u2139' },
            warning: { style: 'background: yellow; color: blue', icon: 'warning', timer: 3000, consoleIcon: ' ⚠️' },
            danger: { style: 'background: red; color: white', icon: 'error', timer: 4000, consoleIcon: ' ❌' },
            secondary: { style: 'background: grey; color: black', icon: 'question', timer: 2500, consoleIcon: ' 🛈' },
        };

        return { ...defaultMessageTypes, ...customMessageTypes };
    }

    // Métodos para mostrar mensajes (como antes)
    info(msg, disableToast = false) {
        this._showMessage(msg, 'info', disableToast);
    }

    warning(msg, disableToast = false) {
        this._showMessage(msg, 'warning', disableToast);
    }

    danger(msg, disableToast = false) {
        this._showMessage(msg, 'danger', disableToast);
    }

    secondary(msg, disableToast = false) {
        this._showMessage(msg, 'secondary', disableToast);
    }

    success(msg, disableToast = false) {
        this._showMessage(msg, 'success', disableToast);
    }

    handleError(message, error, disableToast = false) {
        if (error instanceof Error) {
            console.error(`${message}:`, error);
        } else {
            console.error(`${message}`);
        }

        this.danger(`${message}. Por favor, inténtalo de nuevo más tarde.`, disableToast);
    }

    /**
     * Método para registrar acciones o eventos.
     * 
     * @param {string} action - Nombre o descripción de la acción.
     * @param {Object} [details={}] - Detalles adicionales sobre la acción.
     */
    logAction(action, details = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = { action, details, timestamp };

        // Guardar el log en el almacenamiento local (logStore)
        this.logStore.push(logEntry);

        // Opción para enviar a un sistema remoto (simulado aquí)
        this._sendToRemoteLog(logEntry);

        console.log(`%c📝 Acción registrada: ${action}`, 'color: blue; font-weight: bold;', details);
    }

    /**
     * Método privado para simular el envío de logs a un sistema remoto.
     * 
     * @private
     * @param {Object} logEntry - Registro a enviar.
     */
    _sendToRemoteLog(logEntry) {
        // Simula un POST a un servidor remoto
        console.debug('Enviando log al servidor remoto:', logEntry);
    }

    /**
     * Método privado para mostrar mensajes utilizando SweetAlert2 y la consola.
     * 
     * @private
     * @param {string} msg - Mensaje a mostrar.
     * @param {string} type - Tipo de mensaje.
     * @param {boolean} disableToast - Si es true, no muestra el toast.
     */
    _showMessage(msg, type, disableToast) {
        if (typeof msg !== 'string') {
            console.error('El mensaje debe ser una cadena de texto.');
            return;
        }

        const config = this.messageTypes[type];

        if (!config) {
            console.error(`Tipo de mensaje no soportado: ${type}`);
            return;
        }

        const { style, icon, timer, consoleIcon } = config;

        if (this.isSwalAvailable && !disableToast) {
            this.Toast.fire({ icon, title: msg, timer });
        }

        console.log(`%c${consoleIcon} ${msg}`, style);
    }
}

// Exportar una instancia única
const toastmaster = new Toastmaster();
export default toastmaster;
