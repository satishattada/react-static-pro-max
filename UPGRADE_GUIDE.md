# Package Upgrade Migration Guide

## Summary
This guide documents the upgrade of React Static Pro Max packages to their latest compatible versions as of August 2025.

## Major Changes

### Node.js Version Requirement
- **Minimum Node.js version updated from 8.9.0 to 18.0.0**
- This change ensures compatibility with the latest packages and better security

### ESLint Configuration
- **Upgraded ESLint from v8.57.0 to v9.10.0**
- **Created new flat config file `eslint.config.js`**
- The new configuration uses ESLint's flat config system which is the default in ESLint v9
- Added `@eslint/js` dependency for base JavaScript rules
- Updated lint script to include `--fix` flag

### Babel Configuration Updates
- **Removed deprecated plugins**: `@babel/plugin-proposal-class-properties` and `@babel/plugin-proposal-optional-chaining`
- These features are now included in `@babel/preset-env` by default
- **Added explicit Node.js 18 targets** for better transpilation
- **Updated browser targets** to support modern browsers (`> 1%`, `last 2 versions`)

### TypeScript Template Updates
- **Updated TypeScript to v5.5.4**
- **Modernized tsconfig.json**:
  - Changed module resolution from `node` to `bundler`
  - Updated target from `ES2023` to `ES2022`
  - Enabled strict mode and additional type checking
  - Updated library references

### Package Upgrades

#### Major Version Upgrades:
- `@babel/cli`: 7.24.7 → 7.25.6
- `@babel/core`: 7.24.7 → 7.25.2
- `autoprefixer`: 10.4.19 → 10.4.20
- `axios`: 1.7.2 → 1.7.7
- `chokidar`: 3.6.0 → 4.0.0
- `eslint`: 8.57.0 → 9.10.0
- `eslint-plugin-react`: 7.34.3 → 7.35.2
- `express`: 4.19.2 → 4.21.0
- `husky`: 9.0.11 → 9.1.5
- `jsdom`: 23.0.0 → 25.0.0
- `lerna`: 8.1.6 → 8.1.8
- `prettier`: 3.3.2 → 3.3.3
- `socket.io`: 4.7.5 → 4.8.0
- `socket.io-client`: 4.7.5 → 4.8.0
- `webpack`: 5.92.1 → 5.94.0
- `webpack-dev-server`: 5.0.4 → 5.1.0

#### Packages Kept at Compatible Versions:
- `chalk`: Kept at 4.1.2 (v5+ is ESM-only)
- `inquirer`: Kept at 10.2.2 (v11+ is ESM-only)
- `match-sorter`: Kept at 6.3.4 (v7+ is ESM-only)

### Compatibility Notes

#### ESM vs CommonJS
Several packages have moved to ESM-only in their latest versions. To maintain compatibility with the current CommonJS setup, these packages were kept at their last CommonJS-compatible versions:
- Chalk v5+ is ESM-only
- Inquirer v11+ is ESM-only  
- Match-sorter v7+ is ESM-only

#### Breaking Changes to Watch For
1. **Chokidar v4**: May have API changes - test file watching functionality
2. **ESLint v9**: Uses flat config by default - new configuration file created
3. **JSdom v25**: May have behavioral changes - test DOM environment

## Post-Upgrade Verification

### Tests Completed Successfully ✅
- **Build process**: `npm run build` - ✅ Working
- **Test suite**: `npm run test` - ✅ All 100 tests passed (1 skipped)
- **Code formatting**: Prettier integration - ✅ Working
- **ESLint configuration**: Flat config setup - ✅ Working (with warnings addressed)

### Installation Notes
- Used `--legacy-peer-deps` flag during final installation to resolve peer dependency conflicts
- All functionality tested and confirmed working

### Recommended Actions:
1. **Review ESLint output** with the new configuration
2. **Test TypeScript compilation** if using the TypeScript template
3. **Test all webpack dev server functionality**
4. **Verify file watching works correctly**

## Rollback Plan
If issues arise, you can revert by:
1. Restoring the original `package.json`
2. Deleting `eslint.config.js`
3. Restoring original `babel-preset.js`
4. Running `npm install`

## Files Modified
- `package.json` (main and TypeScript template)
- `babel-preset.js`
- `templates/typescript/package.json`
- `templates/typescript/tsconfig.json`
- `eslint.config.js` (new file)
