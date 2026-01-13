---
title: "Building a Professional Embedded Systems Portfolio Website with Advanced Animations"
description: "Learn to build a modern portfolio website with 12 advanced animation features including PCB traces, particle systems, terminal simulation, and AWS deployment"
pubDate: 2026-01-13
difficulty: "intermediate"
tags: ["web-development", "portfolio", "animations", "javascript", "css", "aws", "nginx"]
category: "tutorials"
aiGenerated: false
sources:
  - title: "Personal Portfolio Website Repository"
    url: "https://github.com/deepak4395/Personal"
    site: "GitHub"
---

## Overview

This comprehensive tutorial will guide you through building a professional portfolio website specifically designed for embedded systems engineers, featuring 12 advanced animation systems including animated PCB traces, particle effects, matrix rain, oscilloscope waveforms, and an interactive terminal simulation. You'll also learn complete AWS EC2 deployment with Nginx and SSL configuration.

**What You'll Build:**
- Modern dark-themed portfolio with red accent (#ef4444)
- 12 unique animation features (PCB traces, particles, matrix rain, typing effects, terminal, waveforms, LEDs, circuit nodes, glitch effects, stat counters)
- Fully responsive design for all devices
- Production-ready deployment on AWS EC2
- Custom domain with SSL certificate (Let's Encrypt)

**Live Example:** profile.sarcasticrobo.com

## Prerequisites

### Required Software

- **Code Editor**: VS Code, Sublime Text, or any modern editor
- **Web Browser**: Chrome, Firefox, or Safari (latest version)
- **Local Server**: Python 3 (for testing) or Node.js
- **Git**: For version control
- **AWS Account**: For deployment (free tier eligible)
- **Domain Name**: Optional but recommended (e.g., sarcasticrobo.com)

### Required Knowledge

- **HTML5**: Semantic markup, forms, SVG basics
- **CSS3**: Flexbox, Grid, animations, transforms, keyframes
- **JavaScript ES6+**: DOM manipulation, Canvas API, event handling, classes
- **Basic Linux**: SSH, file permissions, package management
- **Nginx**: Basic web server configuration
- **Git**: Basic version control commands

### Optional Tools

- **SSH Client**: PuTTY (Windows), built-in terminal (Mac/Linux)
- **SCP/SFTP Client**: FileZilla, WinSCP for file transfers
- **Image Editor**: For optimizing profile and project images

## Step 1: Project Setup and Structure

### Create Project Directory

```bash
mkdir Personal && cd Personal
mkdir -p css js assets/images
touch index.html css/style.css
touch js/main.js js/animations.js js/circuit-nodes.js js/effects.js
```

### Project Structure

```
Personal/
├── index.html                  # Main HTML with all sections
├── css/
│   └── style.css              # Complete styling + animations
├── js/
│   ├── animations.js          # PCB traces, particles, matrix rain, typing, waveforms, LEDs
│   ├── circuit-nodes.js       # Skills connection visualization
│   ├── effects.js             # Stat counters, glitch effects, scan line
│   └── main.js                # Navigation, scroll, form handling
├── assets/
│   └── images/
│       ├── profilephoto.jpg   # Your profile image
│       └── README.md          # Image documentation
└── README.md                  # Project documentation
```

### Initialize Git Repository

```bash
git init
echo "# Professional Portfolio Website" > README.md
git add .
git commit -m "Initial project structure"
```

## Step 2: Building the HTML Foundation

### Create Basic HTML Structure

Create `index.html` with semantic sections:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deepak Singhal - Embedded Systems Engineer</title>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="container">
            <a href="#" class="logo">DS</a>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#skills">Skills</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <!-- Hero Section with Animations -->
    <section id="home" class="hero">
        <div class="hero-content">
            <h1 class="glitch-text">Deepak Singhal</h1>
            <p class="typing-text"></p>
            <div class="hero-buttons">
                <a href="#contact" class="btn btn-primary">Get In Touch</a>
                <a href="assets/Resume_Deepak_Singhal.pdf" class="btn btn-secondary" download>Download Resume</a>
            </div>
        </div>
        <canvas id="particle-canvas"></canvas>
        <canvas id="matrix-canvas"></canvas>
    </section>

    <!-- About Section -->
    <section id="about" class="section">
        <div class="container">
            <h2 class="section-title glitch-text">About Me</h2>
            <div class="about-content">
                <div class="profile-image">
                    <img src="assets/images/profilephoto.jpg" alt="Deepak Singhal">
                </div>
                <div class="about-text">
                    <p>Passionate Embedded Systems Engineer with expertise in IoT, RTOS, and firmware development...</p>
                    
                    <!-- Stats with Animated Counters -->
                    <div class="stats">
                        <div class="stat-item">
                            <span class="stat-number" data-target="7">0</span>
                            <span class="stat-label">Years Experience</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number" data-target="10">0</span>
                            <span class="stat-label">Projects Completed</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number" data-target="5">0</span>
                            <span class="stat-label">Industries Served</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Skills Section with Circuit Nodes -->
    <section id="skills" class="section">
        <div class="container">
            <h2 class="section-title glitch-text">Technical Skills</h2>
            <canvas id="circuit-canvas"></canvas>
            <div class="skills-grid">
                <div class="skill-category">
                    <h3>Embedded Systems</h3>
                    <div class="skill-tags">
                        <span class="skill-tag" data-skill="C/C++">C/C++</span>
                        <span class="skill-tag" data-skill="ARM Cortex">ARM Cortex</span>
                        <span class="skill-tag" data-skill="ESP32">ESP32</span>
                    </div>
                </div>
                <!-- More categories... -->
            </div>
        </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="section">
        <div class="container">
            <h2 class="section-title glitch-text">Featured Projects</h2>
            <div class="projects-grid">
                <div class="project-card">
                    <h3 class="glitch-text">IoT Sensor Network</h3>
                    <p>Distributed sensor network with MQTT and edge computing...</p>
                    <div class="project-tags">
                        <span>ESP32</span>
                        <span>MQTT</span>
                        <span>AWS IoT</span>
                    </div>
                    <div class="project-links">
                        <a href="#" class="btn-link">View Demo</a>
                        <a href="#" class="btn-link">GitHub</a>
                    </div>
                </div>
                <!-- More projects... -->
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="section">
        <div class="container">
            <h2 class="section-title glitch-text">Get In Touch</h2>
            <form id="contact-form" action="https://formsubmit.co/deepaksinghal1995@gmail.com" method="POST">
                <input type="hidden" name="_subject" value="New message from Portfolio Website">
                <input type="text" name="name" placeholder="Your Name" required>
                <input type="email" name="email" placeholder="Your Email" required>
                <input type="text" name="subject" placeholder="Subject" required>
                <textarea name="message" placeholder="Your Message" rows="5" required></textarea>
                <button type="submit" class="btn btn-primary">Send Message</button>
            </form>
        </div>
    </section>

    <!-- Embedded Terminal Simulation -->
    <div id="terminal" class="terminal">
        <div class="terminal-header">
            <span>system@embedded-portfolio:~$</span>
            <div class="terminal-controls">
                <button class="terminal-btn minimize">_</button>
                <button class="terminal-btn close">×</button>
            </div>
        </div>
        <div class="terminal-body">
            <div id="terminal-output"></div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">$ </span>
                <input type="text" id="terminal-input" placeholder="Type 'help' for commands">
            </div>
        </div>
    </div>

    <!-- JavaScript Files -->
    <script src="js/animations.js"></script>
    <script src="js/circuit-nodes.js"></script>
    <script src="js/effects.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### Key HTML Features Explained

1. **Semantic Structure**: Uses proper HTML5 sections (nav, section, footer)
2. **Canvas Elements**: For particle system and matrix rain animations
3. **Data Attributes**: `data-target` for animated counters, `data-skill` for circuit connections
4. **Terminal Div**: Fixed position interactive terminal simulation
5. **Form Integration**: FormSubmit.co for contact form (no backend required)

## Step 3: Implementing Core CSS Styling

### Create Design System in `css/style.css`

```css
/* ===========================
   CSS Variables & Reset
=========================== */
:root {
    --primary-red: #ef4444;
    --dark-bg: #0a0a0a;
    --dark-card: #1a1a1a;
    --text-gray: #e5e5e5;
    --text-dark: #a0a0a0;
    --border-gray: #333;
    
    /* Fonts */
    --font-heading: 'Orbitron', sans-serif;
    --font-body: 'Rajdhani', sans-serif;
    --font-mono: 'Courier New', monospace;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-body);
    background: var(--dark-bg);
    color: var(--text-gray);
    line-height: 1.6;
    overflow-x: hidden;
}

/* ===========================
   Navigation Bar
=========================== */
.navbar {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(10, 10, 10, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1000;
    border-bottom: 2px solid var(--primary-red);
}

.navbar .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.logo {
    font-family: var(--font-heading);
    font-size: 2rem;
    font-weight: 900;
    color: var(--primary-red);
    text-decoration: none;
    text-shadow: 0 0 10px var(--primary-red);
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-links a {
    color: var(--text-gray);
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 600;
    transition: color 0.3s ease;
    position: relative;
}

.nav-links a:hover {
    color: var(--primary-red);
}

.nav-links a::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--primary-red);
    transition: width 0.3s ease;
}

.nav-links a:hover::after {
    width: 100%;
}

/* ===========================
   Hero Section
=========================== */
.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.hero-content {
    text-align: center;
    z-index: 10;
    position: relative;
}

.hero h1 {
    font-family: var(--font-heading);
    font-size: 5rem;
    font-weight: 900;
    color: var(--primary-red);
    margin-bottom: 1rem;
    text-shadow: 0 0 20px var(--primary-red);
}

.typing-text {
    font-size: 1.8rem;
    color: var(--text-gray);
    min-height: 2.5rem;
    font-weight: 500;
}

.typing-text::after {
    content: '|';
    animation: blink 0.7s infinite;
    color: var(--primary-red);
}

@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

/* ===========================
   Buttons
=========================== */
.btn {
    display: inline-block;
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    text-decoration: none;
    border-radius: 5px;
    transition: all 0.3s ease;
    cursor: pointer;
    border: none;
    font-family: var(--font-body);
}

.btn-primary {
    background: var(--primary-red);
    color: white;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
}

.btn-secondary {
    background: transparent;
    color: var(--primary-red);
    border: 2px solid var(--primary-red);
}

.btn-secondary:hover {
    background: var(--primary-red);
    color: white;
}

/* ===========================
   Glitch Effect
=========================== */
.glitch-text {
    position: relative;
    display: inline-block;
}

.glitch-text:hover::before,
.glitch-text:hover::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.glitch-text:hover::before {
    animation: glitch-1 0.3s infinite;
    color: #ff0000;
    z-index: -1;
}

.glitch-text:hover::after {
    animation: glitch-2 0.3s infinite;
    color: #00ffff;
    z-index: -2;
}

@keyframes glitch-1 {
    0%, 100% { transform: translate(0); }
    33% { transform: translate(-2px, 2px); }
    66% { transform: translate(2px, -2px); }
}

@keyframes glitch-2 {
    0%, 100% { transform: translate(0); }
    33% { transform: translate(2px, -2px); }
    66% { transform: translate(-2px, 2px); }
}

/* ===========================
   Sections
=========================== */
.section {
    padding: 5rem 2rem;
    position: relative;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
}

.section-title {
    font-family: var(--font-heading);
    font-size: 3rem;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--primary-red);
    text-shadow: 0 0 15px var(--primary-red);
}

/* ===========================
   Stats Counter
=========================== */
.stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    margin-top: 2rem;
}

.stat-item {
    text-align: center;
    padding: 2rem;
    background: var(--dark-card);
    border-radius: 10px;
    border: 1px solid var(--border-gray);
}

.stat-number {
    font-family: var(--font-mono);
    font-size: 3rem;
    font-weight: 700;
    color: var(--primary-red);
    text-shadow: 0 0 15px var(--primary-red);
    display: block;
}

.stat-number::after {
    content: '+';
}

.stat-label {
    font-size: 1.1rem;
    color: var(--text-dark);
    margin-top: 0.5rem;
    display: block;
}

/* ===========================
   Responsive Design
=========================== */
@media (max-width: 768px) {
    .hero h1 {
        font-size: 3rem;
    }
    
    .typing-text {
        font-size: 1.2rem;
    }
    
    .nav-links {
        display: none; /* Implement mobile menu */
    }
    
    .stats {
        grid-template-columns: 1fr;
    }
}
```

### CSS Organization Tips

- **Variables**: Keep all colors, fonts, and spacing in CSS custom properties
- **BEM Naming**: Use Block-Element-Modifier for complex components
- **Mobile-First**: Start with mobile styles, use `min-width` media queries
- **Performance**: Use `transform` and `opacity` for animations (GPU-accelerated)

## Step 4: Building Advanced Animation Systems

### Animation 1: Particle System with Microchip Icons

Create `js/animations.js`:

```javascript
/* ===========================
   Particle System
=========================== */
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 60;
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    
    init() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 3 + 1
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
            this.ctx.fill();
        });
        
        // Draw connections
        this.particles.forEach((p1, i) => {
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(239, 68, 68, ${0.2 * (1 - distance / 150)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

/* ===========================
   Matrix Rain Effect
=========================== */
class MatrixRain {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.chars = '0123456789ABCDEF';
        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = Array(this.columns).fill(1);
    }
    
    init() {
        this.drops = Array(this.columns).fill(1).map(() => Math.random() * -100);
    }
    
    animate() {
        // Fade effect
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = `${this.fontSize}px monospace`;
        
        for (let i = 0; i < this.drops.length; i++) {
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;
            
            this.ctx.fillText(char, x, y);
            
            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            
            this.drops[i]++;
        }
        
        setTimeout(() => requestAnimationFrame(() => this.animate()), 50);
    }
}

/* ===========================
   Typing Effect
=========================== */
class TypingEffect {
    constructor(element, texts, typingSpeed = 100, deletingSpeed = 50, pauseTime = 2000) {
        this.element = element;
        this.texts = texts;
        this.typingSpeed = typingSpeed;
        this.deletingSpeed = deletingSpeed;
        this.pauseTime = pauseTime;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        
        this.type();
    }
    
    type() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }
        
        let speed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;
        
        if (!this.isDeleting && this.charIndex === currentText.length) {
            speed = this.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            speed = 500;
        }
        
        setTimeout(() => this.type(), speed);
    }
}

/* ===========================
   Initialize Animations
=========================== */
document.addEventListener('DOMContentLoaded', () => {
    // Particle system
    new ParticleSystem('particle-canvas');
    
    // Matrix rain
    new MatrixRain('matrix-canvas');
    
    // Typing effect
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        new TypingEffect(typingElement, [
            'Embedded Systems Engineer',
            'IoT Solutions Architect',
            'Firmware Developer',
            'Hardware Designer',
            'RTOS Specialist'
        ]);
    }
});
```

### Animation System Breakdown

1. **Particle System**:
   - 60 floating particles with random velocity
   - Draws connection lines between nearby particles (<150px)
   - Uses `requestAnimationFrame` for smooth 60fps animation
   - Auto-resizes canvas on window resize

2. **Matrix Rain**:
   - Falling hex characters (0-9, A-F)
   - Fade trail effect using semi-transparent overlay
   - Red glow matching theme color
   - 50ms delay between frames for authentic "rain" effect

3. **Typing Effect**:
   - Cycles through 5 professional titles
   - Types character-by-character at 100ms intervals
   - Pauses 2s when complete, then deletes at 50ms intervals
   - Smooth transitions with blinking cursor (CSS)

## Step 5: Interactive Circuit Node Connections

Create `js/circuit-nodes.js`:

```javascript
/* ===========================
   Circuit Node Connections for Skills
=========================== */
class CircuitNodes {
    constructor() {
        this.canvas = document.getElementById('circuit-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.skillTags = document.querySelectorAll('.skill-tag');
        this.activeSkill = null;
        
        // Define skill relationships
        this.relationships = {
            'C/C++': ['MQTT', 'Protobuf', 'Docker', 'FreeRTOS'],
            'ARM Cortex': ['ESP32', 'FreeRTOS', 'I2C/SPI'],
            'ESP32': ['MQTT', 'Wi-Fi', 'BLE', 'AWS IoT'],
            'Python': ['Docker', 'Linux', 'AWS IoT', 'CI/CD'],
            'MQTT': ['AWS IoT', 'Protobuf', 'Docker'],
            'FreeRTOS': ['C/C++', 'ARM Cortex', 'I2C/SPI'],
            'Docker': ['CI/CD', 'Linux', 'AWS'],
            'AWS IoT': ['MQTT', 'Python', 'AWS']
        };
        
        this.resize();
        this.attachEvents();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const section = this.canvas.closest('.section');
        this.canvas.width = section.offsetWidth;
        this.canvas.height = section.offsetHeight;
    }
    
    attachEvents() {
        this.skillTags.forEach(tag => {
            tag.addEventListener('mouseenter', (e) => this.handleHover(e.target));
            tag.addEventListener('mouseleave', () => this.clearConnections());
        });
    }
    
    handleHover(skill) {
        this.activeSkill = skill.getAttribute('data-skill');
        const relatedSkills = this.relationships[this.activeSkill] || [];
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Highlight active skill
        skill.style.background = 'var(--primary-red)';
        skill.style.color = 'white';
        
        // Find and highlight related skills
        this.skillTags.forEach(tag => {
            const skillName = tag.getAttribute('data-skill');
            if (relatedSkills.includes(skillName)) {
                tag.style.background = 'rgba(239, 68, 68, 0.3)';
                tag.style.borderColor = 'var(--primary-red)';
                
                // Draw connection line
                this.drawConnection(skill, tag);
            }
        });
    }
    
    drawConnection(from, to) {
        const fromRect = from.getBoundingClientRect();
        const toRect = to.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        const startX = fromRect.left + fromRect.width / 2 - canvasRect.left;
        const startY = fromRect.top + fromRect.height / 2 - canvasRect.top;
        const endX = toRect.left + toRect.width / 2 - canvasRect.left;
        const endY = toRect.top + toRect.height / 2 - canvasRect.top;
        
        // Draw curved line
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        
        const cp1x = startX + (endX - startX) / 3;
        const cp1y = startY;
        const cp2x = startX + 2 * (endX - startX) / 3;
        const cp2y = endY;
        
        this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw nodes
        this.ctx.beginPath();
        this.ctx.arc(startX, startY, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = 'var(--primary-red)';
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(endX, endY, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = 'var(--primary-red)';
        this.ctx.fill();
    }
    
    clearConnections() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.skillTags.forEach(tag => {
            tag.style.background = '';
            tag.style.color = '';
            tag.style.borderColor = '';
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new CircuitNodes();
});
```

### How Circuit Nodes Work

1. **Relationship Mapping**: Defines which skills are related (e.g., C++ connects to MQTT, Docker, FreeRTOS)
2. **Hover Detection**: Listens for mouseenter on any `.skill-tag` element
3. **Visual Feedback**: 
   - Active skill turns solid red
   - Related skills get red tint and border
4. **Connection Drawing**:
   - Calculates absolute positions of skill tags
   - Draws curved Bézier paths between related skills
   - Adds pulsing node indicators at connection points
5. **Auto-Cleanup**: Clears all highlights and lines on mouse leave

## Step 6: Embedded Terminal Simulation

Create the terminal command system in `js/main.js`:

```javascript
/* ===========================
   Terminal Simulation
=========================== */
class EmbeddedTerminal {
    constructor() {
        this.terminal = document.getElementById('terminal');
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');
        
        if (!this.terminal) return;
        
        this.commands = {
            help: this.showHelp.bind(this),
            status: this.showStatus.bind(this),
            skills: this.showSkills.bind(this),
            projects: this.showProjects.bind(this),
            contact: this.showContact.bind(this),
            about: this.showAbout.bind(this),
            clear: this.clearTerminal.bind(this)
        };
        
        this.init();
    }
    
    init() {
        // Boot sequence on load
        this.bootSequence();
        
        // Handle input
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim().toLowerCase();
                this.executeCommand(command);
                this.input.value = '';
            }
        });
        
        // Terminal controls
        document.querySelector('.terminal-btn.minimize').addEventListener('click', () => {
            this.terminal.classList.toggle('minimized');
        });
        
        document.querySelector('.terminal-btn.close').addEventListener('click', () => {
            this.terminal.style.display = 'none';
        });
    }
    
    bootSequence() {
        const bootMessages = [
            'Initializing system...',
            'Loading kernel modules... [OK]',
            'Starting network services... [OK]',
            'Mounting file systems... [OK]',
            'Portfolio system ready.',
            '',
            'Type "help" for available commands.'
        ];
        
        bootMessages.forEach((msg, index) => {
            setTimeout(() => this.print(msg), index * 500);
        });
    }
    
    executeCommand(command) {
        this.print(`$ ${command}`, 'command');
        
        if (this.commands[command]) {
            this.commands[command]();
        } else if (command) {
            this.print(`Command not found: ${command}. Type "help" for available commands.`, 'error');
        }
    }
    
    showHelp() {
        this.print('Available commands:', 'info');
        this.print('  help     - Show this help message');
        this.print('  status   - Show system status');
        this.print('  skills   - List technical skills');
        this.print('  projects - Show featured projects');
        this.print('  contact  - Display contact information');
        this.print('  about    - About Deepak Singhal');
        this.print('  clear    - Clear terminal screen');
    }
    
    showStatus() {
        this.print('System Status:', 'info');
        this.print('  CPU: ARM Cortex-M7 @ 480MHz');
        this.print('  Memory: 1MB SRAM');
        this.print('  Storage: 2MB Flash');
        this.print('  Status: OPERATIONAL');
        this.print('  Uptime: 7 years');
    }
    
    showSkills() {
        this.print('Core Technical Skills:', 'info');
        this.print('  • Embedded Systems: C/C++, ARM, ESP32');
        this.print('  • IoT: MQTT, AWS IoT, Edge Computing');
        this.print('  • RTOS: FreeRTOS, Zephyr');
        this.print('  • Protocols: I2C, SPI, UART, CAN');
        this.print('  • DevOps: Docker, CI/CD, Linux');
    }
    
    showProjects() {
        this.print('Featured Projects:', 'info');
        this.print('  1. IoT Sensor Network - Distributed MQTT system');
        this.print('  2. RTOS Task Scheduler - Custom real-time kernel');
        this.print('  3. Industrial Controller - Modbus/PLC integration');
    }
    
    showContact() {
        this.print('Contact Information:', 'info');
        this.print('  Email: deepaksinghal1995@gmail.com');
        this.print('  LinkedIn: linkedin.com/in/deepak-singhal');
        this.print('  GitHub: github.com/deepaksinghal');
    }
    
    showAbout() {
        this.print('About Deepak Singhal:', 'info');
        this.print('  Embedded Systems Engineer with 7+ years experience');
        this.print('  Specializing in IoT, RTOS, and firmware development');
        this.print('  Passionate about building scalable embedded solutions');
    }
    
    clearTerminal() {
        this.output.innerHTML = '';
    }
    
    print(message, type = 'normal') {
        const line = document.createElement('div');
        line.className = `terminal-line terminal-${type}`;
        line.textContent = message;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new EmbeddedTerminal();
});
```

### Terminal Features

1. **Boot Sequence**: Auto-runs on page load with realistic firmware messages
2. **Interactive Commands**: 7 working commands (help, status, skills, projects, contact, about, clear)
3. **Retro UI**: Fixed bottom-right position, draggable (optional), minimize/close buttons
4. **Auto-Scroll**: Terminal output scrolls to bottom on new messages
5. **Error Handling**: Shows "command not found" for invalid input

## Step 7: AWS EC2 Deployment

### Launch EC2 Instance

1. **Login to AWS Console** → EC2 Dashboard
2. **Launch Instance**:
   - **Name**: portfolio-website
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance Type**: t2.micro (free tier) or t3.small
   - **Key Pair**: Create new or use existing (download .pem file)
   - **Security Group**: 
     - SSH (22) - Your IP only
     - HTTP (80) - 0.0.0.0/0
     - HTTPS (443) - 0.0.0.0/0

3. **Allocate Elastic IP**:
   - EC2 → Elastic IPs → Allocate
   - Actions → Associate → Select your instance

### Configure Domain DNS

Add A record in your domain provider's DNS settings:

```
Name: profile
Type: A
Value: <Your Elastic IP>
TTL: 3600
```

Wait 5-60 minutes for DNS propagation.

### Connect to EC2 and Install Nginx

```bash
# Connect via SSH
ssh -i "your-key.pem" ubuntu@<your-elastic-ip>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify Nginx is running
sudo systemctl status nginx
```

### Upload Website Files

**From your local machine:**

```bash
# Navigate to your project folder
cd Personal/

# Upload files to EC2
scp -i "your-key.pem" -r * ubuntu@<your-elastic-ip>:/tmp/website/
```

**On EC2 instance:**

```bash
# Move files to web root
sudo rm -rf /var/www/html/*
sudo mv /tmp/website/* /var/www/html/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

### Configure Nginx Virtual Host

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/profile.sarcasticrobo.com
```

Add configuration:

```nginx
server {
    listen 80;
    server_name profile.sarcasticrobo.com;
    root /var/www/html;
    index index.html;
    
    # Main location
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|pdf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

Enable site:

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/profile.sarcasticrobo.com /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate and auto-configure Nginx
sudo certbot --nginx -d profile.sarcasticrobo.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

### Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (important - do this first!)
sudo ufw allow ssh

# Allow Nginx Full (HTTP + HTTPS)
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

### Set Up Automatic Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-website.sh
```

Add script:

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup website files
tar -czf $BACKUP_DIR/website_backup_$DATE.tar.gz /var/www/html

# Delete backups older than 7 days
find $BACKUP_DIR -name "website_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: website_backup_$DATE.tar.gz"
```

Make executable and schedule:

```bash
# Make script executable
sudo chmod +x /usr/local/bin/backup-website.sh

# Add to crontab (runs daily at 2 AM)
sudo crontab -e

# Add this line:
0 2 * * * /usr/local/bin/backup-website.sh
```

### Test Deployment

1. Visit `http://profile.sarcasticrobo.com` (should redirect to HTTPS)
2. Test all animations load correctly
3. Submit contact form (remember FormSubmit activation!)
4. Check SSL certificate (green padlock in browser)
5. Test on mobile devices

## Step 8: Contact Form Setup

### FormSubmit.co Configuration

The contact form uses FormSubmit.co - **no backend required!**

**Critical First-Time Setup:**

1. Submit a test message through your live contact form
2. Check email at `deepaksinghal1995@gmail.com`
3. Click the **activation link** in the FormSubmit email
4. Submit another test - should now receive emails!

**Form Configuration in HTML:**

```html
<form id="contact-form" action="https://formsubmit.co/deepaksinghal1995@gmail.com" method="POST">
    <!-- Hidden fields -->
    <input type="hidden" name="_subject" value="New message from Portfolio Website">
    <input type="hidden" name="_captcha" value="false">
    <input type="hidden" name="_template" value="table">
    
    <!-- Form fields -->
    <input type="text" name="name" placeholder="Your Name" required>
    <input type="email" name="email" placeholder="Your Email" required>
    <input type="text" name="subject" placeholder="Subject" required>
    <textarea name="message" placeholder="Your Message" rows="5" required></textarea>
    
    <button type="submit" class="btn btn-primary">Send Message</button>
</form>
```

**What You'll Receive:**

Each submission sends you an email with:
- Name of sender
- Email address (to reply)
- Subject line
- Message content
- Timestamp

## Troubleshooting

### Common Issues and Solutions

**Issue 1: Animations Not Working**

- **Check Console**: Open DevTools (F12) → Console tab for JavaScript errors
- **Verify Canvas IDs**: Ensure `<canvas id="particle-canvas">` matches `getElementById('particle-canvas')`
- **Test Browser**: Try in different browser (Chrome, Firefox)
- **Check File Paths**: Verify all JS files load correctly in Network tab

**Issue 2: Contact Form Not Sending**

- **Activation Required**: FormSubmit needs one-time activation (check spam folder)
- **CORS Errors**: FormSubmit works from live domains, not `file://` protocol
- **Email Typo**: Verify email address in form action URL
- **Form Method**: Must be `method="POST"`

**Issue 3: Website Not Loading on Custom Domain**

- **DNS Propagation**: Wait up to 24 hours (usually 5-60 minutes)
- **Check DNS**: Use `dig profile.sarcasticrobo.com` or online DNS checker
- **Nginx Config**: Run `sudo nginx -t` to test configuration
- **Firewall**: Verify ports 80 and 443 are open (`sudo ufw status`)

**Issue 4: SSL Certificate Errors**

- **Renew Certificate**: `sudo certbot renew`
- **Check Cert Status**: `sudo certbot certificates`
- **Nginx Reload**: `sudo systemctl reload nginx`
- **Port 443**: Ensure HTTPS port is allowed in security group

**Issue 5: Slow Animations on Mobile**

- **Reduce Particle Count**: Change `particleCount = 30` for mobile
- **Disable Heavy Effects**: Comment out matrix rain on small screens
- **Add Media Query**: Detect mobile and disable certain animations

```javascript
if (window.innerWidth < 768) {
    // Skip heavy animations on mobile
    return;
}
```

**Issue 6: Terminal Not Showing**

- **Z-Index**: Ensure terminal has high z-index (999+)
- **Position Fixed**: Terminal needs `position: fixed` in CSS
- **Check Display**: Verify `display: block` (not `none`)
- **JavaScript Errors**: Check console for errors in terminal initialization

## Going Further

### Enhancement Ideas

1. **Add Mobile Menu**:
   - Hamburger icon for navigation
   - Slide-in menu panel
   - Touch-friendly links

2. **Implement Blog Section**:
   - Technical articles
   - Project deep-dives
   - Tutorial content

3. **Add Analytics**:
   - Google Analytics for visitor tracking
   - Hotjar for user behavior
   - Monitor popular sections

4. **Performance Optimization**:
   - Lazy load images
   - Minify CSS/JS
   - Use WebP images
   - Implement service worker for offline support

5. **Advanced Animations**:
   - WebGL for 3D effects
   - GSAP for timeline animations
   - Intersection Observer for scroll-triggered effects

6. **Backend Integration**:
   - Node.js API for contact form
   - Database for blog posts
   - Admin panel for content management

7. **SEO Improvements**:
   - Meta tags optimization
   - OpenGraph tags for social sharing
   - Sitemap.xml
   - robots.txt

8. **Accessibility Enhancements**:
   - ARIA labels
   - Keyboard navigation
   - Screen reader testing
   - High contrast mode

## Conclusion

You've successfully built a professional embedded systems portfolio website featuring:

✅ **12 Advanced Animation Systems** - PCB traces, particles, matrix rain, typing, terminal, waveforms, LEDs, circuit nodes, glitch effects, stat counters  
✅ **Fully Responsive Design** - Works seamlessly on desktop, tablet, and mobile  
✅ **Production Deployment** - Live on AWS EC2 with Nginx and SSL  
✅ **Interactive Features** - Terminal simulation, contact form, skill connections  
✅ **Professional Aesthetic** - Dark theme with red accents, embedded systems vibe

### Key Learnings

1. **Canvas API Mastery**: Particle systems and matrix rain require understanding of canvas rendering, `requestAnimationFrame`, and performance optimization
2. **CSS Animations**: Hardware-accelerated transforms (`translate`, `scale`, `rotate`) provide smooth 60fps animations
3. **Event-Driven Architecture**: All interactive features use event listeners for clean, maintainable code
4. **Deployment Best Practices**: Nginx configuration, SSL certificates, security headers, and automated backups are essential for production websites
5. **User Experience**: Animations enhance the experience but must be performance-conscious and mobile-friendly

### Next Steps

1. **Customize Content**: Replace all placeholder text with your actual experience and projects
2. **Add Images**: Upload professional profile photo and project screenshots
3. **Test Thoroughly**: Check all features on different devices and browsers
4. **Monitor Performance**: Use Lighthouse to check performance, accessibility, and SEO scores
5. **Iterate and Improve**: Gather feedback and continuously enhance the website

## Complete Code Repository

All code for this tutorial is available on GitHub:

**Repository**: https://github.com/deepak4395/Personal  
**Live Demo**: https://profile.sarcasticrobo.com

### File Structure Summary

```
Personal/
├── index.html (270 lines)           # Main HTML structure
├── css/
│   └── style.css (1200+ lines)     # Complete styling
├── js/
│   ├── animations.js (300+ lines)   # 6 animation systems
│   ├── circuit-nodes.js (150 lines) # Skill connections
│   ├── effects.js (200 lines)       # Counters, glitch
│   └── main.js (400 lines)          # Terminal, nav, form
└── assets/
    └── images/                      # Profile and projects
```

**Total Project Stats**:
- ~2,500 lines of code
- 12 unique animation features
- 7 interactive terminal commands
- Fully responsive (mobile-first)
- Production-ready with SSL

---

**Congratulations!** You now have a professional, animation-rich portfolio website deployed to the web. Happy coding! 🚀

*Built with ❤️ by Deepak Singhal*  
*Tutorial Created: January 13, 2026*
