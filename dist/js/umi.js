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
		let w = i(p('width')) || window.innerWidth - 35;
		let h = i(p('height')) || window.innerHeight - 35;
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
				value === Umi.formatShaderFloat(Umi._attributes[a])
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

		console.log(gl.getShaderInfoLog(shader));
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
		radial: true, // bool
		mass: 150, // int
		octaves: 6, // int
		persistence: 0.6, // float
		frequency: 0.005, // float
		water: 0.5 // float
	};

	// Alternative shorter param names
	Umi._params = {
		width: 'w',
		height: 'h',
		offsetx: 'x',
		offsety: 'y',
		square: 'sq',
		radial: 'r',
		mass: 'm',
		octaves: 'o',
		persistence: 'p',
		frequency: 'f',
		water: 'wt'
	};

	// Default gradients
	Umi._gradients = {
		colors: [
			[0.04, 0.32, 0.68], // Blue
			[0.23, 0.51, 0.83], // Light blue
			[0.61, 0.89, 0.99], // Bright blue
			[0.75, 0.65, 0.45], // Brown
			[0.31, 0.45, 0.14], // Green
			[0.71, 0.73, 0.47], // Yellow green
			[0.94, 0.93, 0.91] // Grayish white
		],
		positions: [0, 0.15, 0.2, 0.24, 0.33, 0.7, 0.8]
	};
}
