import { get_data } from './common.js';

export const RegisterHelpers = () => {
	msg.info("registering helpers...")
	Handlebars.registerHelper("when", function (operand_1, operator, operand_2, options) {
		var operators = {
			'eq': (l, r) => l == r,
			'noteq': (l, r) => l != r,
			'gt': (l, r) => Number(l) > Number(r),
			'or': (l, r) => l || r,
			'and': (l, r) => l && r,
			'%': (l, r) => (l % r) === 0,
			"inString": (l, r) => r.indexOf(l) !== -1,
			"notInString": (l, r) => r.indexOf(l) === -1,
		}
		result = operators[operator](operand_1, operand_2)
		if (result) return options.fn(this)
		else return options.inverse(this)
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
