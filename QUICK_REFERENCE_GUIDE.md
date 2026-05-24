# Frontend UI/UX Upgrade - Quick Reference Guide

## 🚀 Quick Start (2 Minutes)

### **Copy & Paste These Commands:**

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Clean cache
rm -rf .next && npm cache clean --force

# 3. Rebuild
npm run build

# 4. Start dev server
npm run dev

# 5. Open browser
# http://localhost:3000/dashboard
```

---

## 📚 Component Quick Reference

### **StatCard** - Display statistics
```tsx
import { StatCard } from '@/components/ui';

<StatCard
  icon={<Layers className="h-6 w-6" />}
  label="Systems"
  value={42}
  subtext="Core systems"
  trend="up"
  trendValue="+2"
  color="purple"
/>
```

**Colors**: cyan, blue, purple, green, orange, red, amber, pink, indigo
**Trends**: up, down, neutral

---

### **GlassButton** - Interactive buttons
```tsx
import { GlassButton } from '@/components/ui';

<GlassButton
  variant="primary"
  size="lg"
  onClick={handleClick}
>
  <Search className="h-5 w-5" />
  Search
</GlassButton>
```

**Variants**: primary, secondary, success, danger, warning, info
**Sizes**: sm, md, lg

---

### **GlassPanel** - Container panels
```tsx
import { GlassPanel } from '@/components/ui';

<GlassPanel
  title="Quick Drawing Lookup"
  subtitle="Search and view PDF drawings"
  icon={<Search className="h-5 w-5" />}
  variant="elevated"
  glow={true}
  glowColor="cyan"
>
  {/* Content */}
</GlassPanel>
```

**Variants**: default, elevated, flat
**Glow Colors**: cyan, blue, purple, green, orange, pink

---

### **Card3D** - 3D perspective cards
```tsx
import { Card3D } from '@/components/ui';

<Card3D glowColor="blue" variant="elevated">
  <div className="p-4">
    {/* Content */}
  </div>
</Card3D>
```

**Glow Colors**: cyan, blue, purple, green, orange, red, amber, pink, indigo
**Variants**: default, elevated, flat, outline

---

## 🎨 CSS Classes Quick Reference

### **Text Gradients**
```html
<!-- Cyan to Blue gradient -->
<h1 class="gradient-text">Gradient Text</h1>

<!-- Purple to Pink gradient -->
<h1 class="text-gradient-purple">Gradient Text</h1>

<!-- Green gradient -->
<h1 class="text-gradient-green">Gradient Text</h1>

<!-- Animated gradient -->
<h1 class="gradient-text-animated">Animated Gradient</h1>
```

---

### **Glass Effects**
```html
<!-- Glass card -->
<div class="glass-card">Content</div>

<!-- Glass card with hover -->
<div class="glass-card-hover">Content</div>

<!-- Morphing glass card -->
<div class="glass-card-morph">Content</div>
```

---

### **Animations**
```html
<!-- Glow pulse -->
<div class="glow-pulse">Content</div>

<!-- Floating -->
<div class="float">Content</div>
<div class="float-slow">Content</div>
<div class="float-slower">Content</div>

<!-- Shimmer -->
<div class="shimmer-enhanced">Content</div>

<!-- Neon glow -->
<div class="neon-glow">Content</div>

<!-- Gradient border -->
<div class="gradient-border">Content</div>

<!-- Pulse ring -->
<div class="pulse-ring">Content</div>

<!-- Blob animation -->
<div class="blob">Content</div>

<!-- Rotate -->
<div class="rotate-slow">Content</div>
<div class="rotate-slower">Content</div>

<!-- Bounce -->
<div class="bounce-enhanced">Content</div>

<!-- Slide in -->
<div class="slide-in-left">Content</div>
<div class="slide-in-right">Content</div>
<div class="slide-in-top">Content</div>
<div class="slide-in-bottom">Content</div>
```

---

### **Badges**
```html
<!-- Primary badge -->
<span class="badge badge-primary">Primary</span>

<!-- Success badge -->
<span class="badge badge-success">Success</span>

<!-- Warning badge -->
<span class="badge badge-warning">Warning</span>

<!-- Danger badge -->
<span class="badge badge-danger">Danger</span>
```

---

### **Status Indicators**
```html
<!-- Active status -->
<span class="status-dot status-active"></span>

<!-- Inactive status -->
<span class="status-dot status-inactive"></span>

<!-- Warning status -->
<span class="status-dot status-warning"></span>

<!-- Error status -->
<span class="status-dot status-error"></span>
```

---

## 🎬 Framer Motion Quick Reference

### **Basic Animation**
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

---

### **Hover Animation**
```tsx
<motion.div
  whileHover={{ scale: 1.05, y: -4 }}
  whileTap={{ scale: 0.95 }}
>
  Content
</motion.div>
```

---

### **Staggered Animation**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.1 }}
>
  Content
</motion.div>
```

---

## 🔍 Troubleshooting Quick Reference

### **Issue: Components not showing**
```bash
# Solution:
rm -rf .next
npm cache clean --force
npm run build
npm run dev
```

### **Issue: CSS not applying**
```bash
# Solution:
rm -rf .next
npm run build
npm run dev
```

### **Issue: Build errors**
```bash
# Check for errors:
npm run build 2>&1 | grep -i error

# Clean and rebuild:
rm -rf .next node_modules/.cache
npm run build
```

### **Issue: Module not found**
```bash
# Verify components exist:
ls -la src/components/ui/

# Verify exports:
cat src/components/ui/index.ts
```

---

## 📁 File Structure Quick Reference

```
src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx (Uses UI components)
│   ├── globals.css (Animations & styles)
│   └── layout.tsx
├── components/
│   └── ui/
│       ├── Card3D.tsx
│       ├── GlassButton.tsx
│       ├── StatCard.tsx
│       ├── GlassPanel.tsx
│       └── index.ts
└── lib/

tailwind.config.ts (Configuration)
postcss.config.mjs (PostCSS config)
package.json (Dependencies)
```

---

## 🎯 Common Tasks

### **Add a new stat card to dashboard**
```tsx
<StatCard
  icon={<YourIcon className="h-6 w-6" />}
  label="Your Label"
  value={yourValue}
  subtext="Your subtext"
  trend="up"
  trendValue="+X"
  color="cyan"
/>
```

### **Add a new glass panel**
```tsx
<GlassPanel
  title="Your Title"
  subtitle="Your subtitle"
  icon={<YourIcon className="h-5 w-5" />}
  variant="elevated"
  glow={true}
  glowColor="cyan"
>
  {/* Your content */}
</GlassPanel>
```

### **Add a new 3D card**
```tsx
<Card3D glowColor="blue" variant="elevated">
  <div className="p-4">
    {/* Your content */}
  </div>
</Card3D>
```

### **Add a new button**
```tsx
<GlassButton
  variant="primary"
  size="lg"
  onClick={handleClick}
>
  Your Button Text
</GlassButton>
```

---

## 🎨 Color Reference

### **Available Colors**
- cyan
- blue
- purple
- green
- orange
- red
- amber
- pink
- indigo

### **Usage**
```tsx
// StatCard colors
<StatCard color="cyan" ... />

// Card3D glow colors
<Card3D glowColor="blue" ... />

// GlassPanel glow colors
<GlassPanel glowColor="purple" ... />
```

---

## 📊 Tailwind Utilities

### **Custom Animations**
```
fade-in, fade-out
slide-in-right, slide-in-left, slide-in-up, slide-in-down
bounce-slow, pulse-slow, spin-slow, ping-slow
wiggle, shimmer, glow
```

### **Custom Shadows**
```
glow-sm, glow, glow-lg, glow-xl
inner-glow, neon, neon-lg
```

### **Custom Colors**
```
primary, secondary, accent, dark
(with 50-950 shades)
```

---

## 🚀 Performance Tips

1. **Use components** - They're optimized
2. **Use Tailwind classes** - They're tree-shakeable
3. **Lazy load pages** - Use dynamic imports
4. **Optimize images** - Use Next.js Image component
5. **Cache assets** - Use Next.js caching

---

## 📞 Quick Help

### **Need to restart dev server?**
```bash
# Ctrl+C to stop
# Then:
npm run dev
```

### **Need to rebuild?**
```bash
npm run build
```

### **Need to check build?**
```bash
npm run build 2>&1 | tail -20
```

### **Need to check components?**
```bash
ls -la src/components/ui/
```

### **Need to check CSS?**
```bash
head -20 src/app/globals.css
```

---

## ✅ Verification Checklist

- [ ] Dev server running
- [ ] No console errors (F12)
- [ ] Dashboard loads
- [ ] Stat cards visible
- [ ] Glass panels visible
- [ ] Animations smooth
- [ ] Hover effects working
- [ ] 3D tilt working
- [ ] Glow effects visible
- [ ] All pages loading

---

## 🎉 You're All Set!

Everything is ready. Just restart your dev server and enjoy the beautiful new UI/UX!

**Time to fix**: ~2 minutes
**Difficulty**: Easy
**Result**: Beautiful modern frontend! 🚀

---

**Last Updated**: May 24, 2026
**Status**: ✅ Ready for Production

