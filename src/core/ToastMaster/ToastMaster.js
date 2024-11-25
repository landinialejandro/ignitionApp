// Archivo: src/core/ToastMaster/toastMaster.js

/**
 * Clase Toastmaster para gestionar mensajes, errores y acciones.
 * TODO: Modularizar Toastmaster en diferentes responsabilidades:
 *       - Mensajería (info, warning, etc.)
 *       - Manejo de errores (handleError)
 *       - Registro de acciones/logs
 * TODO: Implementar persistencia de logs en un archivo JSON utilizando las clases/métodos existentes.
 * TODO: Agregar soporte para diferentes niveles de log (debug, info, warn, error).
 * TODO: Explorar la integración con servicios de logging externos (p.ej., ElasticSearch, Logstash).
 * TODO: Permitir configuración avanzada para logs según el entorno (desarrollo/producción).
 * TODO: Mejorar la documentación con ejemplos claros para nuevos desarrolladores.
 */

/**
 * Clase Toastmaster para gestionar mensajes, errores y logs.
 * 
 * TODOs:
 * 1. [Filtros en los logs]
 *    - Crear un método `filterLogs(criteria)` para devolver registros filtrados por tipo o fecha.
 *    - Ejemplo: filterLogs({ type: 'error', from: '2024-01-01', to: '2024-01-31' }).
 * 
 * 2. [Sistema de callbacks/eventos]
 *    - Implementar un sistema de suscripción para permitir la ejecución de callbacks.
 *    - Ejemplo: onLogRegistered(callback) -> Ejecuta callback al registrar un log.
 * 
 * 3. [Modo silencioso por entorno]
 *    - Agregar configuración para silenciar mensajes/logs en entornos específicos.
 *    - Ejemplo: silentMode = true en `process.env.NODE_ENV === 'test'`.
 * 
 * 4. [UI para visualización de logs]
 *    - Diseñar una tabla básica que cargue los logs desde JSON o almacenamiento local.
 *    - Opciones: Paginación, filtros y exportación directa desde la UI.
 * 
 * 5. [Integración con notificaciones]
 *    - Agregar un sistema para enviar mensajes críticos a servicios externos (Slack, email, etc.).
 *    - Ejemplo: notifyViaEmail(logEntry), notifyToSlack(logEntry).
 */


/**
 * Clase Toastmaster
 * -----------------
 * Clase para gestionar mensajes, errores y registros en la consola, integrando SweetAlert2 para notificaciones visuales
 * y la consola para un manejo más técnico. Incluye funcionalidad para registrar acciones y filtrar logs.
 *
 * @example
 * import toastmaster from './core/ToastMaster/toastMaster';
 * toastmaster.info('Mensaje informativo');
 * toastmaster.handleError('Error en función', new Error('Error simulado'));
 * toastmaster.echo('Mensaje simple en consola');
 */
class ToastMaster {
    /**
     * Constructor de Toastmaster
     * Implementa un patrón Singleton que asegura una única instancia.
     * 
     * @param {Object} [options={}] - Configuración inicial para mensajes y almacenamiento de logs.
     * @param {boolean} [options.toast=true] - Habilita los mensajes tipo toast con SweetAlert2.
     * @param {boolean} [options.silent=false] - Si es true, suprime advertencias si SweetAlert2 no está disponible.
     * @param {Object} [options.swalOptions] - Configuración personalizada para SweetAlert2.
     * @param {Object} [options.messageTypes] - Configuración personalizada de tipos de mensaje.
     * @param {Array} [options.logStore=[]] - Almacén inicial para registros de logs.
     */
    constructor(options = {}) {
        if (ToastMaster.instance) {
            return ToastMaster.instance; // Retorna la instancia existente (Singleton)
        }

        this.isSwalAvailable = typeof Swal !== 'undefined'; // Verifica si SweetAlert2 está disponible

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

        this.messageTypes = this.#initializeMessageTypes(options.messageTypes);
        this.logStore = options.logStore || []; // Donde almacenar logs si se necesita persistencia

        ToastMaster.instance = this; // Guarda la instancia única
    }

    // Métodos públicos
    /**
     * Muestra un mensaje informativo.
     * 
     * @param {string} msg - Mensaje a mostrar.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast.
     */
    info(msg, disableToast = false) {
        this.#showMessage(msg, 'info', disableToast);
    }

    /**
     * Muestra un mensaje de advertencia.
     * 
     * @param {string} msg - Mensaje a mostrar.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast.
     */
    warning(msg, disableToast = false) {
        this.#showMessage(msg, 'warning', disableToast);
    }

    /**
     * Muestra un mensaje de error.
     * 
     * @param {string} msg - Mensaje a mostrar.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast.
     */
    danger(msg, disableToast = false) {
        this.#showMessage(msg, 'danger', disableToast);
    }

    /**
     * Muestra un mensaje genérico.
     * 
     * @param {string} msg - Mensaje a mostrar.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast.
     */
    secondary(msg, disableToast = false) {
        this.#showMessage(msg, 'secondary', disableToast);
    }

    /**
     * Muestra un mensaje de éxito.
     * 
     * @param {string} msg - Mensaje a mostrar.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast.
     */
    success(msg, disableToast = false) {
        this.#showMessage(msg, 'success', disableToast);
    }

    /**
     * Maneja errores, registrándolos en la consola y mostrando mensajes descriptivos.
     * 
     * @param {string} message - Mensaje descriptivo del error.
     * @param {Error} [error] - Objeto de error capturado.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast.
     */
    handleError(message, error, disableToast = false) {
        if (error instanceof Error) {
            console.error(`${message}:`, error);
        } else {
            console.error(`${message}`);
        }

        this.danger(`${message}. Por favor, inténtalo de nuevo más tarde.`, disableToast);
    }

    /**
     * Registro simple, equivalente a `console.log`.
     * 
     * @param  {...any} args - Argumentos a registrar en la consola.
     */
    echo(...args) {
        console.log(...args);
    }

    // Métodos privados
    /**
     * Inicializa los tipos de mensaje con configuraciones personalizadas.
     * 
     * @private
     * @param {Object} customMessageTypes - Configuración personalizada.
     * @returns {Object} - Tipos de mensajes finales.
     */
    #initializeMessageTypes(customMessageTypes) {
        const defaultMessageTypes = {
            success: { style: 'background: green; color: white', icon: 'info', timer: 2500, consoleIcon: ' 🟢' },
            info: { style: 'background: white; color: green', icon: 'info', timer: 2000, consoleIcon: ' \u2139' },
            warning: { style: 'background: yellow; color: blue', icon: 'warning', timer: 3000, consoleIcon: ' ⚠️' },
            danger: { style: 'background: red; color: white', icon: 'error', timer: 4000, consoleIcon: ' ❌' },
            secondary: { style: 'background: grey; color: black', icon: 'question', timer: 2500, consoleIcon: ' 🛈' },
        };

        return { ...defaultMessageTypes, ...customMessageTypes };
    }

    /**
     * Muestra mensajes utilizando SweetAlert2 (si está disponible) y la consola.
     * 
     * @private
     * @param {string} msg - Mensaje a mostrar.
     * @param {string} type - Tipo de mensaje (info, warning, etc.).
     * @param {boolean} disableToast - Si es true, no muestra el toast.
     */
    #showMessage(msg, type, disableToast) {
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
const toastmaster = new ToastMaster();
export default toastmaster;
