PIXEL_PATTERN = 'bottom';
PIXEL_SIZE = 1;
PIXEL_COLOR = 'white';
CURSOR_TYPE = 'default';
PIXEL_COLOR = 'default';

let customImageUrl = '';

const canvas = document.getElementById('canvas');
if (!canvas) {
	console.error('Canvas element not found');
	debugger;
}
const ctx = canvas.getContext('2d');

const resizeCanvas = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

window.addEventListener('resize', resizeCanvas);

let mouseX = 0;
let mouseY = 0;
let cursorOnCanvas = true;

const getRandomColor = () => {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
};

class Pixel {
	constructor(x, y, offsetX, offsetY, number) {
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this.x = x;
		this.y = y;
		this.size = PIXEL_SIZE;
		this.color =
			PIXEL_COLOR === 'default'
				? number === 2
					? 'white'
					: 'black'
				: PIXEL_COLOR === 'random'
				? getRandomColor()
				: PIXEL_COLOR;
		this.active = true;
		this.falling = false;
		this.velocityY = 0;
		this.velocityX = 0;
		this.gravity = 0.3;
		this.upwind = -0.24;
	}

	update() {
		if (!this.active) return;

		if (this.falling) {
			this.velocityY += this.gravity;
			this.velocityY += this.upwind;

			this.velocityX += (Math.random() - 0.5) * 0.3;
			this.velocityX *= 0.98;
			this.velocityY *= 0.995;

			this.y += this.velocityY;
			this.x += this.velocityX;

			if (this.y > window.innerHeight + 50) {
				this.active = false;
			}
		} else {
			this.x = mouseX + this.offsetX;
			this.y = mouseY + this.offsetY;
		}
	}

	startFalling() {
		this.falling = true;
		this.velocityX = (Math.random() - 0.5) * 4;
		this.velocityY = Math.random() * 2 - 1;
	}

	draw(ctx) {
		if (!this.active) return;

		// Only draw non-falling pixels if cursor is on canvas
		if (!this.falling && !cursorOnCanvas) return;

		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.size, this.size);
	}
}

const pixels = [];

const createCursorPixels = async () => {
	const pixelSpacing = PIXEL_SIZE;

	let image;
	let cursorPattern;

	const cursorMap = {
		default: 'https://tobiasahlin.com/static/cursors/default.png',
		pointer: 'https://tobiasahlin.com/static/cursors/pointer.png',
		screenshot: 'https://tobiasahlin.com/static/cursors/screenshot.png'
	};

	if (CURSOR_TYPE in cursorMap) {
		image = cursorMap[CURSOR_TYPE];
		cursorPattern = await imageToArray(image);
	}

	if (CURSOR_TYPE === 'custom' && customImageUrl) {
		image = customImageUrl;
		cursorPattern = await imageToArrayComplex(image);
	}

	for (let row = 0; row < cursorPattern.length; row++) {
		const currentRow = cursorPattern[row];
		for (let col = 0; col < currentRow.length; col++) {
			const colorValue = currentRow[col];
			if (CURSOR_TYPE === 'custom') {
				if (colorValue !== 0) {
					const offsetX = col * pixelSpacing;
					const offsetY = row * pixelSpacing;
					const pixelColor =
						PIXEL_COLOR === 'default'
							? colorValue
							: PIXEL_COLOR === 'random'
							? getRandomColor()
							: PIXEL_COLOR;
					const pixel = new Pixel(mouseX + offsetX, mouseY + offsetY, offsetX, offsetY, 2);
					pixel.color = pixelColor;
					pixels.push(pixel);
				}
			} else {
				if (colorValue === 1 || colorValue === 2) {
					const offsetX = col * pixelSpacing;
					const offsetY = row * pixelSpacing;
					pixels.push(new Pixel(mouseX + offsetX, mouseY + offsetY, offsetX, offsetY, colorValue));
				}
			}
		}
	}
};

const animate = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = pixels.length - 1; i >= 0; i--) {
		const pixel = pixels[i];
		pixel.update();
		pixel.draw(ctx);

		if (!pixel.active) {
			pixels.splice(i, 1);
		}
	}

	requestAnimationFrame(animate);
};

canvas.addEventListener('mousemove', (event) => {
	const rect = canvas.getBoundingClientRect();
	mouseX = event.clientX - rect.left;
	mouseY = event.clientY - rect.top;
});

canvas.addEventListener('mouseenter', () => {
	cursorOnCanvas = true;
});

canvas.addEventListener('mouseleave', () => {
	cursorOnCanvas = false;
});

canvas.addEventListener('click', async (event) => {
	const numPixelsToDrop = Math.floor(Math.random() * 10) + 3;
	let droppedCount = 0;

	// Get all non-falling pixels
	let availablePixels = pixels.filter((pixel) => pixel.active && !pixel.falling);

	console.log(PIXEL_PATTERN);

	if (PIXEL_PATTERN === 'bottom') {
		for (let i = availablePixels.length - 1; i >= 0 && droppedCount < numPixelsToDrop; i--) {
			availablePixels[i].startFalling();
			droppedCount++;
		}
	}

	if (PIXEL_PATTERN === 'top') {
		for (let i = 0; i < availablePixels.length && droppedCount < numPixelsToDrop; i++) {
			availablePixels[i].startFalling();
			droppedCount++;
		}
	}

	if (PIXEL_PATTERN === 'random') {
		for (let i = availablePixels.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[availablePixels[i], availablePixels[j]] = [availablePixels[j], availablePixels[i]];
		}

		for (let i = 0; i < Math.min(numPixelsToDrop, availablePixels.length); i++) {
			availablePixels[i].startFalling();
			droppedCount++;
		}
	}

	if (droppedCount <= 0) {
		await createCursorPixels();
	}
});

const setCustomCursor = () => {
	const url = prompt('Enter image URL:');
	if (url && url.trim()) {
		customImageUrl = url.trim();
		window.CURSOR_TYPE = 'custom';
		reset();
	}
};

const reset = async () => {
	pixels.length = 0;
	resizeCanvas();
	await createCursorPixels();
	updateSelectedButtons();
	animate();
};

// hack for buttons
const updateSelectedButtons = () => {
	document.querySelectorAll('.button.selected').forEach((btn) => {
		btn.classList.remove('selected');
	});

	document.querySelectorAll('.button').forEach((btn) => {
		const onclick = btn.getAttribute('onclick');
		if (onclick) {
			if (onclick.includes(`PIXEL_SIZE = ${PIXEL_SIZE}`)) {
				btn.classList.add('selected');
			}
			if (onclick.includes(`PIXEL_COLOR = '${PIXEL_COLOR}'`)) {
				btn.classList.add('selected');
			}
			if (onclick.includes(`PIXEL_PATTERN = '${PIXEL_PATTERN}'`)) {
				btn.classList.add('selected');
			}
			if (onclick.includes(`CURSOR_TYPE = '${CURSOR_TYPE}'`)) {
				btn.classList.add('selected');
			}
			if (onclick.includes('setCustomCursor()') && CURSOR_TYPE === 'custom') {
				btn.classList.add('selected');
			}
		}
	});
};

reset();
