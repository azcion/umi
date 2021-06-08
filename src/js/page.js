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
		case 'travel':
			paintTravelCanvases();
			break;
	}
}

async function paintIndexCanvases() {
	await Umi.loadShaders('glsl/');

	const grid = document.querySelector('.grid');
	const style = getComputedStyle(grid);
	const nColumns = style['grid-template-columns'].split(' ').length;
	const width = parseInt(style.width.slice(0, -2));
	const frac = width / nColumns;
	const p = new Paint(frac, 100);

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
	await new Promise(r => setTimeout(r, 250));

	config = CONFIG.guide_direction_radial;
	alt = '手描き地図風の島';
	p.makeUmiImgs('#dir-radial', options, config, alt);

	config = CONFIG.guide_direction_horizontal;
	alt = '手描き地図風の水平地形';
	p.makeUmiImgs('#dir-horizontal', options, config, alt);

	config = CONFIG.guide_direction_vertical;
	alt = 'おそらく島の写真';
	p.makeUmiImgs('#dir-vertical', options, config, alt);
	await new Promise(r => setTimeout(r, 150));

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

async function paintTravelCanvases() {
	await Umi.loadShaders('glsl/');

	const p = new Paint(256, 100);

	let options = {};
	let config = CONFIG.postcard;
	let alt = '島々の絵葉書';
	p.makeUmiCanvas('.umi', options, config, alt);
}
