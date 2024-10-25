/**
 * Clase Msglog para mostrar mensajes al usuario utilizando SweetAlert2 (si está disponible) y la consola del navegador.
 * Permite personalizar las configuraciones de los mensajes y de SweetAlert2.
 *
 * @class
 * 
 * @param {Object} [options] - Opciones de personalización para la clase.
 * @param {Object} [options.swalOptions] - Opciones adicionales para configurar SweetAlert2.
 * @param {Object} [options.messageTypes] - Configuraciones personalizadas para los tipos de mensajes.
 * @param {boolean} [options.silent=false] - Si es true, no muestra advertencias en la consola si SweetAlert2 no está disponible.
 * @param {boolean} [options.toast=true] - Si es true, habilita los *toast* por defecto si SweetAlert2 está disponible.
 */
export class Msglog {
    /**
     * Constructor de la clase Msglog.
     * 
     * @constructor
     * @param {Object} [options={}] - Opciones de personalización.
     */
    constructor(options = {}) {
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

        const defaultMessageTypes = {
            success: { style: 'background: green; color: white', icon: 'info', timer: 2500, consoleIcon: ' 🟢' },
            info: { style: 'background: white; color: green', icon: 'info', timer: 2000, consoleIcon: ' \u2139' },
            warning: { style: 'background: yellow; color: blue', icon: 'warning', timer: 3000, consoleIcon: ' ⚠️' },
            danger: { style: 'background: red; color: white', icon: 'error', timer: 4000, consoleIcon: ' ❌' },
            secondary: { style: 'background: grey; color: black', icon: 'question', timer: 2500, consoleIcon: ' 🛈' },
        };

        this.messageTypes = { ...defaultMessageTypes, ...options.messageTypes };
    }

    /**
     * Muestra un mensaje informativo.
     * 
     * @param {string} msg - El mensaje a mostrar.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast para este mensaje.
     */
    info(msg, disableToast = false) {
        this._showMessage(msg, 'info', disableToast);
    }

    /**
     * Muestra un mensaje de advertencia.
     * 
     * @param {string} msg - El mensaje a mostrar.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast para este mensaje.
     */
    warning(msg, disableToast = false) {
        this._showMessage(msg, 'warning', disableToast);
    }

    /**
     * Muestra un mensaje de error.
     * 
     * @param {string} msg - El mensaje a mostrar.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast para este mensaje.
     */
    danger(msg, disableToast = false) {
        this._showMessage(msg, 'danger', disableToast);
    }

    /**
     * Muestra un mensaje secundario.
     * 
     * @param {string} msg - El mensaje a mostrar.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast para este mensaje.
     */
    secondary(msg, disableToast = false) {
        this._showMessage(msg, 'secondary', disableToast);
    }

    /**
     * Muestra un mensaje de éxito.
     * 
     * @param {string} msg - El mensaje a mostrar.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast para este mensaje.
     */
    success(msg, disableToast = false) {
        this._showMessage(msg, 'success', disableToast);
    }

    /**
     * Método interno para mostrar mensajes utilizando SweetAlert2 (si está disponible) y la consola.
     * 
     * @private
     * @param {string} msg - El mensaje a mostrar.
     * @param {string} type - El tipo de mensaje.
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
