import * as s from 'saveSvgAsPng';

export function saveAsImage(name, id) {
	console.log(name, id);
	var svg = $('#' + id).find('svg')[0];

	s.saveSvgAsPng(svg, name + '.png', {
		canvg: canvg,
		backgroundColor: 'white'
	});
}
