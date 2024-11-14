import Constants from './constants.js';
import { get_data, checkContainerAvailability, updateSidebarOverflow } from './libraries/common.js';
import { Msglog } from "./libraries/MsgLog.js";
import { RegisterPartials, RegisterHelpers } from './libraries/hbs.js';
import { preloader, renderTemplate, getDirCollectionJson } from './libraries/helpers.js';
import { $$ } from './libraries/selector.js';
import { initializeProject } from './project.js';

window.msg = new Msglog();
msg.success("Iniciando app.js", true);
const maiPreloader = new preloader(Constants.PRELOADER_ID);

window.onload = async function () {
    try {
        const setting = await get_data({ url: "settings/settings.json" });
        const version = setting.version || "0.0.0";
        const release = setting.release || "bad file";
        const text = `${version} - ${release}`;
        
        msg.info(`Versión: ${text}`);
        $$(Constants.VERSION_CONTENT).html(text);

        RegisterHelpers();
        await RegisterPartials();

        loadNavBar(Constants.SIDEBAR_CONTENT, await get_data({ url: "settings/nav_sidebar.json" }));
        loadNavBar('#projects-list', await getDirCollectionJson("projects"));
        loadNavBar('#settings-list', await getDirCollectionJson("settings"));
        addEventsListener();
    } catch (error) {
        console.error("Error al inicializar la aplicación:", error);
        msg.danger("Ocurrió un problema al iniciar la aplicación. Por favor, inténtalo de nuevo más tarde.");
    } finally {
        maiPreloader.hide();
    }
};

/**
 * Función para añadir todos los event listeners necesarios al inicializar la app.
 */
const addEventsListener = () => {
    msg.secondary("addEventsListenerApp", true);
    navLinkListener();
};

/**
 * Función para manejar los eventos de clic en enlaces de navegación.
 */
const navLinkListener = () => {
    $$("a.nav-link").on("click", async function (e) {
        e.preventDefault();
        msg.info(`Navlink clicked: ${this.textContent.trim()}`, true);
        const url = $$(this).attr("href");
        const data = $$(this).allData();
        await handleContentLoading(data, url);
    });
};

/**
 * Función que devuelve un objeto con métodos de carga según el tipo de contenido.
 * Cada método maneja directamente la carga de un tipo específico (content, page, file, image),
 * mientras que el método 'default' maneja los casos no soportados.
 *
 * @param {string} url - URL del contenido a cargar.
 * @param {HTMLElement} content - Elemento HTML donde se cargará el contenido.
 * @returns {Object} - Objeto con métodos de carga específicos para cada tipo.
 */
const loadHandlers = (url, content) => ({
    async content() {
        const contentHtml = await get_data({ url, isJson: false });
        content.html(contentHtml);
        msg.info(`Cargando contenido: ${url}`);
    },
    page() {
        content.html(`<iframe src="${url}" style="width:100%; height:100vh; border:none;"></iframe>`);
        msg.info(`Cargando página: ${url}`);
    },
    async file() {
        initializeProject(url);
        msg.info(`Mostrando archivo JSON: ${url}`);
    },
    image() {
        content.innerHTML = `<img src="${url}" alt="Imagen" style="max-width: 100%; height: auto;" />`;
        msg.info(`Mostrando imagen: ${url}`);
    },
    default() {
        msg.warning("Tipo de enlace no soportado.");
    }
});

/**
 * Función principal para manejar la carga de contenido según el tipo proporcionado.
 * Muestra el preloader y cambia el título del contenido si el tipo es válido, y llama
 * al método de carga específico basado en el tipo. También maneja errores y oculta el preloader.
 *
 * @param {Object} params - Objeto con propiedades 'type' y 'name' del contenido.
 * @param {string} url - URL del contenido a cargar.
 */
const handleContentLoading = async ({ type, name }, url) => {
    const contentPreloader = new preloader(Constants.CONTENT_PRELOADER);
    const content = $$(Constants.CONTENT);

    contentPreloader.show();
    if (type !== "system" && type !== "folder") {
        $$(Constants.CONTENT_TITLE).text(name);
    }

    try {
        const handlers = loadHandlers(url, content);
        const loadFunction = handlers[type] || handlers.default;

        await loadFunction();
    } catch (error) {
        console.error(`Error al cargar el tipo de contenido '${type}':`, error);
        msg.danger("Error al cargar el contenido. Verifica la consola para más detalles.");
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
        console.error(`Error al cargar ${selector}:`, error);
        msg.danger(`Ocurrió un error al cargar ${selector}.`);
    }
};
