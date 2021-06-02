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
