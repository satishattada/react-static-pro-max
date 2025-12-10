# Testing Guide for react-static-pro-max

This guide explains how to test the built package before publishing to production.

## 1. Test the Static Build (Production Output)

### Serve the built files locally:

```bash
cd my-react-static-app
npm run build
npx serve dist -p 3000 -s
```

**Open in browser:** http://localhost:3000

### What to test:
- ✅ Homepage loads correctly
- ✅ Navigation works (Home, About, Blog, Dynamic)
- ✅ Static routes render with SSR content
- ✅ Dynamic routes work
- ✅ Blog posts load correctly
- ✅ 404 page works (try http://localhost:3000/non-existent)
- ✅ Assets load (logo, CSS, JS bundles)
- ✅ Client-side hydration works
- ✅ Check browser console for errors

## 2. Test the Package in Another Project

### Option A: Using npm link (Already done)

```bash
# In react-static-pro-max directory
npm run build
npm link

# In another project
npm link react-static-pro-max
```

### Option B: Using local file path

```bash
# In another project's package.json
{
  "dependencies": {
    "react-static-pro-max": "file:../react-static-pro-max"
  }
}

npm install
```

### Option C: Using npm pack (Simulate real publish)

```bash
# In react-static-pro-max directory
npm run build
npm pack

# This creates react-static-pro-max-2.0.14.tgz

# In another project
npm install /path/to/react-static-pro-max-2.0.14.tgz
```

## 3. Create a Fresh Test App

```bash
# Create new test app
cd /tmp
mkdir test-app
cd test-app

# Install from local package
npm init -y
npm install /path/to/react-static-pro-max

# Or use npx to create from template
npx react-static-pro-max create
```

## 4. Verify Build Output

### Check generated files:

```bash
cd my-react-static-app
npm run build

# Verify dist directory structure
ls -la dist/

# Check HTML files have content
cat dist/index.html
cat dist/about/index.html

# Check JavaScript bundles
ls -lh dist/static/js/

# Check artifacts (SSR bundle)
ls -lh artifacts/
```

### Expected output:
- `dist/` - Static site files ready for deployment
- `dist/index.html` - Homepage with SSR content
- `dist/static/js/` - JavaScript bundles
- `dist/static/css/` - CSS bundles
- `artifacts/static-app.js` - SSR bundle (~106KB with externals)
- `sitemap.xml` - Generated sitemap

## 5. Test Different Commands

```bash
# Development server
npm start

# Staging build
npm run stage

# Production build
npm run build

# Bundle analyzer
npm run bundle -- --analyze

# Export only (skip build)
npm run export
```

## 6. Performance Testing

### Check bundle sizes:

```bash
cd my-react-static-app/dist
du -sh .
du -sh static/js/*
```

### Expected sizes:
- Main bundle: ~24KB
- Vendor bundle: ~337KB
- Runtime: ~1.8KB
- Total dist: ~400-500KB

### Test loading speed:
- Use Chrome DevTools Network tab
- Check Lighthouse scores
- Verify SSR content loads immediately

## 7. Verify SSR Functionality

### Check server-rendered HTML:

```bash
# View raw HTML (should contain content, not just <div id="root"></div>)
curl http://localhost:3000 | grep -A 10 "root"
```

Should see navigation and content in the HTML, not just empty div.

### Disable JavaScript and test:
1. Open Chrome DevTools
2. Settings → Disable JavaScript
3. Reload page
4. Should see content (SSR working!)

## 8. Test in Different Environments

### Node versions:
```bash
# Test with different Node versions using nvm
nvm use 18
npm run build

nvm use 20
npm run build
```

### Operating systems:
- ✅ macOS (current)
- ✅ Linux
- ✅ Windows

## 9. Deployment Testing

### Test with popular hosts:

#### Netlify:
```bash
cd my-react-static-app
npm run build
npx netlify-cli deploy --dir=dist --prod
```

#### Vercel:
```bash
npm run build
npx vercel --prod
```

#### GitHub Pages:
```bash
npm run build
# Copy dist/ to gh-pages branch
```

#### AWS S3:
```bash
npm run build
aws s3 sync dist/ s3://your-bucket/
```

## 10. Automated Testing

### Add test scripts to package.json:

```json
{
  "scripts": {
    "test:build": "npm run build && ls -la dist/index.html",
    "test:serve": "npm run build && serve dist -p 3000",
    "test:size": "npm run build && du -sh dist/",
    "test:html": "npm run build && grep -q 'nav' dist/index.html && echo 'SSR OK' || echo 'SSR FAILED'"
  }
}
```

## 11. Pre-Publish Checklist

Before publishing to npm:

- [ ] All tests pass
- [ ] Build completes without errors
- [ ] SSR generates HTML with content
- [ ] Navigation works in production build
- [ ] No console errors in browser
- [ ] Bundle sizes are reasonable
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Version number is bumped
- [ ] Git tag is created

## 12. Publish to npm

```bash
# Make sure you're logged in
npm login

# Dry run to see what will be published
npm publish --dry-run

# Publish to npm
npm publish

# Or publish with tag
npm publish --tag beta
```

## Common Issues and Solutions

### Issue: "Template not found" during SSR
**Solution:** This is a warning, not an error. The build still completes successfully.

### Issue: Bundle size too large
**Solution:** Check webpack-bundle-analyzer output, ensure tree-shaking is working

### Issue: SSR not working
**Solution:** Check that index.tsx exports the App component as default

### Issue: Hydration errors
**Solution:** Ensure SSR and client render the same content

## Monitoring After Publish

```bash
# Check package on npm
npm view react-static-pro-max

# Test installation
npm install react-static-pro-max

# Check downloads
npm info react-static-pro-max
```

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [React Static Pro Max GitHub](https://github.com/satishattada/react-static-pro-max)
- [Deployment Guide](./docs/deployment.md)
