window.onload = UmiUsageExample;

async function UmiUsageExample() {
	await Umi.loadShaders('glsl/');

	const options = {
		// Log final attributes to console in query form
		logQuery: true,
		// Ignore canvas width and height attributes
		overrideSize: true
	};

	const u0 = new Umi('canvas', options);
	u0.configureShader();
	u0.draw();
}

async function UmiUsageExample2() {
	// Expects .glsl extension
	await Umi.loadShaders('glsl/');

	const config = {
		attributes: {
			// Overrides for Umi._attributes
			// Invalid values will be ignored
			height: 400,
			radial: false
		},
		gradients: null // This defaults to Umi._gradient
	};

	const u0 = new Umi('canvas1');
	u0.configureShader(config); // This disables URL params
	u0.draw();

	const u1 = new Umi('canvas2', { overrideSize: true });
	u1.configureShader(); // This defaults to Umi._attributes
	u1.draw();
}
