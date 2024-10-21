import { get_data } from './common.js';

const RegisterHelpers = () => {
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

}

const RegisterPartials = () => {
	msg.info("registering partials...")
	const partials = ["modalHeader", "modalFooter", "menuItem", "projectItem", "component_i"]
	partials.forEach(async (e) => {
		var url = `templates/partials/${e}.hbs`
		var t = await get_data({ url, isJson: false })
		Handlebars.registerPartial(e, t)
	})
}

const getChildrenHelper = (form) => {
	Handlebars.registerHelper('getchildren', function (id, options) {
		return process_template(id, options, form)
	});
}

const properties_template = (form) => {
	Handlebars.registerHelper('properties_template', function (id, options) {
		return process_template(id, options, form)
	})
}

const process_template = (id, options, form) => {
	var nodeid = prjTree().get_json(id)
	var template = Handlebars.compile(form)
	var type = options.data.root.type
	if (type != 'filed' && type != 'field-settings') {
		nodeid['readonly'] = true
	}
	var res = template(nodeid)
	return res;
}

RegisterHelpers()
RegisterPartials()