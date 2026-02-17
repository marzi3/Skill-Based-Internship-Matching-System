# Color Theme Documentation

## Overview
All color themes are defined in `src/styles/globals.css` using CSS custom properties (variables). This ensures a consistent color scheme across the entire application for all team members.

## How to Use the Theme

### Import Global Styles
Make sure your Next.js app imports the global styles. Check `src/app/layout.jsx` includes:
```jsx
import '@/styles/globals.css';
```

### Theme Variables
All colors are available as CSS variables and can be used in any CSS or CSS module file:

```css
/* Light Theme (Default) */
background-color: var(--primary-color);      /* #6366f1 */
color: var(--text-primary);                   /* #1e293b */
border: 1px solid var(--border-color);        /* #e2e8f0 */
```

## Available Color Variables

### Primary Colors
- `--primary-color`: Main brand color
- `--primary-light`: Lighter variant
- `--primary-dark`: Darker variant
- `--primary-hover`: Hover state color

### Secondary Colors
- `--secondary-color`: Secondary brand color
- `--secondary-light`: Lighter variant
- `--secondary-dark`: Darker variant

### Accent Colors
- `--accent-color`: Accent/teal color
- `--accent-light`: Lighter variant
- `--accent-dark`: Darker variant

### Background Colors
- `--bg-primary`: Main background (#ffffff light, #0f172a dark)
- `--bg-secondary`: Secondary background
- `--bg-tertiary`: Tertiary background
- `--bg-hover`: Hover state background

### Text Colors
- `--text-primary`: Main text color
- `--text-secondary`: Secondary text (lighter)
- `--text-tertiary`: Tertiary text (even lighter)
- `--text-light`: Very light text
- `--text-white`: White text

### Border & Divider Colors
- `--border-color`: Default border color
- `--border-light`: Light border
- `--divider-color`: Divider line color

### Status Colors
- `--success-color`: Success/green
- `--warning-color`: Warning/yellow
- `--danger-color`: Error/red
- `--info-color`: Info/blue

### Spacing
- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 12px
- `--spacing-lg`: 16px
- `--spacing-xl`: 24px
- `--spacing-2xl`: 32px
- `--spacing-3xl`: 48px

### Border Radius
- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-xl`: 16px
- `--radius-full`: 9999px (circle)

### Font Sizes
- `--font-size-xs`: 12px
- `--font-size-sm`: 14px
- `--font-size-md`: 16px
- `--font-size-lg`: 18px
- `--font-size-xl`: 20px
- `--font-size-2xl`: 24px
- `--font-size-3xl`: 30px

### Font Weights
- `--font-weight-light`: 300
- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

### Transitions
- `--transition-fast`: 150ms ease-in-out
- `--transition-normal`: 300ms ease-in-out
- `--transition-slow`: 500ms ease-in-out

### Shadow
- `--shadow-sm`: Small shadow
- `--shadow-md`: Medium shadow
- `--shadow-lg`: Large shadow
- `--shadow-xl`: Extra large shadow

### Z-Index
- `--z-dropdown`: 1000
- `--z-sticky`: 1020
- `--z-fixed`: 1030
- `--z-modal-backdrop`: 1040
- `--z-modal`: 1050
- `--z-popover`: 1060
- `--z-tooltip`: 1070

## Pre-built CSS Classes

### Text Colors
```html
<p class="text-primary">Primary text</p>
<p class="text-secondary">Secondary text</p>
<p class="text-success">Success text</p>
<p class="text-danger">Danger text</p>
<p class="text-warning">Warning text</p>
<p class="text-info">Info text</p>
```

### Background Colors
```html
<div class="bg-primary">Primary background</div>
<div class="bg-secondary">Secondary background</div>
<div class="bg-success">Success background</div>
<div class="bg-danger">Danger background</div>
```

### Button Styles
```html
<button class="btn-primary">Primary Button</button>
<button class="btn-secondary">Secondary Button</button>
<button class="btn-success">Success Button</button>
<button class="btn-danger">Danger Button</button>
<button class="btn-outline">Outline Button</button>
```

### Spacing Classes
```html
<!-- Margin -->
<div class="m-0">Margin 0</div>
<div class="m-xs">Margin 4px</div>
<div class="m-sm">Margin 8px</div>
<div class="m-md">Margin 12px</div>
<div class="m-lg">Margin 16px</div>
<div class="m-xl">Margin 24px</div>

<!-- Padding (same pattern with p- prefix) -->
<div class="p-md">Padding 12px</div>
```

### Border Radius Classes
```html
<div class="rounded">Border radius 8px</div>
<div class="rounded-lg">Border radius 12px</div>
<div class="rounded-full">Fully rounded (circle)</div>
```

### Shadow Classes
```html
<div class="shadow-sm">Small shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
```

## Dark Theme

To enable dark theme, add the `data-theme="dark"` attribute to any parent element:

```jsx
// In a React component
<main data-theme="dark">
  <h1>This uses dark theme colors</h1>
</main>
```

Or in CSS module:
```css
:root[data-theme="dark"] {
  /* Dark theme specific overrides */
}
```

## Usage Examples

### CSS Module Example
```css
/* src/components/Card.module.css */
.card {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### React Component Example
```jsx
import styles from './Card.module.css';

export default function Card({ title, children }) {
  return (
    <div className={styles.card}>
      <h3 style={{ color: 'var(--primary-color)' }}>{title}</h3>
      {children}
    </div>
  );
}
```

### Inline Styles (When Necessary)
```jsx
<div style={{
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  padding: 'var(--spacing-lg)',
  borderRadius: 'var(--radius-md)',
}}>
  Content here
</div>
```

## Testing the Theme

Visit the home page (`/`) to see a complete theme showcase with:
- Light and dark theme switcher
- All color swatches
- Button style examples
- Status message examples

## Best Practices

1. **Always use CSS variables** instead of hardcoding colors
2. **Use CSS modules** for component-specific styling
3. **Follow the spacing scale** for consistent padding/margins
4. **Use pre-built classes** when available (`.btn-primary`, `.text-success`, etc.)
5. **Maintain contrast** for accessibility (especially with text colors)
6. **Test both themes** when adding new components

## Team Coordination

Since all colors are defined in one file (`src/styles/globals.css`), all team members will automatically use the same color scheme. To update colors:

1. Edit `src/styles/globals.css`
2. Update the CSS variables in the `:root` selector
3. All components will reflect the changes automatically

## Troubleshooting

### Colors not appearing?
- Ensure `globals.css` is imported in your layout
- Check that you're using `var(--variable-name)` syntax
- Make sure the CSS module/file is being used correctly

### Dark theme not switching?
- Add `data-theme="dark"` to the parent element
- Check that the browser DevTools shows the attribute applied
- Clear browser cache if changes don't appear

### Spacing looks off?
- Verify you're using `var(--spacing-*)` variables
- Check the responsive media queries are applied
- Test on different devices/screen sizes
