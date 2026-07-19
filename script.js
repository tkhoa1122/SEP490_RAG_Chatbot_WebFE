const fs = require('fs');
const path = require('path');

const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
const apiDir = path.join(__dirname, 'src', 'infrastructure', 'api');
const uiDirs = [path.join(__dirname, 'src', 'app'), path.join(__dirname, 'src', 'components')];

const backendEndpoints = [];
for (const [apiPath, methods] of Object.entries(swagger.paths)) {
    for (const [method, details] of Object.entries(methods)) {
        backendEndpoints.push({ path: apiPath, method: method.toUpperCase(), tags: details.tags?.join(', ') || '' });
    }
}

const apiFiles = fs.readdirSync(apiDir).filter(f => f.endsWith('.ts'));

const report = [];
report.push('# Detailed API Mapping Report (Backend -> UI Components)');
report.push('');

function searchInUi(query) {
    let found = [];
    function search(dir) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const f of files) {
            const fullPath = path.join(dir, f);
            if (fs.statSync(fullPath).isDirectory()) {
                search(fullPath);
            } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes(query)) {
                    found.push(fullPath.replace(__dirname, ''));
                }
            }
        }
    }
    uiDirs.forEach(search);
    return found;
}

const missingUI = [];
const missingCompletely = [];
const implemented = [];

backendEndpoints.forEach(ep => {
    let searchPath = ep.path.replace('/api/v1', '');
    if (searchPath === '') searchPath = '/';
    
    let foundApiFile = null;
    for (const f of apiFiles) {
        const content = fs.readFileSync(path.join(apiDir, f), 'utf8');
        const strippedPath = searchPath.split('/{')[0];
        if (content.includes(`"${strippedPath}"`) || content.includes(`\`${strippedPath}`) || content.includes(`'${strippedPath}'`) || content.includes(`"${searchPath}"`)) {
            foundApiFile = f;
            break;
        }
    }

    if (!foundApiFile) {
        missingCompletely.push(`- 🔴 **MISSING COMPLETELY**: \`${ep.method} ${ep.path}\` - No API wrapper in frontend.`);
    } else {
        const apiContent = fs.readFileSync(path.join(apiDir, foundApiFile), 'utf8');
        const exportMatch = apiContent.match(/export const (\w+API) =/);
        const apiObjectName = exportMatch ? exportMatch[1] : foundApiFile.replace('.ts', '');
        
        const usages = searchInUi(apiObjectName);
        if (usages.length === 0) {
             missingUI.push(`- 🟡 **MISSING UI**: \`${ep.method} ${ep.path}\` - Wrapper exists (\`${apiObjectName}\`), but NEVER used in UI.`);
        } else {
             const uniqueUsages = [...new Set(usages)];
             implemented.push(`- ✅ **IMPLEMENTED**: \`${ep.method} ${ep.path}\` - Used in ${uniqueUsages.length} UI files (e.g., \`${uniqueUsages[0]}\`).`);
        }
    }
});

report.push('## 1. Missing Completely (No API wrapper in frontend)');
report.push(...missingCompletely);
report.push('');
report.push('## 2. Missing UI (API wrapper exists, but UI does not use it)');
report.push(...missingUI);
report.push('');
report.push('## 3. Implemented (API wrapper exists and used in UI)');
report.push(...implemented);

fs.writeFileSync('api_audit_report.md', report.join('\n'));
console.log('Report generated!');
