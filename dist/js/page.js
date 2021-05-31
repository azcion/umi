'use strict';

window.onload = paintCanvases;

const Paint = class {
	constructor(fractionalSize) {
		this.frac = fractionalSize;
	}

	makeUmiImgs(selector, options, config, alt) {
		[...document.querySelectorAll(selector)].forEach(e => {
			const gl = e.getContext('webgl');
			gl.canvas.width = (gl.canvas.width / 200) * this.frac;
			gl.canvas.height = (gl.canvas.height / 200) * this.frac;

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

async function paintCanvases() {
	await Umi.loadShaders('glsl/');

	const grid = document.querySelector('.grid');
	const style = getComputedStyle(grid);
	const nColumns = style['grid-template-columns'].split(' ').length;
	const width = parseInt(style.width.slice(0, -2));
	const gridHeight = parseInt(style.height.slice(0, -2));
	const frac = width / nColumns;
	const p = new Paint(frac);

	let options = {};
	let config = {};
	let alt = 'おそらく島の写真';
	p.makeUmiImgs('.islands .umi-one', options, config, alt);
	p.makeUmiImgs('.islands .umi-two', options, config, alt);
	p.makeUmiImgs('.islands .umi-wide', options, config, alt);
	p.makeUmiImgs('.islands .umi-tall', options, config, alt);

	options = {
		overrideSize: true
	};
	config = {
		attributes: {
			height: gridHeight / 2,
			mass: 500,
			octaves: 5,
			frequency: 0.0025
		},
		gradients: {
			colors: hexArrayToColors([
				'#F1C673',
				'#EAAC4A',
				'#2B601D',
				'#F8DDA0',
				'#A6D5D3'
			]),
			positions: [0, 0.6, 0.8, 0.85, 0.88]
		}
	};
	alt = 'おそらく砂漠のオアシスの写真';
	p.makeUmiImgs('.desert .umi-one', options, config, alt);

	config = {
		attributes: {
			height: gridHeight,
			square: false,
			water: 0.4
		},
		gradients: {
			colors: hexArrayToColors([
				'#3B5D0D',
				'#13280A',
				'#8B754B',
				'#C8CBCC',
				'#FFFFFF'
			]),
			positions: [0, 0.6, 0.8, 0.85, 0.99]
		}
	};
	alt = 'おそらく山岳林の写真';
	p.makeUmiImgs('.forest .umi-one', options, config, alt);

	config = {
		attributes: {
			mass: 300,
			frequency: 0.0025
		},
		gradients: {
			colors: hexArrayToColors([
				'#1B3983',
				'#264EB8',
				'#72C8FB',
				'#CCFDFF',
				'#EBFAFE',
				'#DDFFFF'
			]),
			positions: [0, 0.01, 0.1, 0.2, 0.5, 0.99]
		}
	};
	alt = 'おそらく氷山の写真';
	p.makeUmiImgs('.arctic .umi-one', options, config, alt);
}

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
