import Constants from './Constants.js';
import { checkContainerAvailability, get_data } from './libraries/common.js';
import { RegisterHelpers, RegisterPartials } from './libraries/hbs.js';
import { getDirCollectionJson, preloader, renderTemplate } from './libraries/helpers.js';
import { Msglog } from "./libraries/MsgLog.js";
import { $$ } from './libraries/selector.js';
import { initializeProject } from './project.js';
import { registerButtonAction } from './layout.js';


window.msg = new Msglog();
msg.success("Iniciando app.js", true);
const mainPreloader = new preloader(Constants.PRELOADER_ID);

/**
 * Maneja la carga de configuración y datos iniciales, y la inicialización de la interfaz.
 */
document.addEventListener("DOMContentLoaded", async () => {
    mainPreloader.show();
    try {
        const [setting, navSidebar, projects, settings] = await Promise.all([
            get_data({ url: "settings/settings.json" }),
            get_data({ url: "settings/nav_sidebar.json" }),
            getDirCollectionJson("projects"),
            getDirCollectionJson("settings")
        ]);

        const versionText = `${setting.version || "0.0.0"} - ${setting.release || "bad file"}`;
        msg.info(`Versión: ${versionText}`);
        $$(Constants.VERSION_CONTENT).html(versionText);

        RegisterHelpers();
        await RegisterPartials();

        loadNavBar(Constants.SIDEBAR_CONTENT, navSidebar);

        checkContainerAvailability(['projects-list', 'settings-list'], (projectsContainer, settingsContainer) => {
            loadNavBar('#projects-list', projects);
            loadNavBar('#settings-list', settings);
        });

        addEventsListener();
    } catch (error) {
        handleError("Error al inicializar la aplicación", error);
    } finally {
        mainPreloader.hide();
    }
});

/**
 * Función para manejar errores y mostrar mensajes en la consola y al usuario.
 * 
 * @param {string} message - Mensaje principal del error.
 * @param {Error} error - Objeto de error capturado.
 */
function handleError(message, error) {
    console.error(`${message}:`, error);
    msg.danger(`${message}. Por favor, inténtalo de nuevo más tarde.`);
}

/**
 * Función para añadir todos los event listeners necesarios al inicializar la app.
 */
const addEventsListener = () => {
    msg.secondary("addEventsListenerApp", true);
    navLinkListener();

    // Registrar acción de botón para eliminar
    registerButtonAction("button-delete", (button, e) => {

        const link = button.closest('.nav-link-container');
        const data = $$(link).allData();
        console.log(data);

    });

};

/**
 * Función para manejar los eventos de clic en enlaces de navegación utilizando delegación de eventos.
 * Esto permite capturar clics en elementos `a.nav-link` incluso si se cargan dinámicamente.
 */
const navLinkListener = () => {
    // Delegar el evento sobre el contenedor que contiene los enlaces
    $$(Constants.SIDEBAR_CONTENT).on("click", ".nav-link", async function (e) {
        const link = e.target.closest('.nav-link-container');
        if (link) {
            msg.info(`Navlink clicked: ${this.textContent.trim()}`, true);
            e.preventDefault();
            const data = $$(link).allData();
            await handleContentLoading(data);
        }
    });
};


/**
 * Objeto que contiene métodos de carga según el tipo de contenido.
 * Cada método maneja directamente la carga de un tipo específico (content, page, file, image),
 * mientras que el método 'default' maneja los casos no soportados.
 */
const loadHandlers = {
    async content(url, content) {
        const contentHtml = await get_data({ url, isJson: false });
        content.html(contentHtml);
        msg.info(`Cargando contenido: ${url}`);
    },
    page(url, content) {
        content.html(`<iframe src="${url}" style="width:100%; height:100vh; border:none;"></iframe>`);
        msg.info(`Cargando página: ${url}`);
    },
    async file(url) {
        initializeProject(url);
        msg.info(`Mostrando archivo JSON: ${url}`);
    },
    image(url, content) {
        content.innerHTML = `<img src="${url}" alt="Imagen" style="max-width: 100%; height: auto;" />`;
        msg.info(`Mostrando imagen: ${url}`);
    },
    default() {
        msg.warning("Tipo de enlace no soportado.");
    }
};

/**
 * Función principal para manejar la carga de contenido según el tipo proporcionado.
 * Muestra el preloader y cambia el título del contenido si el tipo es válido, y llama
 * al método de carga específico basado en el tipo. También maneja errores y oculta el preloader.
 *
 * @param {Object} params - Objeto con propiedades 'type' y 'name' del contenido.
 * @param {string} url - URL del contenido a cargar.
 */
const handleContentLoading = async ({ type, name, url }) => {
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
 * Carga y renderiza una sección de la barra de navegación en el sidebar.
 * 
 * @param {string} selector - Selector CSS del contenedor donde se renderizará el contenido.
 * @param {Object} content - Datos del contenido a renderizar en el template.
 */
const loadNavBar = async (selector, content) => {
    try {
        content = content.menu ? content : { menu: content };
        $$(selector).html(await renderTemplate("templates/nav_bar.hbs", content));
        msg.secondary(`${selector} cargado correctamente.`, true);
    } catch (error) {
        handleError(`Error al cargar ${selector}`, error);
    }
};
