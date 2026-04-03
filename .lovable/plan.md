

# SubjectSupport LATAM — Landing Page

## Design System
- **Theme**: Enterprise Dark with Slate-950 background
- **Primary accent**: Azure (#3B82F6) for student CTAs
- **Secondary accent**: Gold (#EAB308) for tutor CTAs
- **Typography**: Clean, modern with proper hierarchy
- **Border radius**: Rounded, modern feel
- **Glassmorphism**: backdrop-blur + semi-transparent backgrounds

## Pages & Components

### 1. Navbar (Sticky + Glassmorphism)
- Fixed top, `backdrop-blur-xl` with `bg-slate-950/60` border-bottom subtle
- Left: Minimalist "SubjectSupport LATAM" logo/text
- Right: "Iniciar sesión" button with hover dropdown menu containing "Login Estudiante" and "Login Tutor" options
- Mobile: Hamburger menu with same options

### 2. Hero Section
- **Background**: Retro Grid pattern (animated grid lines fading into perspective) over Slate-950
- **Title**: "Conecta con tutores de toda Latinoamérica" — large, bold, white
- **Subtitle**: Persuasive copy about finding expert tutors across LATAM
- **CTAs**: Two high-contrast buttons side by side:
  - "Soy Estudiante" — Azure/Blue filled
  - "Soy Tutor" — Gold filled
- **Animation**: Framer Motion staggered fade-in + slide-up for all elements

### 3. Geo-IP Banner (Floating)
- `useGeoLocation` mock hook that randomly returns a LATAM country
- Floating banner (bottom-right or top) with smooth entrance animation
- Shows: "¡Hola! Detectamos que estás en [País]. Tenemos tutores disponibles para ti"
- Dismissible with close button
- Styled with accent border and semi-transparent dark background

### 4. Countries Section
- Section title: "Presentes en toda Latinoamérica"
- Grid of 20 LATAM countries (4-5 columns desktop, 2-3 mobile)
- Each card: Country flag emoji + country name
- Subtle hover effect with scale + glow
- Countries: México, Colombia, Argentina, Chile, Perú, Ecuador, Venezuela, Guatemala, Cuba, Bolivia, Honduras, Paraguay, El Salvador, Nicaragua, Costa Rica, Panamá, Uruguay, República Dominicana, Brasil, Puerto Rico

### 5. Footer
- Simple dark footer with copyright and links

## Technical Details
- Install & use **Framer Motion** for all entrance animations
- Mobile-first responsive design (sm → md → lg breakpoints)
- WCAG accessibility: proper heading hierarchy, alt text, focus states, color contrast ratios, aria labels
- Retro Grid component built as a custom CSS animation with gradient lines

