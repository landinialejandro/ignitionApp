import { $$ } from './selector.js';

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




// Función para mostrar el menú contextual
const showContextMenu = (event, anchor) => {
    // Obtener el tipo de anchor
    const type = anchor.getAttribute('data-type');

    // Limpiar las opciones anteriores
    const menuOptions = document.getElementById('menu-options');
    menuOptions.innerHTML = '';

    // Crear las opciones basadas en el tipo
    const options = getOptionsByType(type);

    // Generar dinámicamente las opciones del menú
    options.forEach(option => {
        const li = document.createElement('li');
        li.textContent = option.label;
        li.addEventListener('click', option.action);
        menuOptions.appendChild(li);
    });

    // Posicionar y mostrar el menú contextual
    const menu = document.getElementById('context-menu');
    // Obtener el tamaño del menú y el tamaño de la ventana del navegador
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calcular la posición inicial del menú basado en la posición del clic
    let posX = event.clientX;
    let posY = event.clientY;

    // Ajustar la posición si el menú se sale del borde derecho de la ventana
    if (posX + menuWidth > windowWidth) {
        posX = windowWidth - menuWidth - 10; // Agregar un pequeño margen
    }

    // Ajustar la posición si el menú se sale del borde inferior de la ventana
    if (posY + menuHeight > windowHeight) {
        posY = windowHeight - menuHeight - 10; // Agregar un pequeño margen
    }

    // Posicionar el menú en la pantalla
    menu.style.top = `${posY}px`;
    menu.style.left = `${posX}px`;
    menu.style.display = 'block';
};

// Función para obtener opciones según el tipo del anchor
const getOptionsByType = (type) => {
    if (type === 'root') {
        return [
            { label: 'Open', action: () => console.log('Open file') },
            { label: 'Delete', action: () => console.log('Delete file') }
        ];
    } else if (type === 'group') {
        return [
            { label: 'View', action: () => console.log('View page') },
            { label: 'Edit', action: () => console.log('Edit page') }
        ];
    }
    // Puedes agregar más tipos aquí
    return [];
};

// Función para ocultar el menú contextual
const hideContextMenu = () => {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.display = 'none';
};

// Evento delegado para mostrar el menú contextual al hacer clic en un anchor con clase .node-link
document.addEventListener('contextmenu', function (e) {
    // Verificar si el clic fue en un anchor con la clase .node-link
    const anchor = e.target.closest('a.node-link');
    if (anchor) {
        e.preventDefault(); // Evitar el comportamiento predeterminado del anchor
        showContextMenu(e, anchor); // Mostrar el menú contextual
    }
});

// Evento para ocultar el menú contextual al hacer clic fuera de él
document.addEventListener('click', function (e) {
    const contextMenu = document.getElementById('context-menu');
    if (!contextMenu.contains(e.target)) {
        hideContextMenu();
    }
});
