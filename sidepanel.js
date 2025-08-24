// Global variables
let fishPool = [];
let animationCanvas, animationCtx;
let drawingCanvas, drawingCtx;
let isDrawing = false;
let currentColor = '#000000';
let currentBrushSize = 5;
let currentOpacity = 100;

// Pomodoro Timer functionality
let pomodoroTimer = null;
let timeRemaining = 25 * 60; // 25 minutes in seconds
let isTimerRunning = false;

// Initialize Pomodoro Timer
function initializePomodoro() {
    const startButton = document.getElementById('startButton');
    const timerDisplay = document.getElementById('timerDisplay');
    
    // Update initial display
    updateTimerDisplay();
    
    // Start button click event
    startButton.addEventListener('click', function() {
        startPomodoro();
    });
}

// Start Pomodoro Timer
function startPomodoro() {
    if (isTimerRunning) return;
    
    isTimerRunning = true;
    
    // Hide start button
    const startButton = document.getElementById('startButton');
    startButton.style.display = 'none';
    
    // Start countdown
    pomodoroTimer = setInterval(function() {
        timeRemaining--;
        updateTimerDisplay();
        
        // Timer finished
        if (timeRemaining <= 0) {
            clearInterval(pomodoroTimer);
            isTimerRunning = false;
            timeRemaining = 25 * 60; // Reset to 25 minutes
            
            // Show start button again
            startButton.style.display = 'block';
            updateTimerDisplay();
            
            // Optional: Show completion notification
            console.log('Pomodoro session completed!');
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    timerDisplay.textContent = formattedTime;
}

// Modal functionality
function initializeModal() {
    const modal = document.getElementById('drawModal');
    const openBtn = document.getElementById('openDrawModal');
    const closeBtn = document.getElementById('closeModal');
    
    // Open modal
    openBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        initializeDrawingCanvas();
    });
    
    // Close modal
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Initialize drawing canvas in modal
function initializeDrawingCanvas() {
    drawingCanvas = document.getElementById('drawingCanvas');
    drawingCtx = drawingCanvas.getContext('2d');
    
    // Clear canvas
    drawingCtx.fillStyle = 'white';
    drawingCtx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    
    // Drawing event listeners
    drawingCanvas.addEventListener('mousedown', startDrawing);
    drawingCanvas.addEventListener('mousemove', draw);
    drawingCanvas.addEventListener('mouseup', stopDrawing);
    drawingCanvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    drawingCanvas.addEventListener('touchstart', handleTouch);
    drawingCanvas.addEventListener('touchmove', handleTouch);
    drawingCanvas.addEventListener('touchend', stopDrawing);
}

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width / rect.width;
    const scaleY = drawingCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    drawingCtx.globalAlpha = currentOpacity / 100;
    drawingCtx.globalCompositeOperation = 'source-over';
    drawingCtx.strokeStyle = currentColor;
    drawingCtx.lineWidth = currentBrushSize;
    drawingCtx.lineCap = 'round';
    drawingCtx.lineJoin = 'round';
    
    drawingCtx.lineTo(x, y);
    drawingCtx.stroke();
    drawingCtx.beginPath();
    drawingCtx.moveTo(x, y);
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        drawingCtx.beginPath();
    }
}

function handleTouch(e) {
    e.preventDefault();
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                     e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    drawingCanvas.dispatchEvent(mouseEvent);
}

// Initialize drawing tools
function initializeDrawingTools() {
    // Color palette
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            currentColor = this.dataset.color;
        });
    });
    
    // Brush size
    const brushSize = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    brushSize.addEventListener('input', function() {
        currentBrushSize = this.value;
        brushSizeValue.textContent = this.value + 'px';
    });
    
    // Opacity
    const opacity = document.getElementById('opacity');
    const opacityValue = document.getElementById('opacityValue');
    opacity.addEventListener('input', function() {
        currentOpacity = this.value;
        opacityValue.textContent = this.value + '%';
    });
    
    // Clear canvas
    document.getElementById('clearCanvas').addEventListener('click', function() {
        if (drawingCtx) {
            drawingCtx.fillStyle = 'white';
            drawingCtx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        }
    });
    
    // Create fish
    document.getElementById('createFish').addEventListener('click', function() {
        createFishFromDrawing();
    });
}

// Fish creation and animation
function createFishFromDrawing() {
    if (!drawingCanvas) return;
    
    // Create fish object from drawing
    const fishData = drawingCanvas.toDataURL();
    
    // Preload the image
    const img = new Image();
    img.onload = function() {
        const fish = {
            id: Date.now(),
            imageElement: img, // Store the loaded image element
            imageData: fishData, // Keep original data as backup
            x: Math.random() * (animationCanvas.width - 50),
            y: Math.random() * (animationCanvas.height - 50),
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: 50
        };
        
        fishPool.push(fish);
        console.log('Fish added to pool:', fish.id);
    };
    img.src = fishData;
    
    // Close modal
    document.getElementById('drawModal').style.display = 'none';
    
    // Clear drawing canvas
    if (drawingCtx) {
        drawingCtx.fillStyle = 'white';
        drawingCtx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
}

// Initialize fish pond animation
function initializeFishPond() {
    animationCanvas = document.getElementById('animationCanvas');
    animationCtx = animationCanvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        const container = animationCanvas.parentElement;
        animationCanvas.width = container.clientWidth;
        animationCanvas.height = container.clientHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Start animation loop
    animateFish();
}

// Fish animation loop
function animateFish() {
    // Clear canvas
    animationCtx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
    
    // Update and draw each fish
    fishPool.forEach(fish => {
        // Update position
        fish.x += fish.vx;
        fish.y += fish.vy;
        
        // Bounce off walls
        if (fish.x <= 0 || fish.x >= animationCanvas.width - fish.size) {
            fish.vx *= -1;
        }
        if (fish.y <= 0 || fish.y >= animationCanvas.height - fish.size) {
            fish.vy *= -1;
        }
        
        // Keep fish in bounds
        fish.x = Math.max(0, Math.min(fish.x, animationCanvas.width - fish.size));
        fish.y = Math.max(0, Math.min(fish.y, animationCanvas.height - fish.size));
        
        // Draw fish using preloaded image
        if (fish.imageElement && fish.imageElement.complete) {
            animationCtx.drawImage(fish.imageElement, fish.x, fish.y, fish.size, fish.size);
        }
    });
    
    requestAnimationFrame(animateFish);
}

// Initialize share functionality
function initializeShare() {
    const shareButton = document.getElementById('shareButton');
    
    shareButton.addEventListener('click', function() {
        // 模拟复制功能
        showShareMessage();
    });
}

// Show share message
function showShareMessage() {
    // 创建提示消息
    const message = document.createElement('div');
    message.textContent = '已复制，邀请朋友一起摸鱼吧';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        z-index: 10000;
        animation: slideInOut 3s ease-in-out;
    `;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            15% { opacity: 1; transform: translateX(-50%) translateY(0); }
            85% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(message);
    
    // 3秒后移除消息
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePomodoro();
    initializeModal();
    initializeDrawingTools();
    initializeFishPond();
    initializeShare();
    
    console.log('Fish Timer Side Panel initialized');
});