export const $$ = (input) => {
    const elements = typeof input === 'string'
        ? document.querySelectorAll(input)
        : input instanceof HTMLElement
            ? [input]
            : [];

    if (!elements.length) {
        console.warn('No elements found for the given input.');
    }

    const api = {
        elements,
        html(content) {
            if (content !== undefined) {
                elements.forEach((element) => {
                    element.innerHTML = content;
                });
                return this; // Encadenamiento
            } else {
                return elements[0]?.innerHTML;
            }
        },
        text(content) {
            if (content !== undefined) {
                elements.forEach((element) => {
                    element.textContent = content;
                });
                return this; // Encadenamiento
            } else {
                return elements[0]?.textContent;
            }
        },
        css(propertyOrObject, value) {
            if (typeof propertyOrObject === "object") {
                // Caso: Formato de objeto
                Object.entries(propertyOrObject).forEach(([key, val]) => {
                    elements.forEach((element) => {
                        element.style[key] = val;
                    });
                });
            } else if (typeof propertyOrObject === "string" && value !== undefined) {
                // Caso: Formato tradicional (propiedad, valor)
                elements.forEach((element) => {
                    element.style[propertyOrObject] = value;
                });
            } else {
                console.error('Property and value must be provided, or an object with styles.');
            }
            return this; // Encadenamiento
        },
        addClass(className) {
            if (!className) {
                console.error('Class name must be provided.');
                return this;
            }
            elements.forEach((element) => {
                element.classList.add(className);
            });
            return this; // Encadenamiento
        },
        removeClass(className) {
            if (!className) {
                console.error('Class name must be provided.');
                return this;
            }
            elements.forEach((element) => {
                element.classList.remove(className);
            });
            return this; // Encadenamiento
        },
        remove() {
            elements.forEach((element) => {
                element.remove();
            });
            return this; // Encadenamiento
        },
        on(eventType, selectorOrHandler, handler) {
            if (!eventType) {
                console.error('Event type must be provided.');
                return this; // Mantener encadenamiento
            }

            const isDelegation = typeof selectorOrHandler === 'string'; // Verificar si es un selector
            const actualHandler = isDelegation ? handler : selectorOrHandler;
            const selector = isDelegation ? selectorOrHandler : null;

            if (typeof actualHandler !== 'function') {
                console.error('Valid handler function must be provided.');
                return this; // Mantener encadenamiento
            }

            elements.forEach((element) => {
                const delegatedHandler = (event) => {
                    if (selector) {
                        // Manejar delegación: verificar si el target coincide con el selector
                        const potentialTargets = element.querySelectorAll(selector);
                        let target = event.target;
                        while (target && target !== element) {
                            if ([...potentialTargets].includes(target)) {
                                actualHandler.call(target, event); // Ejecutar en el target encontrado
                                return;
                            }
                            target = target.parentNode;
                        }
                    } else {
                        // Evento directo
                        actualHandler(event);
                    }
                };

                element.addEventListener(eventType, delegatedHandler);

                // Guardar referencia para usar en "off"
                element._eventListeners = element._eventListeners || {};
                element._eventListeners[eventType] = element._eventListeners[eventType] || [];
                element._eventListeners[eventType].push(delegatedHandler);
            });

            return this; // Encadenamiento
        },
        off(eventType, handler) {
            if (!eventType || typeof handler !== 'function') {
                console.error('Valid event type and handler function must be provided.');
                return this;
            }
            elements.forEach((element) => {
                element.removeEventListener(eventType, handler);
            });
            return this; // Encadenamiento
        },
        allData() {
            if (!elements.length) {
                return []; // Devuelve un array vacío si no hay elementos seleccionados
            }
            if (elements.length === 1) {
                // Si solo hay un elemento, devolver su dataset como objeto
                return { ...elements[0].dataset };
            }
            // Si hay múltiples elementos, devolver un array de datasets
            return Array.from(elements).map((element) => ({ ...element.dataset }));
        },

    };

    return Object.create(api); // Crear un nuevo objeto con los métodos en el prototipo
};
