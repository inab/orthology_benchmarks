import * as svgtopng from 'save-svg-as-png';

//Download image in svg tags
export function downloadSvgAsPng(name, id) {
	console.log(name, id);
	svgtopng.saveSvgAsPng(document.getElementById(id), name + '.png', {
		backgroundColor: 'white',
	});
}
