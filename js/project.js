import { get_data, Msglog } from './common.js';
import { preloader, renderTemplate } from './helpers.js';
import { $$ } from './selector.js';

import { NodeTypeManager } from './NodeTypeManager.js';
import { ContextMenu } from './ContextMenu.js';

window.msg = new Msglog();

export const initializeProject = async (url) => {

    const projectPage = await get_data({ url: "pages/project_page.html", isJson: false })
    $$("#main-content").html(projectPage)

    const content = await get_data({ url });
    $$(".project-card-body").html(await renderTemplate("templates/project_tree.hbs", content));

    addEventsListener();
}

// Función para manejar el contenido según el tipo
export const handleProjectTree = async (node) => {

    const { type, name } = $$(node).allData();
    msg.info(`NODElink clicked: ${name}`, true);

    $$(".editor-card > div.card-header > h3.card-title").text(name);

    try {
        // Instanciar el preloader para #main-content
        // los type system y folder se consultan antes y se sale de inmediato
        switch (type) {
            case "root":
                // expando el root
                // puedo agregar los type permitidos
                // si hay settings los pongo el editor
                break;
            case "root-settings":
                break;

            case "group":
                break;

            case "group-settings":
                break;

            case "table":
                break;

            case "table-settings":
                break;

            case "field":

                break;
            case "field-settings":

                break;
            default:
                msg.warning("Tipo de enlace no soportado.");
                break;
        }
    } catch (error) {
        console.error("Error al manejar el clic:", error);
        msg.danger("Error al cargar el contenido. Verifica la consola para más detalles.");
    } finally {
    }
};

// Función principal para añadir todos los event listeners
const addEventsListener = () => {
    msg.secondary("addEventsListenerProject", true);
    projectNodesListener();
    contextMenuListener();
    // Aquí puedes agregar más listeners si es necesario en el futuro
};
const contextMenuListener = () =>{
    // Evento delegado para mostrar el menú contextual al hacer clic en un anchor con clase .node-link
    document.addEventListener('contextmenu', function (e) {
        // Verificar si el clic fue en un anchor con la clase .node-link
        const anchor = e.target.closest('a.node-link');
        if (anchor) {
            e.preventDefault(); // Evitar el comportamiento predeterminado del anchor
            async function initializeNodeTypes() {
                const nodeTypeManager = new NodeTypeManager();
                await nodeTypeManager.loadFromFile('./settings/types.json');
                // Ahora puedes usar nodeTypeManager con los tipos cargados
                const contextMenu = new ContextMenu('context-menu', 'menu-options', nodeTypeManager);
                contextMenu.show(e, anchor);
            }
    
            initializeNodeTypes();
        }
    });
}

const projectNodesListener = () =>{
    $$("#main-content").on("click", function (e) {
        // Delegar el evento click en todos los elementos con la clase `a.node-link` en un proyecto abierto
        const anchor = e.target.closest('a.node-link');
        if (anchor) {
            e.preventDefault();
            handleProjectTree(anchor);
        }
    });
}
