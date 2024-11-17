import { get_data } from './common.js';

export const RegisterHelpers = () => {
	msg.info("registering helpers...")

	/**
	 * @helper Handlebars.registerHelper("when")
	 * 
	 * Este helper evalúa una condición lógica o relacional entre dos operandos utilizando un operador dado.
	 * Permite construir plantillas más dinámicas evaluando lógica directamente en Handlebars.
	 *
	 * @param {any} operand_1 - Primer operando para la comparación o evaluación lógica.
	 * @param {string|function} operator - Operador para evaluar la condición. Puede ser:
	 *      - Una clave que apunta a una función predefinida en el objeto `operators` (e.g., 'eq', 'gt').
	 *      - Una función personalizada proporcionada directamente.
	 * @param {any} operand_2 - Segundo operando para la comparación o evaluación lógica.
	 * @param {Object} options - Objeto interno de Handlebars que contiene:
	 *      - `fn` - Bloque "then", que se renderiza si la condición es verdadera.
	 *      - `inverse` - Bloque "else", que se renderiza si la condición es falsa.
	 * 
	 * @returns {string} Renderiza el bloque correspondiente basado en el resultado de la evaluación.
	 */

	Handlebars.registerHelper("when", function (operand_1, operator, operand_2, options) {
		// Operadores predefinidos que manejan lógica común y comparaciones
		const operators = {
			// Comparación de igualdad
			'eq': (l, r) => l == r, // Comparación flexible (sin tipo)
			'noteq': (l, r) => l != r, // Diferente de (sin tipo)

			// Comparaciones numéricas
			'gt': (l, r) => Number(l) > Number(r), // Mayor que
			'lt': (l, r) => Number(l) < Number(r), // Menor que
			'gte': (l, r) => Number(l) >= Number(r), // Mayor o igual
			'lte': (l, r) => Number(l) <= Number(r), // Menor o igual

			// Operadores lógicos
			'or': (l, r) => Boolean(l) || Boolean(r), // Al menos uno verdadero
			'and': (l, r) => Boolean(l) && Boolean(r), // Ambos verdaderos

			// Comparación de módulo
			'%': (l, r) => (Number(l) % Number(r)) === 0, // Comprobación de divisibilidad

			// Evaluaciones de cadena
			'inString': (l, r) => typeof r === 'string' && r.indexOf(l) !== -1, // L está dentro de R
			'notInString': (l, r) => typeof r === 'string' && r.indexOf(l) === -1, // L no está dentro de R
		};

		try {
			// Validar que el operador sea válido (predefinido o función personalizada)
			if (!operators[operator] && typeof operator !== 'function') {
				throw new Error(`Operador "${operator}" no está definido en el helper "when".`);
			}

			// Determinar la función a usar: predefinida o personalizada
			const operation = typeof operator === 'function' ? operator : operators[operator];

			// Validar que ambos operandos estén definidos
			if (operand_1 === undefined || operand_2 === undefined) {
				throw new Error("Faltan operandos para evaluar la condición.");
			}

			// Evaluar la condición utilizando la operación definida
			const result = operation(operand_1, operand_2);

			// Renderizar el bloque correspondiente basado en el resultado
			if (result) {
				return options.fn(this); // Renderiza el bloque "then"
			} else if (typeof options.inverse === 'function') {
				return options.inverse(this); // Renderiza el bloque "else", si está definido
			}

			// Si no hay bloque "else", devuelve una cadena vacía
			return '';
		} catch (error) {
			// Capturar y registrar cualquier error que ocurra durante la evaluación
			console.error(`Error en helper "when": ${error.message}`);

			// Renderizar el bloque "else" en caso de error o devolver cadena vacía si no está definido
			return typeof options.inverse === 'function' ? options.inverse(this) : '';
		}
	});

	Handlebars.registerHelper("showToolsBox", function (type, children, options) {
		const show = (type !== 'content') || !!children;
		return show ? options.fn(this) : options.inverse(this);
	});

	Handlebars.registerHelper('classNames', function (...args) {
		const options = args.pop(); // Extrae las opciones
		const classList = args.filter(Boolean).join(' '); // Filtra valores nulos
		return classList;
	});

	Handlebars.registerHelper('or', function (a, b) {
		return a || b;
	});

	Handlebars.registerHelper('eq', function (a, b) {
		return a === b;
	});

	Handlebars.registerHelper('truncate', function (text, maxLength) {
		if (text.length <= maxLength) return text;
		const partLength = Math.floor((maxLength - 3) / 2);
		return `${text.slice(0, partLength)}...${text.slice(-partLength)}`;
	});

	Handlebars.registerHelper('concat', function (...args) {
		// Elimina el último argumento (opciones de Handlebars)
		args.pop();
		return args.join('');
	});

	Handlebars.registerHelper('default', function (value, defaultValue) {
		return value || defaultValue;
	});

	Handlebars.registerHelper('isArray', function (value, options) {
		return Array.isArray(value) ? options.fn(this) : options.inverse(this);
	});


}

export const RegisterPartials = async () => {
	msg.info("registering partials...");

	const url = 'ignitionApp.php';
	const data = {
		id: 'templates/partials',
		operation: 'get_node'
	};

	try {
		// Llamada a la función `get_data` para obtener los datos
		const filesContent = await get_data({ url, data });

		for (const [key, fileInfo] of Object.entries(filesContent)) {
			//console.log(`Fetching template from: ${fileInfo.url}`); // Verificar URL

			const t = await get_data({ url: fileInfo.url, isJson: false });
			let indicePunto = fileInfo.caption.indexOf('.');
			let name = indicePunto !== -1 ? fileInfo.caption.substring(0, indicePunto).toLowerCase() : fileInfo.caption.toLowerCase();

			// Compilar la plantilla antes de registrarla en Handlebars
			const compiledTemplate = Handlebars.compile(t);
			Handlebars.registerPartial(name, compiledTemplate);
			msg.secondary(`Partial ${name} registrado.`, true);
		}

	} catch (error) {
		console.error(`Error registrando partials: ${error.message}`);
	}
	msg.info("partials registered and compiled.");
};
