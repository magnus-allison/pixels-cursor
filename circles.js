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

const generateRandomNumber = (min, max) => {
	return Math.random() * (max - min) + min;
};

window.addEventListener('resize', resizeCanvas);

resizeCanvas();

const circles = [];

class Circle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.radius = Math.random() * 30 + 10;
		this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
		this.opacity = 1;
		this.fadeSpeed = 0.02;
		this.growthSpeed = generateRandomNumber(0.5, 1.5);
	}

	draw() {
		ctx.save();
		ctx.globalAlpha = this.opacity;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.restore();
	}

	update() {
		if (this.opacity > 0) {
			this.radius += this.growthSpeed;
		}
		this.opacity -= this.fadeSpeed;
		if (this.opacity < 0) {
			this.opacity = 0;
		}
	}
}

canvas.addEventListener('click', (event) => {
	const rect = canvas.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;

	// Create new circle at click position
	circles.push(new Circle(x, y));
});

function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (let i = circles.length - 1; i >= 0; i--) {
		const circle = circles[i];
		circle.update();
		circle.draw();

		if (circle.opacity <= 0) {
			circles.splice(i, 1);
		}
	}

	requestAnimationFrame(animate);
}

animate();
