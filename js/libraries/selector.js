/**
 * `$$` es una función utilitaria para la manipulación del DOM que proporciona métodos sencillos
 * para interactuar con los elementos seleccionados mediante un selector CSS o un elemento del DOM.
 *
 * @param {string | HTMLElement} input - Un selector CSS o un elemento del DOM.
 *
 * @returns {Object} Un objeto con métodos para manipular los elementos seleccionados:
 *   - `html(content)`: Establece o devuelve el contenido HTML.
 *   - `text(content)`: Establece o devuelve el contenido de texto.
 *   - `css(property, value)`: Establece una propiedad CSS.
 *   - `on(eventType, handler)`: Añade un manejador de eventos.
 *   - `data(attr)`: Devuelve el valor del atributo `data-*` solicitado.
 *   - `allData()`: Devuelve todos los atributos `data-*` del primer elemento como un objeto.
 *   - `attr(attribute, value)`: Obtiene o establece un atributo del elemento.
 */
export const $$ = (input) => {
    const elements = typeof input === 'string'
        ? document.querySelectorAll(input)
        : input instanceof HTMLElement
        ? [input]
        : [];

    return {
        html: (content) => {
            if (content !== undefined) {
                elements.forEach((element) => (element.innerHTML = content));
            } else {
                return elements[0]?.innerHTML;
            }
        },
        text: (content) => {
            if (content !== undefined) {
                elements.forEach((element) => (element.textContent = content));
            } else {
                return elements[0]?.textContent;
            }
        },
        css: (property, value) => {
            elements.forEach((element) => {
                element.style[property] = value;
            });
        },
        on: (eventType, handler) => {
            elements.forEach((element) => {
                element.addEventListener(eventType, handler);
            });
        },
        data: (attr) => {
            return elements.length
                ? elements[0].dataset[attr] || null
                : null;
        },
        allData: () => {
            const element = elements[0];
            if (!element) return {};

            return { ...element.dataset };
        },
        attr: (attribute, value) => {
            if (value !== undefined) {
                elements.forEach((element) => {
                    element.setAttribute(attribute, value);
                });
            } else {
                return elements[0]?.getAttribute(attribute);
            }
        },
    };
};
