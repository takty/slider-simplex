# Slider Simplex

**Slider Simplex** is a customizable, lightweight, and dependency-free JavaScript/CSS image and video slider. It is designed with modern web standards, rich animation effects, and support for touch interactions.

## Features

- Pure HTML/CSS/JS – no dependencies
- Supports `fade`, `slide`, and `scroll` effects
- Touch-friendly with flick gestures
- Responsive layout using CSS Grid
- Fully customizable with CSS custom properties
- Built-in background blur, captions, and controls
- Navigation, pagination, and thumbnail selector
- Lazy-loaded image and video support

## Getting Started

### 1. Include Files

```html
<link rel="stylesheet" href="slider-simplex.min.css">
<script src="slider-simplex.min.js" defer></script>
```

### 2. HTML Structure

```html
<div id="slider" class="slider-simplex">
  <ul class="slides">
    <li>
      <img src="image1.jpg" alt="Slide 1">
      <div class="caption line"><div><span>Caption Text</span></div></div>
    </li>
    <li>
      <video src="video.mp4" muted autoplay loop></video>
    </li>
    <!-- More slides... -->
  </ul>
</div>
```

### 3. Initialization (optional for auto-start)

```html
<script>
  window.addEventListener("DOMContentLoaded", () => {
    SliderSimplex.create("slider");
  });
</script>
```

## Customization

Control appearance and behavior using CSS variables:

```css
.slider-simplex {
  --effect-type: slide;
  --duration-time: 6s;
  --transition-time: 1s;
  --create-navigation: true;
  --create-pagination: true;
  --slide-zoom: 1.1;
  --caption-color: #fff;
  --caption-color-bg: rgba(0, 0, 0, 0.4);
}
```

### Supported CSS Variables

- `--effect-type`: `fade`, `slide`, `scroll`
- `--duration-time`: slide duration (e.g., `8s`)
- `--transition-time`: transition time (e.g., `1s`)
- `--slide-fit`: `cover`, `contain`, etc.
- `--create-navigation`: `true` / `false`
- `--create-pagination`: `true` / `false`
- ...and many more (see CSS file for full list)

## Advanced Usage

You can programmatically control the slider:

```js
const slider = SliderSimplex.create("slider");
const ctrl = slider.getController();
ctrl.next();       // Go to next slide
ctrl.prev();       // Go to previous slide
ctrl.move(3);      // Move to slide index 3
```

## License

MIT License
