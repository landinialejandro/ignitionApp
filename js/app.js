import Constants from './constants.js';

import { get_data, checkContainerAvailability, updateSidebarOverflow } from './libraries/common.js';
import { Msglog } from "./libraries/MsgLog.js";
import { RegisterPartials, RegisterHelpers } from './libraries/hbs.js';
import { preloader, renderTemplate, getDirCollectionJson } from './libraries/helpers.js';
import { $$ } from './libraries/selector.js';

// import { checkContainerAvailability } from './ignitionAppSidebar.js';
import { initializeProject } from './project.js';

window.msg = new Msglog();
msg.success("Iniciando app.js", true);
const maiPreloader = new preloader(Constants.PRELOADER_ID);

window.onload = async function () {
    try {

        // Obtener la configuración de la aplicación
        const setting = await get_data({ url: "settings/settings.json" });
        const version = setting.version || "0.0.0";
        const release = setting.release || "bad file";
        const text = `${version} - ${release}`;

        // Mostrar información de la versión al usuario
        msg.info(`Versión: ${text}`);
        $$(Constants.VERSION_CONTENT).html(text);

        RegisterHelpers();
        await RegisterPartials();

        // Cargar las diferentes secciones del navBar
        loadNavBar(Constants.SIDEBAR_CONTENT, await get_data({ url: "settings/nav_sidebar.json" }));
        // loadNavBar('#navbarNav', await get_data({ url: "settings/nav_headerbar.json" }));
        loadNavBar('#projects-list', await getDirCollectionJson("projects"));
        loadNavBar('#settings-list', await getDirCollectionJson("settings"));
        addEventsListener();

    } catch (error) {
        // Registrar el error y notificar al usuario
        console.error("Error al inicializar la aplicación:", error);
        msg.danger("Ocurrió un problema al iniciar la aplicación. Por favor, inténtalo de nuevo más tarde.");
    } finally {
        // Ocultar el preloader siempre, incluso si ocurrió un error
        // updateSidebarOverflow();
        maiPreloader.hide();
    }
};

// Función principal para añadir todos los event listeners
const addEventsListener = () => {
    msg.secondary("addEventsListenerApp", true);
    navLinkListener();
    // Aquí puedes agregar más listeners si es necesario en el futuro
};

const navLinkListener = () => {
    $$("a.nav-link").on("click", async function (e) {
        e.preventDefault();
        msg.info(`Navlink clicked: ${this.textContent.trim()}`, true);
        const url = $$(this).attr("href");
        const data = $$(this).allData();
        await handleContentLoading(data, url);
    });
};

// Función para manejar el contenido según el tipo
const handleContentLoading = async ({ type, name }, url) => {
    const contentPreloader = new preloader(Constants.CONTENT_PRELOADER);
    const content = $$(Constants.CONTENT);
    $$(Constants.CONTENT_TITLE).text(name);

    try {
        // Instanciar el preloader para #main-content
        // los type system y folder se consultan antes y se sale de inmediato
        contentPreloader.show();// Mostrar preloader
        switch (type) {
            case "content":
                await loadContent(url, content);
                break;
            case "page":
                loadPage(url, content);
                break;

            case "file":
                await loadProject(url, content);
                break;

            case "image":
                loadImageContent(url, content);
                break;

            case "system":

            case "folder":

                break;
            default:
                msg.warning("Tipo de enlace no soportado.");
                break;
        }
    } catch (error) {
        console.error("Error al manejar el clic:", error);
        msg.danger("Error al cargar el contenido. Verifica la consola para más detalles.");
    } finally {
        contentPreloader.hide(); // Ocultar preloader siempre
    }
};

// Cargar contenido de una página en un iframe
const loadPage = (url, container) => {
    container.html(`<iframe src="${url}" style="width:100%; height:100vh; border:none;"></iframe>`);
    msg.info(`Cargando página: ${url}`);
};

// Cargar contenido de una página en un iframe
const loadContent = async (url, container) => {
    container.html(await get_data({ url, isJson: false }));
    msg.info(`Cargando página: ${url}`);
};

// Cargar y mostrar contenido JSON formateado
const loadProject = async (url, container) => {
    initializeProject(url);
    msg.info(`Mostrando archivo JSON: ${url}`);
};

// Cargar y mostrar una imagen
const loadImageContent = (url, container) => {
    container.innerHTML = `<img src="${url}" alt="Imagen" style="max-width: 100%; height: auto;" />`;
    msg.info(`Mostrando imagen: ${url}`);
};

/**
 * Carga y renderiza una sección del main-headerbar y main-sidebar.
 * 
 * @param {string} selector - Selector CSS del contenedor donde se renderizará el contenido.
 * @param {string} url - URL de donde se obtendrán los datos.
 * @param {Object} [data] - Parámetros adicionales para la solicitud (opcional).
 * @returns {Promise<void>} - Una promesa que indica la finalización del proceso.
 */
const loadNavBar = async (selector, content) => {
    try {
        // Preparar el objeto para Handlebars templates/nav_bar.hbs si es necesario
        content = content.menu ? content : { menu: content };
        $$(selector).html(await renderTemplate("templates/nav_bar.hbs", content));
        msg.secondary(`${selector} cargado correctamente.`, true);
    } catch (error) {
        console.error(`Error al cargar ${selector}:`, error);
        msg.danger(`Ocurrió un error al cargar ${selector}.`);
    }
}

