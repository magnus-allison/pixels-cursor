const imageToArray = async (imagePath) => {
	const response = await fetch(imagePath);
	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.statusText}`);
	}

	const blob = await response.blob();
	const imageBitmap = await createImageBitmap(blob);

	const canvas = document.createElement('canvas');
	canvas.width = imageBitmap.width;
	canvas.height = imageBitmap.height;

	const ctx = canvas.getContext('2d');
	ctx.drawImage(imageBitmap, 0, 0);

	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;
	const width = canvas.width;
	const height = canvas.height;

	const simplifiedArray = [];
	for (let y = 0; y < height; y++) {
		const row = [];
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			const a = data[i + 3];

			if (a < 50) {
				row.push(0);
				continue;
			}

			// brightness using luminance formula
			const brightness = r * 0.299 + g * 0.587 + b * 0.114;

			if (brightness < 100) {
				row.push(1);
				continue;
			}
			if (brightness > 200) {
				row.push(2);
				continue;
			}

			if (a < 150) {
				row.push(0);
			} else {
				row.push(brightness < 150 ? 1 : 2);
			}
		}
		simplifiedArray.push(row);
	}

	console.table(simplifiedArray);

	// destroy columns with all 0s
	for (let x = 0; x < simplifiedArray[0].length; x++) {
		let allZero = true;
		for (let y = 0; y < simplifiedArray.length; y++) {
			if (simplifiedArray[y][x] !== 0) {
				allZero = false;
				break;
			}
		}
		if (allZero) {
			for (let y = 0; y < simplifiedArray.length; y++) {
				simplifiedArray[y].splice(x, 1);
			}
			x--; // adjust index after removal
		}
	}

	console.table(simplifiedArray);
	return simplifiedArray;
};

const imageToArrayComplex = async (imagePath) => {
	const response = await fetch(imagePath);
	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.statusText}`);
	}

	const blob = await response.blob();
	const imageBitmap = await createImageBitmap(blob);

	const canvas = document.createElement('canvas');
	canvas.width = imageBitmap.width;
	canvas.height = imageBitmap.height;

	const ctx = canvas.getContext('2d');
	ctx.drawImage(imageBitmap, 0, 0);

	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;
	const width = canvas.width;
	const height = canvas.height;

	const complexArray = [];
	for (let y = 0; y < height; y++) {
		const row = [];
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			const a = data[i + 3];

			if (a < 50) {
				row.push(0);
				continue;
			}

			const hex =
				'#' +
				r.toString(16).padStart(2, '0') +
				g.toString(16).padStart(2, '0') +
				b.toString(16).padStart(2, '0');
			row.push(hex);
		}
		complexArray.push(row);
	}

	return complexArray;
};
