import { $$ } from './selector.js';
import { NodeTypeManager } from './NodeTypeManager.js';
import { ContextMenu } from './ContextMenu.js';



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

// Evento delegado para mostrar el menú contextual al hacer clic en un anchor con clase .node-link
document.addEventListener('contextmenu', function (e) {
    // Verificar si el clic fue en un anchor con la clase .node-link
    const anchor = e.target.closest('a.node-link');
    if (anchor) {
        e.preventDefault(); // Evitar el comportamiento predeterminado del anchor
        const type = anchor.getAttribute('data-type');
        async function initializeNodeTypes() {
            const nodeTypeManager = new NodeTypeManager();
            await nodeTypeManager.loadFromFile('./settings/types.json');
            // Ahora puedes usar nodeTypeManager con los tipos cargados
            const contextMenu = new ContextMenu('context-menu', 'menu-options', nodeTypeManager);
            contextMenu.show(e, anchor);
        }
        
        initializeNodeTypes();


        // Verificar si el tipo permite agregar nodos y cargar las opciones correspondientes
        //contextMenu.populateOptions(options); // Mostrar las opciones de agregar nodos
    }
});
