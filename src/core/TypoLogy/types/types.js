/**
 * @typedef {Object} IconType
 * Representa el ícono asociado a un tipo de nodo o nodo individual.
 * 
 * @property {string} type - Tipo del ícono ('class', 'svg', etc.).
 * @property {string} value - Valor del ícono (clase CSS, código SVG, etc.).
 */

/**
 * @typedef {Object} NodeTypeAction
 * Representa una acción disponible para un tipo de nodo.
 * 
 * @property {string} label - Etiqueta descriptiva de la acción (ej. 'Renombrar nodo').
 * @property {string} callback - Nombre del callback o función asociada.
 * @property {string} [typeToAdd] - (Opcional) Tipo de nodo que se debe agregar (para acciones como 'add').
 */

/**
 * @typedef {Object.<string, NodeTypeAction>} NodeTypeActions
 * Representa un conjunto de acciones asociadas a un tipo de nodo.
 */

/**
 * @typedef {Object} NodeTypeAttributes
 * Atributos asociados a un tipo de nodo.
 * 
 * @property {string} id - Identificador único opcional del tipo de nodo.
 * @property {string} name - Nombre legible del tipo.
 * @property {string} [description] - Descripción breve del tipo.
 * @property {string} [caption] - Leyenda asociada al tipo de nodo.
 * @property {number} [maxChildren] - Máximo número de hijos permitidos (Infinity si no hay límite).
 * @property {number} [maxDepth] - Profundidad máxima permitida (Infinity si no hay límite).
 * @property {boolean} [unique=false] - Indica si este nodo debe ser único en todo el árbol.
 * @property {boolean} [uniqueWithinParent=false] - Indica si el nodo debe ser único dentro de su padre.
 * @property {boolean} [required=false] - Indica si este nodo es obligatorio en el árbol.
 * @property {string[]} [validChildren] - Lista de tipos de nodos permitidos como hijos (vacío significa no permitido).
 * @property {IconType} [icon] - Ícono asociado al tipo de nodo.
 * @property {NodeTypeActions} [actions] - Conjunto de acciones permitidas para este tipo de nodo.
 */

/**
 * @typedef {Object.<string, NodeTypeAttributes>} NodeTypes
 * Representa un conjunto de tipos de nodos definidos en Typology.
 * Las claves son los nombres de los tipos de nodos (ej. 'root', 'group') y los valores son sus atributos.
 */

/**
 * @typedef {Object} Property
 * Representa una propiedad individual que define reglas para un formulario HTML.
 * 
 * @property {string} caption - Título o etiqueta de la propiedad.
 * @property {Object} [usershelper] - Ayuda contextual para usuarios.
 * @property {string} [usershelper.caption] - Texto descriptivo para la propiedad.
 * @property {string} [usershelper.class] - Clase CSS asociada a la ayuda contextual.
 * @property {Property[]} [properties] - Subpropiedades anidadas dentro de esta propiedad.
 * @property {string} type - Tipo de campo del formulario (ej. 'input-group', 'textarea', etc.).
 * @property {IconType} [icon] - Ícono representativo para la propiedad.
 * @property {Object} [li_attr] - Atributos personalizados asociados a la propiedad.
 * @property {string} [li_attr.type] - Tipo específico de atributo (ej. 'captions').
 * @property {string} [li_attr.lang] - Idioma asociado (ej. 'en').
 * @property {number} [order] - Orden de aparición en el formulario.
 */

/**
 * @typedef {Object} Node
 * Representa un nodo individual en el árbol.
 * 
 * @property {string} id - Identificador único del nodo.
 * @property {string} type - Tipo del nodo, referenciado en los tipos definidos en Typology.
 * @property {string} caption - Leyenda o título del nodo.
 * @property {IconType} icon - Ícono del nodo.
 * @property {Object} [li_attr] - Atributos personalizados para el contenedor del nodo (li en HTML).
 * @property {Object} [a_attr] - Atributos personalizados para el enlace del nodo (a en HTML).
 * @property {Object} [state] - Representa el estado actual del nodo (ej. expandido, seleccionado, etc.).
 * @property {Property[]} [properties] - Lista de propiedades asociadas al nodo, que definen sus reglas HTML.
 * @property {Node[]} [children] - Lista de nodos hijos. Puede estar vacía si no tiene hijos.
 */

/**
 * @typedef {Object} TreeNode
 * Representa un nodo de árbol con validación estructural y lógica jerárquica.
 * 
 * @property {Node} node - Nodo individual con sus atributos.
 * @property {Node[]} children - Hijos del nodo, con validaciones aplicadas.
 * @property {number} currentDepth - Profundidad actual del nodo dentro del árbol.
 */

/**
 * @typedef {Object} ValidationResult
 * Representa el resultado de una validación en Typology.
 * 
 * @property {boolean} isValid - Indica si la validación fue exitosa.
 * @property {string} [error] - Mensaje de error descriptivo si la validación falla.
 * @property {string} [type] - Tipo de validación realizada (ej. 'depth', 'children').
 */
