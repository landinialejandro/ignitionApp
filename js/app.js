import { RegisterHelpers, RegisterPartials } from './libraries/hbs.js';
import { actionsServer, getDirCollectionJson, preloader } from './libraries/helpers.js';
import { $$ } from './libraries/selector.js';
import { initializeProject } from './project.js';
import { registerButtonAction } from './layout.js';
import { renderTemplateToContainer, checkContainerAvailability, get_data, Constants, toastmaster, getUserInput, sanitizeInput, validateGenericInput } from '../src/index.js';

// Configuración inicial
toastmaster.success("Iniciando app.js", true);
const mainPreloader = new preloader(Constants.PRELOADER_ID);

// Inicialización principal
export const initializeApp = async () => {
    mainPreloader.show();
    try {
        RegisterHelpers();
        await RegisterPartials();
        await initializeSidebar();
        registerEventListeners();
    } catch (error) {
        toastmaster.handleError("Error al inicializar la aplicación", error);
    } finally {
        mainPreloader.hide();
    }
};

/** --- Inicialización del Sidebar y Contenido --- **/

/**
 * Inicializa y renderiza el contenido del sidebar con datos de configuración y navegación.
 */
const initializeSidebar = async () => {
    const [settings, navSidebar, projects, appSettings] = await Promise.all([
        get_data({ url: "settings/settings.json" }),
        get_data({ url: "settings/nav_sidebar.json" }),
        getDirCollectionJson("projects"),
        getDirCollectionJson("settings")
    ]);

    const versionText = `${settings.version || "0.0.0"} - ${settings.release || "bad file"}`;
    toastmaster.info(`Versión: ${versionText}`);
    $$(Constants.VERSION_CONTENT).html(versionText);

    await renderTemplateToContainer("templates/nav_bar.hbs", navSidebar, Constants.SIDEBAR_CONTENT);

    checkContainerAvailability(['projects-list', 'settings-list'], async (projectsContainer, settingsContainer) => {
        await renderTemplateToContainer("templates/nav_bar.hbs", projects, '#projects-list');
        await renderTemplateToContainer("templates/nav_bar.hbs", appSettings, '#settings-list');
    });

    // TODO: Centralizar el manejo de actualizaciones en el DOM para evitar duplicación
};

/** --- Manejo de Acciones y Eventos --- **/

/**
 * Registra todos los listeners necesarios al inicializar la aplicación.
 */
const registerEventListeners = () => {
    toastmaster.secondary("Registrando eventos globales", true);
    registerNavigationListeners();

    const actions = [
        { name: "delete", operation: (data) => processNodeAction(data, 'delete_node') },
        { name: "add-file", operation: (data) => processNodeAction(data, 'create_node', 'file') },
        { name: "add-folder", operation: (data) => processNodeAction(data, 'create_node', 'folder') },
    ];

    actions.forEach(({ name, operation }) => {
        registerButtonAction(`button-${name}`, (button, e) => {
            const link = button.closest('.nav-link-container');
            const data = $$(link).allData();
            data.action = name;
            operation(data);
        });
    });

    // TODO: Consolidar el registro dinámico de acciones para reducir duplicación
};

/**
 * Maneja eventos de clic en enlaces de navegación y delega la carga de contenido.
 */
const registerNavigationListeners = () => {
    $$(Constants.SIDEBAR_CONTENT).on("click", ".nav-link", async function (e) {
        const link = e.target.closest('.nav-link-container');
        if (link) {
            toastmaster.info(`Enlace de navegación seleccionado: ${this.textContent.trim()}`, true);
            e.preventDefault();
            const data = $$(link).allData();
            await loadContent(data);
        }
    });

    // TODO: Agregar soporte para nuevos tipos de enlaces si es necesario en el futuro
};

/**
 * Maneja acciones como crear o eliminar nodos en el servidor y actualiza la interfaz.
 * @param {Object} data - Datos relacionados con la acción.
 * @param {string} operation - Tipo de operación a realizar (e.g., 'create_node', 'delete_node').
 * @param {string|null} type - Tipo de recurso (e.g., 'file', 'folder').
 */
const processNodeAction = async (data, operation, type = null) => {
    data.operation = operation;

    if (operation === 'create_node') {
        data.type = type;

        const name = getUserInput(`Ingrese el nombre del ${type}:`, validateGenericInput);

        if (name) {
            const sanitized = sanitizeInput(name, true, true); // Reemplazar espacios y convertir a minúsculas
            toastmaster.secondary(`Dato ingresado: ${sanitized}`);
            data.text = `${data.url}/${sanitized}`;
        } else {
            toastmaster.danger('Operación cancelada o entrada inválida.');
        }
    }

    if (operation === 'delete_node') {
        data.id = data.url;
    }

    await actionsServer(data);
    await initializeSidebar();

    // TODO: Dividir esta función en sub-funciones para operaciones específicas si crece en complejidad
};

/** --- Carga Dinámica de Contenido --- **/

/**
 * Carga contenido dinámico según el tipo de enlace seleccionado.
 * @param {Object} params - Contiene propiedades 'type', 'name', y 'url'.
 */
const loadContent = async ({ type, name, url }) => {
    if (!url || !type) {
        handleError("Parámetros incompletos para la carga de contenido", new Error("URL o tipo no definidos"));
        return;
    }

    const contentPreloader = new preloader(Constants.CONTENT_PRELOADER);
    const content = $$(Constants.CONTENT);

    contentPreloader.show();
    if (type !== "system" && type !== "folder") {
        $$(Constants.CONTENT_TITLE).text(name);
    }

    try {
        const loadFunction = loadHandlers[type] || loadHandlers.default;
        await loadFunction(url, content);
    } catch (error) {
        handleError(`Error al cargar el tipo de contenido '${type}'`, error);
    } finally {
        contentPreloader.hide();
    }
};

/**
 * Métodos para manejar tipos específicos de contenido en la aplicación.
 */
const loadHandlers = {
    async content(url, content) {
        const contentHtml = await get_data({ url, isJson: false });
        content.html(contentHtml);
        toastmaster.info(`Cargando contenido: ${url}`);
    },
    page(url, content) {
        content.html(`<iframe src="${url}" style="width:100%; height:100vh; border:none;"></iframe>`);
        toastmaster.info(`Cargando página: ${url}`);
    },
    async file(url) {
        initializeProject(url);
        toastmaster.info(`Mostrando archivo JSON: ${url}`);
    },
    image(url, content) {
        content.innerHTML = `<img src="${url}" alt="Imagen" style="max-width: 100%; height: auto;" />`;
        toastmaster.info(`Mostrando imagen: ${url}`);
    },
    default() {
        toastmaster.warning("Tipo de enlace no soportado.");
    }
};
