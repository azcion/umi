'use strict';

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

	makeUmiCanvas(selector, options, config, alt) {
		const e = document.querySelector(selector);
		const gl = e.getContext('webgl');
		gl.canvas.width = (gl.canvas.width / this.ppc) * this.frac;
		gl.canvas.height = (gl.canvas.height / this.ppc) * this.frac;

		const umi = new Umi(gl, options);
		umi.configureShader(config);
		umi.draw();
		const data = umi.gl.canvas.toDataURL('image/jpeg', 0.2);
		const img = document.createElement('img');
		img.src = data;
		const parent = e.parentNode;
		parent.replaceChildren(img);

		if (selector.includes('skip-3')) {
			img.onload = () => {
				img.parentNode.parentNode.hidden = false;
				document.querySelector(selector + '-arrow').hidden = false;
			};

			return;
		}

		const canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 256;
		parent.appendChild(canvas);
		const ctx = canvas.getContext('2d');

		img.onload = () => {
			img.parentNode.parentNode.hidden = false;

			if (!selector.includes('postcard')) {
				document.querySelector(selector + '-arrow').hidden = false;
			}

			Paint.construct(img, ctx, selector);
			const resImg = document.createElement('img');
			resImg.alt = alt;
			resImg.src = ctx.canvas.toDataURL('image/png', 0);
			parent.replaceChildren(resImg);

			if (selector.includes('skip')) {
				return;
			}

			const branch = document.createElement('img');
			branch.id = 'branch';
			branch.alt = '桜の枝';
			branch.src = 'img/branch.png';
			parent.appendChild(branch);

			const sakura = document.createElement('img');
			sakura.id = 'sakura';
			sakura.alt = '桜の花';
			sakura.src = 'img/sakura.png';
			parent.appendChild(sakura);
		};
	}

	static construct(img, ctx, selector) {
		ctx.drawImage(img, 0, 0);
		img.parentNode.removeChild(img);

		const imageData = ctx.getImageData(0, 0, 256, 256);
		ctx.canvas.height = 128;
		const iData = imageData.data;

		const special3d = selector.includes('special-3d');
		const everyN = special3d ? 2 : 16;
		const nLayers = 256 / everyN;

		// nLayers x 256
		const heights = [];

		for (let y = 0; y < 256; y += everyN) {
			const line = [];

			// Copy
			for (let x = 0; x < 256; ++x) {
				const i = (y * 256 + x) * 4;
				line.push(iData[i]);
			}

			// Smoothing
			for (let x = 1; x < 255; ++x) {
				const a = line[x - 1];
				const b = line[x];
				const c = line[x + 1];

				const n = 0.7 * a + 0.15 * (b + c);
				line[x] = parseInt(n);
			}

			heights.push(line);
		}

		const ftoi = s => hexArrayToColors([s])[0].map(n => parseInt(n * 255));
		const rgb = c => {
			return { r: c[0], g: c[1], b: c[2] };
		};

		const f = rgb(ftoi('#f98d27'));
		const border = rgb(ftoi('#555555'));
		const doBorder = false;
		const g = [
			rgb(ftoi('#0a51ad')),
			rgb(ftoi('#3a82d3')),
			rgb(ftoi('#9be2fc')),
			rgb(ftoi('#bfa572')),
			rgb(ftoi('#4f7223')),
			rgb(ftoi('#b5ba77')),
			rgb(ftoi('#efede8'))
		];
		const p = [0, 0.15, 0.2, 0.205, 0.25, 0.7, 0.8].map(n => n * 255);
		const result = new Array(128 * 256 * 4);

		for (let line = 0; line < nLayers; ++line) {
			for (let x = 0; x < 256; ++x) {
				const hlx = heights[line][x];
				const height = hlx * ((0.5 * line) / nLayers);
				const ratio = height / hlx;
				const skip2 = selector.includes('skip-2');

				// Pixel height data to vertical line
				for (let y = 0; y <= height; ++y) {
					// Set initial height higher for each layer
					const h = y + (nLayers - line) * (everyN / 2);

					let c = 255 - (nLayers - line) * everyN * 0.75;
					c = 1 - c / 255;
					c /= 1.5;
					let col;
					const yr = y / ratio;

					// Water
					if (!skip2 && y === 0) {
						col = g[0];

						for (let fill = 0; fill < everyN / 2; ++fill) {
							const i = ((255 - (h + fill)) * 256 + x) * 4;
							result[i] = Paint.lerp(col.r, f.r, c);
							result[i + 1] = Paint.lerp(col.g, f.g, c);
							result[i + 2] = Paint.lerp(col.b, f.b, c);
							result[i + 3] = 255;
						}

						continue;
					} else if (doBorder && yr > p[2] && y >= height - 2) {
						col = border;
					} else {
						col = Paint.pickColor(yr, g, p);
					}

					if (skip2) {
						if (y > height - 2) {
							col = border;
						} else {
							col = g[g.length - 1];
						}
					}

					const i = ((255 - h) * 256 + x) * 4;
					result[i] = Paint.lerp(col.r, f.r, c);
					result[i + 1] = Paint.lerp(col.g, f.g, c);
					result[i + 2] = Paint.lerp(col.b, f.b, c);
					result[i + 3] = 255;
				}
			}
		}

		imageData.data.set(result);
		ctx.putImageData(imageData, 0, -128 + everyN / 2);
	}

	static pickColor(v, g, p) {
		if (v <= p[0]) {
			return g[0];
		}

		for (let i = 1; i < g.length; ++i) {
			if (v <= p[i]) {
				const s = (v - p[i - 1]) / (p[i] - p[i - 1]);
				return Paint.lerpColor(g[i - 1], g[i], s);
			}
		}

		return g[g.length - 1];
	}

	static lerpColor(colA, colB, value) {
		const r = Paint.lerp(colA.r, colB.r, value);
		const g = Paint.lerp(colA.g, colB.g, value);
		const b = Paint.lerp(colA.b, colB.b, value);
		return { r: r, g: g, b: b };
	}

	static lerp(start, end, value) {
		return (1 - value) * start + value * end;
	}
};
