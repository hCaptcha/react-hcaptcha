/**
 * @fileoverview Tests to verify ESM build output has correct .js extensions
 * 
 * These tests ensure that:
 * 1. All output files in dist/esm have .js extensions (not .jsx or .tsx)
 * 2. Import statements within the built files use .js extensions
 * 3. The babel-plugin-replace-import-extension is working correctly
 * 
 * Run after build: npm run build && npm test
 */

const fs = require('fs');
const path = require('path');

const ESM_DIST_PATH = path.resolve(__dirname, '../dist/esm');

function getAllFiles(dir, files = []) {
    if (!fs.existsSync(dir)) {
        return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            getAllFiles(fullPath, files);
        } else {
            files.push(fullPath);
        }
    }

    return files;
}

describe('ESM Build Output', () => {
    let allFiles;

    beforeAll(() => {
        if (!fs.existsSync(ESM_DIST_PATH)) {
            console.warn('Warning: dist/esm directory not found. Run `npm run build` first.');
        }
        allFiles = getAllFiles(ESM_DIST_PATH);
    });

    describe('File Extensions', () => {
        test('dist/esm directory should exist after build', () => {
            expect(fs.existsSync(ESM_DIST_PATH)).toBe(true);
        });

        test('should not contain any .jsx files', () => {
            const jsxFiles = allFiles.filter(file => file.endsWith('.jsx'));

            expect(jsxFiles).toEqual([]);
        });

        test('should not contain any .tsx files', () => {
            const tsxFiles = allFiles.filter(file => file.endsWith('.tsx'));

            expect(tsxFiles).toEqual([]);
        });

        test('should contain at least one .js file', () => {
            const jsFiles = allFiles.filter(file => file.endsWith('.js'));

            expect(jsFiles.length).toBeGreaterThan(0);
        });
    });

    describe('Import Statement Extensions', () => {
        test('import statements should not reference .jsx files', () => {
            const jsFiles = allFiles.filter(file => file.endsWith('.js'));
            const errors = [];

            for (const file of jsFiles) {
                const content = fs.readFileSync(file, 'utf8');
                const relativePath = path.relative(ESM_DIST_PATH, file);

                // Match import statements with .jsx extension
                const jsxImports = content.match(/from\s+['"][^'"]*\.jsx['"]/g);

                if (jsxImports) {
                    errors.push({
                        file: relativePath,
                        imports: jsxImports
                    });
                }

                const dynamicJsxImports = content.match(/import\s*\(\s*['"][^'"]*\.jsx['"]\s*\)/g);

                if (dynamicJsxImports) {
                    errors.push({
                        file: relativePath,
                        imports: dynamicJsxImports
                    });
                }
            }

            if (errors.length > 0) {
                const errorMsg = errors
                    .map(e => `${e.file}: ${e.imports.join(', ')}`)
                    .join('\n');
                fail(`Found .jsx imports in ESM build:\n${errorMsg}`);
            }

            expect(errors).toEqual([]);
        });

        test('import statements should not reference .tsx files', () => {
            const jsFiles = allFiles.filter(file => file.endsWith('.js'));
            const errors = [];

            for (const file of jsFiles) {
                const content = fs.readFileSync(file, 'utf8');
                const relativePath = path.relative(ESM_DIST_PATH, file);

                const tsxImports = content.match(/from\s+['"][^'"]*\.tsx['"]/g);

                if (tsxImports) {
                    errors.push({
                        file: relativePath,
                        imports: tsxImports
                    });
                }

                const dynamicTsxImports = content.match(/import\s*\(\s*['"][^'"]*\.tsx['"]\s*\)/g);

                if (dynamicTsxImports) {
                    errors.push({
                        file: relativePath,
                        imports: dynamicTsxImports
                    });
                }
            }

            if (errors.length > 0) {
                const errorMsg = errors
                    .map(e => `${e.file}: ${e.imports.join(', ')}`)
                    .join('\n');
                fail(`Found .tsx imports in ESM build:\n${errorMsg}`);
            }

            expect(errors).toEqual([]);
        });

        test('export statements should not reference .jsx or .tsx files', () => {
            const jsFiles = allFiles.filter(file => file.endsWith('.js'));
            const errors = [];

            for (const file of jsFiles) {
                const content = fs.readFileSync(file, 'utf8');
                const relativePath = path.relative(ESM_DIST_PATH, file);
                const badExports = content.match(/export\s+.*\s+from\s+['"][^'"]*\.(jsx|tsx)['"]/g);

                if (badExports) {
                    errors.push({
                        file: relativePath,
                        exports: badExports
                    });
                }
            }

            if (errors.length > 0) {
                const errorMsg = errors
                    .map(e => `${e.file}: ${e.exports.join(', ')}`)
                    .join('\n');
                fail(`Found .jsx/.tsx exports in ESM build:\n${errorMsg}`);
            }

            expect(errors).toEqual([]);
        });
    });

    describe('ESM Package Configuration', () => {
        test('dist/esm/package.json should exist with type: module', () => {
            const esmPackageJsonPath = path.join(ESM_DIST_PATH, 'package.json');

            expect(fs.existsSync(esmPackageJsonPath)).toBe(true);

            const packageJson = JSON.parse(fs.readFileSync(esmPackageJsonPath, 'utf8'));
            expect(packageJson.type).toBe('module');
        });
    });
});