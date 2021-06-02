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
	let alt = 'おそらく島の写真';
	p.makeUmiImgs('#guide-top', options, config, alt);

	config = CONFIG.guide_direction_radial;
	alt = 'おそらく島の写真';
	p.makeUmiImgs('#dir-radial', options, config, alt);

	config = CONFIG.guide_direction_horizontal;
	alt = 'おそらく島の写真';
	p.makeUmiImgs('#dir-horizontal', options, config, alt);

	config = CONFIG.guide_direction_vertical;
	alt = 'おそらく島の写真';
	p.makeUmiImgs('#dir-vertical', options, config, alt);

	config = CONFIG.guide_noise_octaves;
	alt = 'おそらく島の写真';
	p.makeUmiImgs('#noi-octaves', options, config, alt);

	config = CONFIG.guide_noise_persistence;
	alt = 'おそらく島の写真';
	p.makeUmiImgs('#noi-persistence', options, config, alt);

	config = CONFIG.guide_noise_frequency;
	alt = 'おそらく島の写真';
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
