let speedController = null;
let toggleButton = null;
let currentVideo = null;

// --- ADDED: Constant sync logic ---
function startSpeedSync() {
  setInterval(() => {
    const slider = document.getElementById('speed-slider');
    const videos = document.querySelectorAll('video');
    
    if (slider && videos.length > 0) {
      const targetSpeed = parseFloat(slider.value);
      
      videos.forEach(video => {
        // If the video speed doesn't match the slider (common during ads/new videos)
        if (video.playbackRate !== targetSpeed) {
          video.playbackRate = targetSpeed;
        }
      });
    }
  }, 500); // Checks every 0.5 seconds
}

function createToggleButton() {
  if (toggleButton) return;

  const btn = document.createElement('button');
  btn.id = 'video-speed-toggle-btn';
  btn.innerHTML = '⚡';
  btn.title = 'Click to open video speed controller';

  document.body.appendChild(btn);
  toggleButton = btn;

  let isClicking = false;
  let clickStartX = 0;
  let clickStartY = 0;

  btn.addEventListener('mousedown', (e) => {
    isClicking = true;
    clickStartX = e.clientX;
    clickStartY = e.clientY;
  });

  document.addEventListener('mouseup', () => {
    isClicking = false;
  });

  btn.addEventListener('mousemove', (e) => {
    if (!isClicking) return;
    const dx = Math.abs(e.clientX - clickStartX);
    const dy = Math.abs(e.clientY - clickStartY);
    if (dx > 5 || dy > 5) {
      makeDraggableButton(btn);
    }
  });

  btn.addEventListener('click', (e) => {
    const dx = Math.abs(e.clientX - clickStartX);
    const dy = Math.abs(e.clientY - clickStartY);
    if (dx < 5 && dy < 5) {
      if (speedController) {
        speedController.style.display = speedController.style.display === 'none' ? 'block' : 'none';
      }
    }
  });
}

function createSpeedController() {
  if (speedController) return;

  const container = document.createElement('div');
  container.id = 'video-speed-controller';
  container.innerHTML = `
    <div class="speed-controller-content">
      <div class="speed-header">
        <span class="speed-icon">⚡</span>
        <span class="speed-label">Speed</span>
        <button class="speed-close" id="speed-close-btn">×</button>
      </div>
      <div class="speed-controls">
        <input
          type="range"
          id="speed-slider"
          min="0.5"
          max="16"
          step="0.25"
          value="1"
        />
        <div class="speed-display">
          <span id="speed-value">1.0</span>x
        </div>
        <div class="speed-presets">
          <button class="preset-btn" data-speed="0.5">0.5x</button>
          <button class="preset-btn" data-speed="1">1x</button>
          <button class="preset-btn" data-speed="1.5">1.5x</button>
          <button class="preset-btn" data-speed="2">2x</button>
          <button class="preset-btn" data-speed="3">3x</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);
  speedController = container;

  const slider = document.getElementById('speed-slider');
  const speedValue = document.getElementById('speed-value');
  const closeBtn = document.getElementById('speed-close-btn');
  const presetBtns = document.querySelectorAll('.preset-btn');

  slider.addEventListener('input', (e) => {
    const speed = parseFloat(e.target.value);
    speedValue.textContent = speed.toFixed(2);
    applySpeedToVideos(speed);
  });

  closeBtn.addEventListener('click', () => {
    speedController.style.display = 'none';
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const speed = parseFloat(btn.dataset.speed);
      slider.value = speed;
      speedValue.textContent = speed.toFixed(2);
      applySpeedToVideos(speed);
    });
  });

  makeDraggable(container);
  
  // Start the background sync as soon as the controller exists
  startSpeedSync();
}

function applySpeedToVideos(speed) {
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    video.playbackRate = speed;
  });
}

function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const header = element.querySelector('.speed-header');
  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
    element.style.right = 'auto';
    element.style.bottom = 'auto';
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function makeDraggableButton(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
    element.style.right = 'auto';
    element.style.bottom = 'auto';
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function checkForVideos() {
  const videos = document.querySelectorAll('video');
  if (videos.length > 0) {
    if (!speedController) {
      createSpeedController();
    }
    if (!toggleButton) {
      createToggleButton();
    }
  }
}

const observer = new MutationObserver(() => {
  checkForVideos();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

checkForVideos();