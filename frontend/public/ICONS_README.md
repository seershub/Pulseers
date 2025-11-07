# Icon Assets Required for Mini App

## Required Icons

You need to create the following icon files and place them in the `/public` directory:

### 1. App Icons
- `icon-192x192.png` - 192x192px PNG (App icon for mobile)
- `icon-512x512.png` - 512x512px PNG (App icon for desktop/high-res)

### 2. Social Images
- `og-image.png` - 1200x630px PNG (Open Graph image for social sharing)
- `splash.png` - 1080x1920px PNG (Splash screen for Mini App launch)

## Design Guidelines

### App Icon (icon-192x192.png & icon-512x512.png)
- **Format**: PNG with transparency
- **Design**: Simple, recognizable Pulseers logo
- **Colors**: Match brand colors (Blue #0052FF, Cyan accent)
- **Background**: Transparent or solid dark (#0A0F1E)
- **Content**: Should be clear and visible at small sizes

### OG Image (og-image.png)
- **Format**: PNG or JPEG
- **Dimensions**: 1200x630px (exact)
- **Design**: Include Pulseers branding and tagline
- **Text**: Large, readable "Pulseers - Signal Your Team"
- **Background**: Gradient matching app theme

### Splash Screen (splash.png)
- **Format**: PNG
- **Dimensions**: 1080x1920px (portrait)
- **Design**: Full-screen loading screen
- **Content**: Pulseers logo centered, brand colors
- **Background**: Solid color or gradient (#0A0F1E to #0052FF)

## Quick Generation Options

### Option 1: Use Figma/Design Tool
Create icons using the design guidelines above

### Option 2: Generate with AI
Use tools like:
- DALL-E / Midjourney
- Canva (has icon templates)
- Figma with AI plugins

### Option 3: Temporary Placeholders
For testing, you can use simple colored squares:
```bash
# Generate placeholder with ImageMagick (if available)
convert -size 192x192 xc:"#0052FF" icon-192x192.png
convert -size 512x512 xc:"#0052FF" icon-512x512.png
convert -size 1200x630 xc:"#0A0F1E" og-image.png
convert -size 1080x1920 xc:"#0A0F1E" splash.png
```

## Verification

After adding icons, verify they appear correctly:
1. Check `/manifest.json` loads in browser
2. Test PWA install on mobile
3. Share link on Twitter/Farcaster to check OG image
4. Open in Farcaster client to verify Mini App icons

## Update Farcaster Manifest

After creating icons, update `public/.well-known/farcaster.json` with your actual domain:
```json
{
  "frame": {
    "iconUrl": "https://your-actual-domain.vercel.app/icon-512x512.png",
    "splashImageUrl": "https://your-actual-domain.vercel.app/splash.png",
    "homeUrl": "https://your-actual-domain.vercel.app"
  }
}
```
