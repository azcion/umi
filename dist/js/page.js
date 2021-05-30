'use strict';

window.onload = paintCanvases;

async function paintCanvases() {
	await Umi.loadShaders('glsl/');
	const umis = [];

	let options = null;

	umis.push(...makeUmis('one', options));
	umis.push(...makeUmis('wide', options));
	umis.push(...makeUmis('tall', options));
	umis.push(...makeUmis('two', options));

	for (const umi of umis) {
		umi.draw();
	}
}

function makeUmis(suffix, options) {
	const name = `umi-${suffix}`;
	const umis = [];

	[...document.getElementsByClassName(name)].forEach(e => {
		const umi = new Umi(e.getContext('webgl'));
		umi.configureShader(options);
		umis.push(umi);
	});

	return umis;
}
