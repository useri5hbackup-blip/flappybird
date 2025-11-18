const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let frames = 0;
const DEGREE = Math.PI / 180;

// Load images (draw basic rectangles for minimalism)
const sprite = {
  bird: { w: 34, h: 24, color: '#ffeb3b' },
  pipe: { w: 52, h: 320, color: '#388e3c' },
  fg: { h: 112, color: "#ded895" }
};

const state = { current: 0, getReady: 0, game: 1, over: 2 };

// Bird
const bird = {
  x: 50,
  y: 150,
  w: sprite.bird.w,
  h: sprite.bird.h,
  radius: 12,
  speed: 0,
  gravity: 0.25,
  jump: 4.6,

  draw() {
    ctx.fillStyle = sprite.bird.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  },
  flap() {
    this.speed = -this.jump;
  },
  update() {
    this.speed += this.gravity;
    this.y += this.speed;

    if (this.y + this.h/2 >= canvas.height - sprite.fg.h) {
      this.y = canvas.height - sprite.fg.h - this.h/2;
      if (state.current === state.game) {
        state.current = state.over;
      }
    }
    if (this.y - this.h/2 <= 0) {
      this.y = this.h/2;
    }
  },
  reset() {
    this.speed = 0;
    this.y = 150;
  }
};

// Pipes
const pipes = {
  position: [],
  gap: 100,
  maxYPos: -150,
  dx: 2,

  draw() {
    for (let i = 0; i < this.position.length; i++) {
      const p = this.position[i];

      // Top pipe
      ctx.fillStyle = sprite.pipe.color;
      ctx.fillRect(p.x, p.y, sprite.pipe.w, sprite.pipe.h);

      // Bottom pipe
      ctx.fillRect(p.x, p.y + sprite.pipe.h + this.gap, sprite.pipe.w, sprite.pipe.h);
    }
  },
  update() {
    if (state.current !== state.game) return;

    if (frames % 100 === 0) {
      this.position.push({
        x: canvas.width,
        y: this.maxYPos * (Math.random() + 1)
      });
    }
    for (let i = 0; i < this.position.length; i++) {
      const p = this.position[i];
      p.x -= this.dx;

      // Collision
      if (
        bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + sprite.pipe.w &&
        (bird.y - bird.radius < p.y + sprite.pipe.h || bird.y + bird.radius > p.y + sprite.pipe.h + this.gap)
      ) {
        state.current = state.over;
      }

      // Score & remove passed pipes
      if (p.x + sprite.pipe.w < 0) {
        this.position.shift();
        score.value++;
        score.best = Math.max(score.value, score.best);
        localStorage.setItem('best', score.best);
      }
    }
  },
  reset() {
    this.position = [];
  }
};

// Foreground
function drawForeground() {
  ctx.fillStyle = sprite.fg.color;
  ctx.fillRect(0, canvas.height - sprite.fg.h, canvas.width, sprite.fg.h);
}

// Score
const score = {
  value: 0,
  best: parseInt(localStorage.getItem('best')) || 0,
  draw() {
    ctx.fillStyle = "#222";
    ctx.lineWidth = 2;
    ctx.font = "35px Arial";
    if (state.current === state.game)
      ctx.fillText(this.value, canvas.width / 2 - 10, 50);
    else if (state.current === state.over) {
      ctx.fillText("Score: " + this.value, 60, 200);
      ctx.fillText("Best: " + this.best, 60, 240);
    }
  },
  reset() {
    this.value = 0;
  }
};

canvas.addEventListener('click', function(evt) {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      break;
    case state.game:
      bird.flap();
      break;
    case state.over:
      pipes.reset();
      bird.reset();
      score.reset();
      state.current = state.getReady;
      break;
  }
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bird.draw();
  pipes.draw();
  drawForeground();
  score.draw();

  if (state.current === state.getReady) {
    ctx.fillStyle = "#222";
    ctx.font = "30px Arial";
    ctx.fillText("Click to Start", 80, 250);
  }
  if (state.current === state.over) {
    ctx.fillStyle = "#b91f1f";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", 120, 150);
    ctx.fillText("Click to Restart", 70, 300);
  }
}

function update() {
  bird.update();
  pipes.update();
}

function loop() {
  update();
  draw();
  frames++;
  requestAnimationFrame(loop);
}

loop();
