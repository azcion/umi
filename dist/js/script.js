const HEIGHT = 800;

const GRADIENTS = {
	desert: {
		colors: hexArrayToColors([
			'#F1C673',
			'#EAAC4A',
			'#2B601D',
			'#F8DDA0',
			'#A6D5D3'
		]),
		positions: [0, 0.6, 0.8, 0.85, 0.88]
	},
	forest: {
		colors: hexArrayToColors([
			'#3B5D0D',
			'#13280A',
			'#8B754B',
			'#C8CBCC',
			'#FFFFFF'
		]),
		positions: [0, 0.6, 0.8, 0.85, 0.99]
	},
	arctic: {
		colors: hexArrayToColors([
			'#1B3983',
			'#264EB8',
			'#72C8FB',
			'#CCFDFF',
			'#EBFAFE',
			'#DDFFFF'
		]),
		positions: [0, 0.01, 0.1, 0.2, 0.5, 0.99]
	},
	oldMap: {
		colors: hexArrayToColors([
			'#96A18B',
			'#596D5A',
			'#1D160B',
			'#AAA268',
			'#EBB468',
			'#959B5B',
			'#1D160B',
			'#51572A',
			'#51572A',
			'#1D160B',
			'#836E4B',
			'#E4CC95',
			'#8D775A',
			'#5e503b',
			'#CFCAA2'
		]),
		positions: [
			0, 0.14, 0.16, 0.18, 0.25, 0.48, 0.49, 0.5, 0.51, 0.68, 0.69, 0.7,
			0.8, 0.9, 0.99, 1
		]
	}
};

const CONFIG = {
	islands: {
		attributes: {
			radial: true
		}
	},
	desert: {
		attributes: {
			height: HEIGHT / 3,
			horizontal: true,
			mass: 500,
			octaves: 5,
			frequency: 0.0025,
			water: 0.45
		},
		gradients: GRADIENTS.desert
	},
	forest: {
		attributes: {
			height: HEIGHT,
			horizontal: true,
			water: 0.4
		},
		gradients: GRADIENTS.forest
	},
	arctic: {
		attributes: {
			height: HEIGHT,
			horizontal: true,
			radial: true,
			mass: 300,
			frequency: 0.0025
		},
		gradients: GRADIENTS.arctic
	},
	guide_top: {
		attributes: {
			mass: 1000,
			persistence: 0.55,
			frequency: 0.001,
			water: 0.4
		},
		gradients: GRADIENTS.oldMap
	},
	guide_direction_radial: {
		attributes: {
			radial: true
		},
		gradients: GRADIENTS.oldMap
	},
	guide_direction_horizontal: {
		attributes: {
			horizontal: true
		},
		gradients: GRADIENTS.oldMap
	},
	guide_direction_vertical: {
		attributes: {
			vertical: true
		},
		gradients: GRADIENTS.oldMap
	},
	guide_noise_octaves: {
		attributes: {
			octaves: 3
		},
		gradients: GRADIENTS.oldMap
	},
	guide_noise_persistence: {
		attributes: {
			persistence: 0.8
		},
		gradients: GRADIENTS.oldMap
	},
	guide_noise_frequency: {
		attributes: {
			frequency: 0.05
		},
		gradients: GRADIENTS.oldMap
	}
};

function hexArrayToColors(arr) {
	arr = arr.map(hex => {
		const c = hex.replace('#', '0x');
		return [
			((c >> 16) & 255) / 255,
			((c >> 8) & 255) / 255,
			(c & 255) / 255
		].map(c => Math.round(c * 100) / 100);
	});

	return arr;
}

class LogoTag extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		fetch(this.getAttribute('src'))
			.then(response => response.text())
			.then(text => {
				this.innerHTML = text;
			});
	}
}

customElements.define('custom-svg', LogoTag);

'use strict';

window.onload = paintCanvases;

function paintCanvases() {
	const page = document
		.querySelector('meta[data-page]')
		.getAttribute('data-page');

	switch (page) {
		case 'index':
			paintIndexCanvases();
			break;
		case 'gallery':
			paintGalleryCanvases();
			break;
		case 'guide':
			paintGuideCanvases();
			break;
	}
}

const Paint = class {
	constructor(fractionalSize, pixelsPerCell) {
		this.frac = fractionalSize;
		this.ppc = pixelsPerCell;
	}

	makeUmiImgs(selector, options, config, alt) {
		[...document.querySelectorAll(selector)].forEach(e => {
			const gl = e.getContext('webgl');
			gl.canvas.width = (gl.canvas.width / this.ppc) * this.frac;
			gl.canvas.height = (gl.canvas.height / this.ppc) * this.frac;

			const umi = new Umi(gl, options);
			umi.configureShader(config);
			umi.draw();
			const data = umi.gl.canvas.toDataURL();
			const img = document.createElement('img');
			img.alt = alt;
			img.src = data;
			const parent = e.parentNode;
			parent.replaceChildren(img);
		});
	}
};

async function paintIndexCanvases() {
	await Umi.loadShaders('glsl/');

	const grid = document.querySelector('.grid');
	const style = getComputedStyle(grid);
	const nColumns = style['grid-template-columns'].split(' ').length;
	const width = parseInt(style.width.slice(0, -2));
	const frac = width / nColumns;
	const p = new Paint(frac, 200);

	let options = {};
	let config = {
		attributes: {
			radial: true
		}
	};
	let alt = 'おそらく島の写真';
	p.makeUmiImgs('.umi', options, config, alt);
}

async function paintGuideCanvases() {
	await Umi.loadShaders('glsl/');

	const grid = document.querySelector('.grid');
	const style = getComputedStyle(grid);
	const nColumns = style['grid-template-columns'].split(' ').length;
	const width = parseInt(style.width.slice(0, -2));
	const frac = width / nColumns;
	const p = new Paint(frac, 200);

	let options = {};
	let config = CONFIG.guide_top;
	let alt = '手描き地図風の地形';
	p.makeUmiImgs('#guide-top', options, config, alt);

	config = CONFIG.guide_direction_radial;
	alt = '手描き地図風の島';
	p.makeUmiImgs('#dir-radial', options, config, alt);

	config = CONFIG.guide_direction_horizontal;
	alt = '手描き地図風の水平地形';
	p.makeUmiImgs('#dir-horizontal', options, config, alt);

	config = CONFIG.guide_direction_vertical;
	alt = 'おそらく島の写真';
	p.makeUmiImgs('#dir-vertical', options, config, alt);

	config = CONFIG.guide_noise_octaves;
	alt = '手描きの地図のスタイルの非常にシンプルな地形';
	p.makeUmiImgs('#noi-octaves', options, config, alt);

	config = CONFIG.guide_noise_persistence;
	alt = '手描きの地図のスタイルの非常に詳細な地形';
	p.makeUmiImgs('#noi-persistence', options, config, alt);

	config = CONFIG.guide_noise_frequency;
	alt = '手描きの地図のように細かく細かい島々が並ぶ、非常に断片的な世界';
	p.makeUmiImgs('#noi-frequency', options, config, alt);
}

async function paintGalleryCanvases() {
	await Umi.loadShaders('glsl/');

	const grid = document.querySelector('.grid');
	const style = getComputedStyle(grid);
	const nColumns = style['grid-template-columns'].split(' ').length;
	const width = parseInt(style.width.slice(0, -2));
	const gridHeight = parseInt(style.height.slice(0, -2));
	const frac = width / nColumns;
	const p = new Paint(frac, 200);

	let options = {};
	let config = CONFIG.islands;
	let alt = 'おそらく島の写真';
	p.makeUmiImgs('.islands .umi', options, config, alt);
	await new Promise(r => setTimeout(r, 250));

	options = {
		overrideSize: true
	};
	config = CONFIG.desert;
	alt = 'おそらく砂漠のオアシスの写真';
	p.makeUmiImgs('.desert .umi', options, config, alt);

	config = CONFIG.forest;
	alt = 'おそらく山岳林の写真';
	p.makeUmiImgs('.forest .umi', options, config, alt);

	config = CONFIG.arctic;
	alt = 'おそらく氷山の写真';
	p.makeUmiImgs('.arctic .umi', options, config, alt);
}

'use strict';

const Umi = class {
	constructor(context = null, options = null) {
		if (context?.canvas) {
			this.gl = context;
		} else if (context !== null) {
			console.error('Invalid context, expected WebGL');
		}

		this.options = {
			logQuery: options?.logQuery ?? false,
			overrideSize: options?.overrideSize ?? false
		};
	}

	useId(id) {
		this.gl = document.getElementById(id)?.getContext('webgl');

		if (!this.gl) {
			console.error(`Could not find id: '${id}'`);
		}
	}

	useClass(name) {
		this.gl = document.getElementsByClassName(name)[0]?.getContext('webgl');

		if (!this.gl) {
			console.error(`Could not find class: '${name}'`);
		}
	}

	static async loadShaders(path, vertex = 'vertex', fragment = 'fragment') {
		const shaders = await this.getShaders(path, vertex, fragment);
		Umi._shadersTemplate = { ...shaders };
	}

	configureShader(config = null, useDefault = false) {
		if (!this.gl) {
			console.error(
				'WebGL context not set.' +
					'Try useId(id) or useClass(name) before running this'
			);

			return;
		}

		const sc = {};

		if (useDefault) {
			sc.attributes = Umi._attributes;
			sc.gradients = Umi._gradients;
		} else {
			sc.attributes = this.getAttributes(config?.attributes);
			sc.gradients = config?.gradients || Umi._gradients;
		}

		this.gl.canvas.width = sc.attributes.width;
		this.gl.canvas.height = sc.attributes.height;
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

		const fragment = Umi.configureFragment(
			Umi._shadersTemplate.fragment,
			sc
		);

		this.shadersCompiled = {};
		this.shadersCompiled.fragment = Umi.createShader(
			this.gl,
			this.gl.FRAGMENT_SHADER,
			fragment
		);

		this.shadersCompiled.vertex = Umi.createShader(
			this.gl,
			this.gl.VERTEX_SHADER,
			Umi._shadersTemplate.vertex
		);
	}

	draw() {
		const program = Umi.createProgram(
			this.gl,
			this.shadersCompiled.vertex,
			this.shadersCompiled.fragment
		);

		const positionBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]),
			this.gl.STATIC_DRAW
		);

		const positionAttributeLocation = this.gl.getAttribLocation(
			program,
			'Position'
		);
		this.gl.vertexAttribPointer(
			positionAttributeLocation,
			2,
			this.gl.FLOAT,
			this.gl.FALSE,
			2 * Float32Array.BYTES_PER_ELEMENT,
			0
		);
		this.gl.enableVertexAttribArray(positionAttributeLocation);

		this.gl.useProgram(program);
		this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
		this.gl.useProgram(null);
	}

	static configureFragment(shader, config) {
		for (const option in config) {
			switch (option) {
				case 'gradients':
					shader = Umi.setShaderGradients(shader, config.gradients);
					break;
				case 'attributes':
					shader = Umi.setShaderAttributes(shader, config.attributes);
					break;
			}
		}

		return shader;
	}

	getAttributes(config = null) {
		let params;
		let p;

		if (config) {
			p = s => {
				let res;

				if (s in config) {
					res = config[s];
				} else if (Umi._params[s] in config) {
					// Short attribute name is used
					res = config[Umi.params[s]];
				} else if (['width', 'height'].includes(s)) {
					if (this.options.overrideSize) {
						// Attribute not overridden, but we don't
						// want the default value
						return false;
					}

					// Attribute not overridden, but we want
					// the existing size attribute
					return this.gl.canvas[s];
				}

				// Fallback to default if nullish
				return res ?? Umi._attributes[s];
			};
		} else {
			params = new URLSearchParams(window.location.search);
			p = s => {
				// Either long or short attribute name is used
				let res = params.get(s) ?? params.get(Umi._params[s]);

				if (res) {
					return res;
				}

				if (['width', 'height'].includes(s)) {
					if (this.options.overrideSize) {
						// Attribute not overridden, but we don't
						// want the default value
						return false;
					}

					// Attribute not overridden, but we want
					// the existing size attribute
					return this.gl.canvas[s];
				}

				// Fallback to default
				return Umi._attributes[s];
			};
		}

		const i = n => parseInt(n);
		const d = n => parseFloat(n);
		const b = s => [1, '1', true, 'true'].includes(s);

		// Width and height
		let w = i(p('width')) || window.innerWidth;
		let h = i(p('height')) || window.innerHeight;
		const square = b(p('square'));

		if (square) {
			// Force square using the shortest side
			if (w < h) {
				h = w;
			} else {
				w = h;
			}
		}

		// Seed
		const x = i(p('offsetx')) || Math.floor(Math.random() * 2 ** 20);
		const y = i(p('offsety')) || Math.floor(Math.random() * 2 ** 20);

		// World generation
		const radial = b(p('radial'));
		const horizontal = b(p('horizontal'));
		const vertical = b(p('vertical'));
		const mass = i(p('mass'));
		const octaves = i(p('octaves'));
		const persistence = d(p('persistence'));
		const frequency = d(p('frequency'));

		// Water level
		const water = d(p('water'));

		const attributes = {
			width: w,
			height: h,
			offsetx: x,
			offsety: y,
			square: square,
			radial: radial,
			_rad: radial ? 1 : 0,
			horizontal: horizontal,
			_hor: horizontal ? 1 : 0,
			vertical: vertical,
			_ver: vertical ? 1 : 0,
			mass: mass,
			octaves: octaves,
			persistence: Umi.formatShaderFloat(persistence),
			frequency: Umi.formatShaderFloat(frequency),
			water: Umi.formatShaderFloat(water)
		};

		if (this.options.logQuery) {
			console.log(Umi.joinAttributes(attributes));
		}

		return attributes;
	}

	static joinAttributes(attributes) {
		let params = [];

		for (const a in attributes) {
			const value = attributes[a];

			if (
				value == null ||
				value === 'NaN' ||
				value === Umi._attributes[a] ||
				value === Umi.formatShaderFloat(Umi._attributes[a]) ||
				value[0] === '_'
			) {
				continue;
			}

			params.push(`${Umi._params[a]}=${value}`);
		}

		return '?' + params.join('&');
	}

	static setShaderAttributes(shader, attributes) {
		for (const a in Umi._attributes) {
			shader = shader.replace(
				`%${a}%`,
				Umi.getIfValid(attributes[a]) || Umi._attributes[a]
			);
		}

		return shader;
	}

	static getIfValid(value) {
		if (value == null || isNaN(value) || value === 'NaN') {
			return false;
		}

		return value.toString();
	}

	static setShaderGradients(shader, gradients) {
		let colorsCode = '';
		let positionsCode = '';

		for (let i = 0; i < gradients.colors.length; ++i) {
			const c = gradients.colors[i].map(x => Umi.formatShaderFloat(x));
			const p = Umi.formatShaderFloat(gradients.positions[i]);
			colorsCode += `COL[${i}] = vec4(${c[0]}, ${c[1]}, ${c[2]}, 1.);\n\t`;
			positionsCode += `POS[${i}] = ${p};\n\t`;
		}

		shader = shader.replace(/%ncolors%/, gradients.colors.length);
		shader = shader.replace(/%colors%/, colorsCode);
		shader = shader.replace(/%positions%/, positionsCode);

		return shader;
	}

	static formatShaderFloat(number) {
		if (isNaN(number)) {
			return 'NaN';
		}

		let f = number.toString();

		// Number is an integer
		if (!f.includes('.')) {
			return f + '.';
		}

		const components = f.split('.');

		// Number doesn't start with a zero
		if (components[0] !== '0') {
			return f;
		}

		// Number starts with a zero
		return '.' + components[1];
	}

	static async getShaders(path, vertex, fragment) {
		const shaderFiles = [vertex, fragment];
		const shaders = {};

		for (const file of shaderFiles) {
			shaders[file] = await Umi.getFile(`${path}${file}.glsl`);
		}

		return shaders;
	}

	static async getFile(path) {
		return (await fetch(path, { method: 'GET' })).text();
	}

	static createShader(gl, type, source) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

		if (success) {
			return shader;
		}

		console.log(Umi.enumerateSource(source));
		console.error(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	}

	static createProgram(gl, vertexShader, fragmentShader) {
		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		const success = gl.getProgramParameter(program, gl.LINK_STATUS);

		if (success) {
			return program;
		}

		console.log(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
	}

	static enumerateSource(source) {
		return source
			.split('\n')
			.map((row, i) => `${('   ' + i).slice(-3)}: ${row}`)
			.join('\n');
	}
};

UMI_STATIC_PROPERTIES: {
	Umi._shadersTemplate = {};

	// Shader attributes with default values
	Umi._attributes = {
		width: 256, // int
		height: 256, // int
		offsetx: 0, // int
		offsety: 0, // int
		square: false, // bool
		radial: false, // bool
		horizontal: false, // bool
		vertical: false, // bool
		mass: 150, // int
		octaves: 6, // int
		persistence: 0.6, // float
		frequency: 0.005, // float
		water: 0.5, // float

		// These are implicit
		_rad: 0,
		_hor: 0,
		_ver: 0
	};

	// Alternative shorter param names
	Umi._params = {
		width: 'w',
		height: 'h',
		offsetx: 'x',
		offsety: 'y',
		square: 'sq',
		radial: 'r',
		horizontal: 'hz',
		vertical: 'vt',
		mass: 'm',
		octaves: 'o',
		persistence: 'p',
		frequency: 'f',
		water: 'wt'
	};

	// Default gradients
	Umi._gradients = {
		colors: [
			[0.04, 0.32, 0.68], // #0a51ad
			[0.23, 0.51, 0.83], // #3a82d3
			[0.61, 0.89, 0.99], // #9be2fc
			[0.75, 0.65, 0.45], // #bfa572
			[0.31, 0.45, 0.14], // #4f7223
			[0.71, 0.73, 0.47], // #b5ba77
			[0.94, 0.93, 0.91] // #efede8
		],
		positions: [0, 0.15, 0.2, 0.24, 0.33, 0.7, 0.8]
	};
}
