# 🎨 FYPIFY Theme Usage Guide

## Tailwind CSS Integration

Your complete FYPIFY theme has been configured in `app/globals.css` and is ready to use with Tailwind CSS.

---

## 🔮 How to Use Colors in Your Code

### Using in Tailwind Classes

```jsx
// Primary colors
<button className="bg-primary hover:bg-primary-dark text-white">
  Primary Button
</button>

<div className="bg-primary-light p-4">
  Light background section
</div>

// Secondary colors
<button className="bg-secondary hover:bg-secondary-dark">
  Secondary Action
</button>

// Accent colors
<span className="bg-accent text-neutral-dark px-2 py-1 rounded">
  New Badge
</span>

// Text colors
<h1 className="text-text-primary">Main Heading</h1>
<p className="text-text-secondary">Paragraph text</p>
<span className="text-text-muted">Muted text</span>

// Status colors
<div className="bg-success text-white p-2">Success Message</div>
<div className="bg-danger text-white p-2">Error Message</div>
<div className="bg-warning text-neutral-dark p-2">Warning</div>
<div className="bg-info text-white p-2">Info Message</div>

// Neutral backgrounds
<div className="bg-neutral-light">White card</div>
<div className="bg-neutral-grey">Grey section</div>
<div className="bg-neutral-dark text-white">Dark footer</div>
```

---

## 📦 Component Examples

### 1. Primary Button
```jsx
<button className="bg-primary hover:bg-primary-dark active:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors duration-200">
  Submit Project
</button>
```

### 2. Card Component
```jsx
<div className="bg-neutral-light shadow-md rounded-lg p-6 border border-neutral-grey">
  <h2 className="text-text-primary font-bold text-xl mb-2">Project Title</h2>
  <p className="text-text-secondary">Project description goes here.</p>
  <span className="text-text-muted text-sm">Due: Dec 15, 2025</span>
</div>
```

### 3. Status Badge
```jsx
// Success
<span className="bg-success text-white px-3 py-1 rounded-full text-sm">
  Approved
</span>

// Warning
<span className="bg-warning text-neutral-dark px-3 py-1 rounded-full text-sm">
  Pending
</span>

// Danger
<span className="bg-danger text-white px-3 py-1 rounded-full text-sm">
  Rejected
</span>
```

### 4. Navbar
```jsx
<nav className="bg-neutral-light shadow-md">
  <div className="container mx-auto px-4 py-3">
    <ul className="flex space-x-6">
      <li>
        <a href="#" className="text-primary font-semibold hover:text-primary-dark">
          Dashboard
        </a>
      </li>
      <li>
        <a href="#" className="text-text-secondary hover:text-primary">
          Projects
        </a>
      </li>
    </ul>
  </div>
</nav>
```

### 5. Form Input
```jsx
<div className="mb-4">
  <label className="block text-text-primary font-medium mb-2">
    Project Title
  </label>
  <input
    type="text"
    className="w-full px-4 py-2 bg-neutral-grey-light border border-neutral-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder:text-text-muted"
    placeholder="Enter project title"
  />
</div>
```

### 6. Alert/Notification
```jsx
// Success Alert
<div className="bg-success/10 border border-success rounded-lg p-4">
  <p className="text-success font-medium">Project submitted successfully!</p>
</div>

// Error Alert
<div className="bg-danger/10 border border-danger rounded-lg p-4">
  <p className="text-danger font-medium">Failed to upload document.</p>
</div>

// Info Alert
<div className="bg-info/10 border border-info rounded-lg p-4">
  <p className="text-info font-medium">Deadline is approaching.</p>
</div>
```

### 7. Highlighted Section
```jsx
<section className="bg-primary-extra-light p-8 rounded-lg">
  <h2 className="text-primary text-2xl font-bold mb-4">Welcome to FYPIFY</h2>
  <p className="text-text-secondary">Manage your FYP projects efficiently.</p>
</section>
```

### 8. Dashboard Card with Shadow
```jsx
<div className="bg-neutral-light rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
  <div className="flex items-center space-x-4">
    <div className="bg-primary-light p-3 rounded-lg">
      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
        {/* Icon SVG */}
      </svg>
    </div>
    <div>
      <h3 className="text-text-primary font-semibold">Total Projects</h3>
      <p className="text-text-muted text-sm">42 active projects</p>
    </div>
  </div>
</div>
```

### 9. Dropdown Menu
```jsx
<div className="absolute bg-neutral-light shadow-lg rounded-lg py-2 mt-2 border border-neutral-grey">
  <a href="#" className="block px-4 py-2 text-text-secondary hover:bg-primary-light hover:text-primary">
    My Profile
  </a>
  <a href="#" className="block px-4 py-2 text-text-secondary hover:bg-primary-light hover:text-primary">
    Settings
  </a>
  <a href="#" className="block px-4 py-2 text-danger hover:bg-danger/10">
    Logout
  </a>
</div>
```

### 10. Progress Indicator
```jsx
<div className="w-full bg-neutral-grey rounded-full h-2">
  <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
</div>
<p className="text-text-muted text-sm mt-1">65% Complete</p>
```

---

## 🎨 Complete Color Reference

### Primary Colors (Brand Core)
| Variable | Hex | Usage |
|----------|-----|-------|
| `primary` | #A122B5 | Primary buttons, active states, brand elements |
| `primary-dark` | #7F1A8A | Hover states, focus rings |
| `primary-light` | #E8C6EE | Section backgrounds, hover effects |
| `primary-extra-light` | #F6EAF9 | Subtle backgrounds, cards |

### Secondary Colors (Supporting UI)
| Variable | Hex | Usage |
|----------|-----|-------|
| `secondary` | #3B82F6 | Secondary buttons, labels, tags |
| `secondary-dark` | #1D4ED8 | Hover states |
| `secondary-light` | #DBEAFE | Badges, info cards |

### Accent Colors (Attention)
| Variable | Hex | Usage |
|----------|-----|-------|
| `accent` | #FACC15 | Notification badges, highlights |
| `accent-dark` | #EAB308 | Hover states |
| `accent-light` | #FEF3C7 | Highlight backgrounds |

### Neutral Colors (Base)
| Variable | Hex | Usage |
|----------|-----|-------|
| `neutral-light` | #FFFFFF | Main backgrounds, cards |
| `neutral-grey` | #F2F4F7 | Card backgrounds, sections |
| `neutral-grey-light` | #F8FAFC | Page backgrounds |
| `neutral-dark` | #1F2937 | Dark mode, footers |

### Text Colors
| Variable | Hex | Usage |
|----------|-----|-------|
| `text-primary` | #0F172A | Headings, main text |
| `text-secondary` | #475569 | Paragraphs, subheadings |
| `text-muted` | #64748B | Placeholders, disabled text |

### Status Colors
| Variable | Hex | Usage |
|----------|-----|-------|
| `success` | #22C55E | Success messages, completed states |
| `warning` | #F59E0B | Warnings, cautions |
| `danger` | #EF4444 | Errors, delete actions |
| `info` | #3B82F6 | Informational alerts |

---

## 🌗 Dark Mode Support

The theme includes automatic dark mode support. Colors will automatically adjust when the user's system preference is set to dark mode.

```jsx
// This will automatically work in dark mode
<div className="bg-neutral-light text-text-primary">
  Content adapts to light/dark mode
</div>
```

---

## 💡 Best Practices

1. **Consistency**: Use `primary` for all main actions, `secondary` for supporting actions
2. **Hierarchy**: Use text colors to establish visual hierarchy (primary > secondary > muted)
3. **Contrast**: Ensure text has sufficient contrast against backgrounds
4. **Status**: Always use status colors consistently (success = green, danger = red, etc.)
5. **Shadows**: Use shadows to create depth and separate layers
6. **Spacing**: Combine colors with proper padding and margins for better UI

---

## 🚀 Quick Start Examples

### Student Dashboard Card
```jsx
<div className="bg-neutral-light rounded-lg shadow-md p-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-text-primary font-bold text-lg">My Project</h3>
    <span className="bg-accent text-neutral-dark px-3 py-1 rounded-full text-sm font-medium">
      Active
    </span>
  </div>
  <p className="text-text-secondary mb-4">AI-powered Drone Navigation System</p>
  <div className="flex space-x-2">
    <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg">
      View Details
    </button>
    <button className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg">
      Upload
    </button>
  </div>
</div>
```

### Supervisor Review Interface
```jsx
<div className="bg-neutral-grey-light min-h-screen p-8">
  <div className="bg-neutral-light rounded-xl shadow-lg p-6">
    <h2 className="text-text-primary font-bold text-xl mb-4">Review Submission</h2>
    
    {/* Document viewer would go here */}
    
    <div className="mt-6 flex space-x-4">
      <button className="bg-success hover:bg-success/90 text-white px-6 py-3 rounded-lg">
        Approve
      </button>
      <button className="bg-warning hover:bg-warning/90 text-neutral-dark px-6 py-3 rounded-lg">
        Request Revision
      </button>
      <button className="bg-danger hover:bg-danger/90 text-white px-6 py-3 rounded-lg">
        Reject
      </button>
    </div>
  </div>
</div>
```

---

## 📝 Notes

- All colors are available as Tailwind utilities (e.g., `bg-primary`, `text-secondary`, `border-accent`)
- You can use opacity modifiers (e.g., `bg-primary/50` for 50% opacity)
- Dark mode automatically adjusts colors based on system preferences
- The theme is fully responsive and works across all screen sizes

---

*Happy coding with FYPIFY! 🎨✨*
