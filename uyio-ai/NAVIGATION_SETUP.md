# Navigation & Layout System - Complete Guide

## 📁 Files Created (11 Components + 2 Hooks)

### 🎨 Layout Components
1. ✅ `src/components/layout/Navbar.tsx` - Desktop navigation bar
2. ✅ `src/components/layout/MobileNav.tsx` - Mobile hamburger menu
3. ✅ `src/components/layout/BottomNav.tsx` - Mobile bottom tabs
4. ✅ `src/components/layout/AuthButton.tsx` - Smart auth state handler
5. ✅ `src/components/layout/UserMenu.tsx` - User dropdown menu
6. ✅ `src/components/layout/Logo.tsx` - Reusable logo component

### 🧩 Common Components
7. ✅ `src/components/common/Badge.tsx` - Badges for "Soon", "Pro", etc.

### 🪝 Custom Hooks
8. ✅ `src/hooks/useMediaQuery.ts` - Responsive breakpoint detection
9. ✅ `src/hooks/useScrollDirection.ts` - Scroll direction tracking

### 📄 Updated Files
10. ✅ `src/app/layout.tsx` - Main app layout with navigation
11. ✅ `src/app/globals.css` - CSS variables and animations

---

## 🎯 Features Implemented

### Desktop Navigation (Navbar)
- ✅ Fixed header with 64px height
- ✅ Uyio AI logo with mic icon (left)
- ✅ Center navigation: Practice, Progress, Courses
- ✅ "Coming Soon" badge on Courses
- ✅ Active route highlighting (blue)
- ✅ Auth buttons for guests
- ✅ User avatar dropdown for members
- ✅ Subtle shadow on scroll
- ✅ Smooth transitions

### Mobile Navigation (MobileNav + BottomNav)
- ✅ Hamburger menu icon (top-right)
- ✅ Full-screen slide-in menu from right
- ✅ Close button and backdrop click
- ✅ Navigation items with icons
- ✅ Bottom tab bar (3 items)
- ✅ Center "Practice" button (elevated)
- ✅ Active tab highlighting
- ✅ iOS safe area support

### User Menu
- ✅ Avatar with user initial
- ✅ Dropdown on click
- ✅ User info (name + email)
- ✅ Settings, Subscription, Help links
- ✅ Sign Out button
- ✅ Click outside to close
- ✅ Escape key to close
- ✅ Smooth fade-in animation

### Auth State
- ✅ Real-time auth listener
- ✅ Profile data fetching
- ✅ Loading skeleton
- ✅ Guest state: "Sign In" + "Start Free"
- ✅ Member state: User avatar + dropdown

---

## 🎨 Design System

### Colors
- Primary: `#3B82F6` (blue-500)
- Active: `text-blue-600 dark:text-blue-400`
- Inactive: `text-gray-600 dark:text-gray-400`
- Hover: `hover:text-gray-900 dark:hover:text-white`

### Typography
- Font: Inter (Google Font)
- Nav links: `text-sm font-medium`
- Logo: `text-xl font-bold`
- Badges: `text-xs`

### Spacing
- Nav height desktop: `64px`
- Nav height mobile: `56px`
- Bottom nav: `56px`
- Padding: `px-4 sm:px-6 lg:px-8`

### Animations
- Menu slide: `200ms ease-out`
- Dropdown fade: `200ms ease-out`
- Scale on hover: `hover:scale-110`
- All use `transform` (GPU-accelerated)

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
< 640px (sm) - Full mobile experience

/* Tablet */
640px - 1024px (md-lg) - Hybrid layout

/* Desktop */
> 1024px (lg+) - Full desktop navigation
```

### What Shows Where:
| Component | Mobile | Desktop |
|-----------|--------|---------|
| Navbar | ❌ | ✅ |
| MobileNav | ✅ | ❌ |
| BottomNav | ✅ | ❌ |

---

## 🔧 Component API

### Logo Component
```tsx
<Logo 
  size="sm" | "md" | "lg"
  showText={true}
  showIcon={true}
  href="/"
/>
```

### Badge Component
```tsx
<Badge 
  variant="default" | "success" | "warning" | "info" | "pro"
  size="sm" | "md"
>
  Content
</Badge>
```

### useMediaQuery Hook
```tsx
const { isMobile, isTablet, isDesktop } = useMediaQuery()

if (isMobile) {
  // Mobile-specific code
}
```

### useScrollDirection Hook
```tsx
const { scrollDirection, scrollY } = useScrollDirection()

if (scrollDirection === 'down' && scrollY > 100) {
  // Hide navbar
}
```

---

## 🎯 Navigation Routes

### Current Routes
- `/` - Landing page (guest mode)
- `/practice` - Practice session page
- `/progress` - User progress & stats
- `/courses` - Course library (coming soon)

### Auth Routes
- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/auth/callback` - Auth callback handler

### User Routes
- `/settings` - User settings
- `/subscription` - Subscription management
- `/help` - Help & support

---

## ✨ Interactive Features

### Active Route Detection
```tsx
// Automatically highlights active nav item
const pathname = usePathname()
const isActive = pathname === '/practice'
```

### Scroll Shadow
```tsx
// Navbar adds shadow when scrolled
const [scrolled, setScrolled] = useState(false)
useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 10)
  window.addEventListener('scroll', handleScroll)
}, [])
```

### User State
```tsx
// Real-time auth state
const [user, setUser] = useState(null)
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
  return () => subscription.unsubscribe()
}, [])
```

---

## 🎨 CSS Variables

```css
:root {
  --nav-height: 64px;
  --mobile-nav-height: 56px;
  --bottom-nav-height: 56px;
}
```

Usage in components:
```tsx
style={{ height: 'var(--nav-height)' }}
```

---

## ♿ Accessibility

### ARIA Labels
- ✅ Menu buttons have `aria-label`
- ✅ Dropdowns have `aria-expanded`
- ✅ Mobile menu has `aria-label`

### Keyboard Navigation
- ✅ Tab through all interactive elements
- ✅ Escape key closes menus
- ✅ Enter/Space activates buttons

### Focus States
- ✅ `focus:outline-none focus:ring-2`
- ✅ Visible focus indicators
- ✅ Skip to content (implicit)

---

## 🚀 Testing Checklist

### Desktop (> 1024px)
- [ ] Top navbar visible
- [ ] Logo clickable → home
- [ ] Center nav links work
- [ ] Active route highlighted
- [ ] "Courses" has "Soon" badge
- [ ] Guest: See "Sign In" + "Start Free"
- [ ] Member: See user avatar
- [ ] Avatar click opens dropdown
- [ ] Dropdown items work
- [ ] Sign out works
- [ ] Shadow appears on scroll

### Mobile (< 640px)
- [ ] Top bar with logo + hamburger
- [ ] Hamburger opens slide-in menu
- [ ] Menu slides from right
- [ ] Backdrop click closes menu
- [ ] X button closes menu
- [ ] Nav items work
- [ ] Bottom tab bar visible
- [ ] Center "Practice" button elevated
- [ ] Active tab highlighted
- [ ] Safe area padding on iOS

### Both
- [ ] Dark mode works
- [ ] Smooth animations
- [ ] No layout shift
- [ ] Click outside closes menus
- [ ] Escape closes menus
- [ ] Auth state updates real-time

---

## 🎨 Customization Options

### Change Nav Height
```css
/* In globals.css */
:root {
  --nav-height: 72px; /* Change from 64px */
}
```

### Add New Nav Link
```tsx
// In Navbar.tsx or MobileNav.tsx
const navLinks = [
  { href: '/practice', label: 'Practice' },
  { href: '/progress', label: 'Progress' },
  { href: '/courses', label: 'Courses', badge: 'Soon' },
  { href: '/community', label: 'Community' }, // NEW
]
```

### Change Primary Color
```tsx
// Replace all instances of:
text-blue-600 → text-purple-600
bg-blue-500 → bg-purple-500
```

### Add Menu Item
```tsx
// In UserMenu.tsx
<Link href="/billing">
  <CreditCard className="w-4 h-4" />
  <span>Billing</span>
</Link>
```

---

## 🐛 Troubleshooting

### "Menu doesn't close on mobile"
- Check if `pathname` is in dependency array
- Verify `setIsOpen(false)` in useEffect

### "Scroll shadow not appearing"
- Check scroll event listener
- Verify `scrolled` state is updating

### "User avatar not showing"
- Check Supabase auth state
- Verify profile data fetching
- Check for auth errors in console

### "Layout shift on page load"
- Ensure nav heights are consistent
- Use `pt-16` on main content
- Check safe area padding

### "Dark mode not working"
- Verify `dark:` classes are present
- Check Tailwind config for darkMode
- Test with system dark mode

---

## 📦 Dependencies Used

- **Next.js 14** - App Router, usePathname
- **Supabase** - Auth state management
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **Tailwind CSS** - Styling

---

## 🎉 You're Done!

Your app now has:
- ✅ Professional desktop navigation
- ✅ Mobile-optimized experience
- ✅ Bottom tab bar
- ✅ User authentication UI
- ✅ Dropdown menus
- ✅ Smooth animations
- ✅ Dark mode support
- ✅ Fully responsive
- ✅ Accessible

---

## 🚀 Next Steps

1. **Test the navigation** - Visit http://localhost:3000
2. **Try mobile view** - Resize browser or use DevTools
3. **Test auth flow** - Sign up → See avatar
4. **Build dashboard** - /dashboard page
5. **Add practice page** - /practice page

---

**Questions?** The navigation system is complete and ready to use! 🎨


