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


// Archivo: src/core/ToastMaster/toastMaster.js

/**
 * Clase ToastMaster
 * -----------------
 * Clase principal para gestionar mensajes, errores y logs, integrada con `ToastNotifier` para reemplazar SweetAlert2.
 * Modulariza las responsabilidades en:
 * - Mensajería (info, warning, success, danger).
 * - Manejo de errores.
 * - Registro de acciones/logs.
 * Incluye soporte para configuraciones avanzadas, callbacks y manejo de entornos (desarrollo/producción).
 *
 * @example
 * import toastmaster from './core/ToastMaster/toastMaster';
 * toastmaster.info('Mensaje informativo');
 * toastmaster.handleError('Error en función', new Error('Error simulado'));
 * toastmaster.echo('Mensaje simple en consola');
 */
import { ToastNotifier } from '../ToastNotifier/toastNotifier.js';

const isDevelopment = window.location.hostname === 'localhost';

class ToastMaster {
    /**
     * Constructor de ToastMaster.
     * Implementa un patrón Singleton y configura las opciones iniciales para el manejo de mensajes y logs.
     * 
     * @param {Object} [options={}] - Configuración inicial.
     * @param {boolean} [options.silent=false] - Si es true, desactiva los mensajes en modo silencioso.
     * @param {Object} [options.messageTypes] - Tipos de mensajes personalizados.
     * @param {Array} [options.logStore=[]] - Almacén inicial para logs.
     */
    constructor(options = {}) {
        // Modo silencioso según opciones o entorno detectado
        this.silentMode = false;//options.silent !== undefined ? options.silent : !isDevelopment;

        // Inicializa ToastNotifier con configuraciones opcionales
        this.notifier = new ToastNotifier(options.notifierOptions || {});

        // Inicializa el almacén de logs, asegurando que sea un arreglo
        this.logStore = Array.isArray(options.logStore) ? options.logStore : [];

        // Configura tipos de mensajes personalizados
        this.messageTypes = this.#initializeMessageTypes(
            typeof options.messageTypes === 'object' ? options.messageTypes : {}
        );

        // Sistema de eventos
        this.eventListeners = {
            logRegistered: [],
        };

        // Configuración del Singleton
        if (ToastMaster.instance) {
            return ToastMaster.instance; // Retorna la instancia existente
        }
        ToastMaster.instance = this;
    }

    // Métodos públicos

    /**
     * Muestra un mensaje informativo.
     * @param {string} msg - Mensaje a mostrar.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast visual.
     */
    info(msg, disableToast = false) {
        this.#showMessage(msg, 'info', disableToast);
    }

    /**
     * Muestra un mensaje de éxito.
     * @param {string} msg - Mensaje a mostrar.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast visual.
     */
    success(msg, disableToast = false) {
        this.#showMessage(msg, 'success', disableToast);
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
     * Muestra un mensaje de advertencia.
     * @param {string} msg - Mensaje a mostrar.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast visual.
     */
    warning(msg, disableToast = false) {
        this.#showMessage(msg, 'warning', disableToast);
    }

    /**
     * Muestra un mensaje de error.
     * @param {string} msg - Mensaje a mostrar.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast visual.
     */
    danger(msg, disableToast = false) {
        this.#showMessage(msg, 'danger', disableToast);
    }

    /**
     * Maneja errores, registrándolos en la consola y mostrando un mensaje descriptivo.
     * @param {string} message - Mensaje descriptivo del error.
     * @param {Error} [error] - Objeto de error capturado.
     * @param {boolean} [disableToast=false] - Si es true, no muestra el toast visual.
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
     * @param  {...any} args - Argumentos a registrar en la consola.
     */
    echo(...args) {
        console.log(...args);
    }

    /**
     * Filtra los logs almacenados en base a criterios.
     * 
     * @param {Object} criteria - Criterios de filtrado.
     * @param {string} [criteria.type] - Tipo de log (info, error, warning, etc.).
     * @param {string} [criteria.from] - Fecha de inicio (ISO 8601).
     * @param {string} [criteria.to] - Fecha de fin (ISO 8601).
     * @returns {Array} - Logs filtrados.
     */
    filterLogs(criteria) {
        const { type, from, to } = criteria;
        return this.logStore.filter(log => {
            const matchesType = type ? log.type === type : true;
            const matchesDate = from || to
                ? new Date(log.timestamp) >= new Date(from) &&
                new Date(log.timestamp) <= new Date(to)
                : true;
            return matchesType && matchesDate;
        });
    }

    /**
     * Agrega un callback que se ejecuta al registrar un nuevo log.
     * @param {Function} callback - Función callback.
     */
    onLogRegistered(callback) {
        if (typeof callback === 'function') {
            this.eventListeners.logRegistered.push(callback);
        }
    }

    /**
     * Activa los eventos registrados.
     * @private
     * @param {string} eventName - Nombre del evento.
     * @param {any} data - Datos asociados al evento.
     */
    #triggerEvent(eventName, data) {
        (this.eventListeners[eventName] || []).forEach(callback => callback(data));
    }

    // Métodos privados

    /**
     * Inicializa los tipos de mensaje con configuraciones personalizadas.
     * @private
     * @param {Object} customMessageTypes - Configuración personalizada de tipos.
     * @returns {Object} - Tipos de mensajes finales.
     */
    #initializeMessageTypes(customMessageTypes) {
        const defaultMessageTypes = {
            success: { style: 'background: green; color: white', icon: 'check-circle', timer: 2500, consoleIcon: ' 🟢' },
            info: { style: 'background: white; color: green', icon: 'info-circle', timer: 2000, consoleIcon: ' \u2139' },
            warning: { style: 'background: yellow; color: blue', icon: 'exclamation-triangle', timer: 3000, consoleIcon: ' ⚠️' },
            danger: { style: 'background: red; color: white', icon: 'times-circle', timer: 4000, consoleIcon: ' ❌' },
            secondary: { style: 'background: grey; color: black', icon: 'question', timer: 2500, consoleIcon: ' 🛈' },

        };

        return { ...defaultMessageTypes, ...customMessageTypes };
    }

    /**
     * Muestra un mensaje utilizando ToastNotifier.
     * @private
     * @param {string} msg - Mensaje a mostrar.
     * @param {string} type - Tipo de mensaje (info, success, warning, danger).
     * @param {boolean} disableToast - Si es true, no muestra el toast visual.
     */
    #showMessage(msg, type, disableToast = false) {
        if (this.silentMode) return; // No hace nada si el modo silencioso está activado

        const config = this.messageTypes[type];
        if (!config) {
            console.error(`Tipo de mensaje no soportado: ${type}`);
            return;
        }

        const { timer, style, consoleIcon } = config;

        if (!disableToast) {
            this.notifier.fire(msg, type, { timer });
        }
        console.log(`%c${consoleIcon} ${msg}`, style);
        this.#registerLog({ type, message: msg, timestamp: new Date() });
    }

    /**
     * Registra un log en el almacén.
     * @private
     * @param {Object} logEntry - Entrada de log.
     */
    #registerLog(logEntry) {
        this.logStore.push(logEntry);
        this.#triggerEvent('logRegistered', logEntry);
    }
}

// Exportar una instancia única
const toastmaster = new ToastMaster();
export default toastmaster;
