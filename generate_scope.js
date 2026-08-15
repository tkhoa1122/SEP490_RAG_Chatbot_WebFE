const fs = require('fs');

const lines = fs.readFileSync('test statistic.txt', 'utf8').split('\n');

const getFeatureAndRole = (index, functionName) => {
    let feature = '';
    let role = '';

    if (index >= 1 && index <= 9) {
        feature = 'Authentication & Profile Management';
        if ([1, 2, 4, 7].includes(index)) role = 'All Authenticated Users';
        else if ([3, 6, 8, 9].includes(index)) role = 'Guest';
        else if (index === 5) role = 'System';
    } else if (index >= 10 && index <= 19) {
        feature = 'System Administration';
        role = 'System Admin';
    } else if (index >= 20 && index <= 25) {
        feature = 'Platform Management & Reporting';
        role = 'System Admin';
    } else if (index >= 26 && index <= 29) {
        feature = 'Knowledge Base Management';
        role = 'Business Owner, Catalog Staff';
    } else if (index >= 30 && index <= 33) {
        feature = 'Chatbot Configuration';
        role = 'Business Owner';
    } else if (index >= 34 && index <= 36) {
        feature = 'API Key Management';
        role = 'Business Owner';
    } else if (index >= 37 && index <= 42) {
        feature = 'Billing & Analytics';
        role = 'Business Owner';
    } else if (index >= 43 && index <= 45) {
        feature = 'Team Management';
        role = 'Business Owner';
    } else if (index >= 46 && index <= 52) {
        feature = 'Catalog & Product Management';
        role = 'Catalog Staff';
    } else if (index >= 53 && index <= 62) {
        feature = 'Chatbot End-user Experience';
        role = 'Buyer (Customer)';
    } else if (index === 63) {
        feature = 'Payment Processing';
        role = 'System (Webhook)';
    }

    return { feature, role };
};

let md = '# Scope of Testing\n\n';
md += '| Feature | Function | Role | Description |\n';
md += '| :--- | :--- | :--- | :--- |\n';

for (let i = 1; i <= 63; i++) {
    if (i >= lines.length) break;
    const parts = lines[i].split('\t');
    if (parts.length >= 4) {
        const functionName = parts[1].trim();
        const description = parts[3].trim();
        const { feature, role } = getFeatureAndRole(i, functionName);
        md += `| ${feature} | ${functionName} | ${role} | ${description} |\n`;
    }
}

const outPath = 'C:/Users/ACER/.gemini/antigravity-ide/brain/8585b3ca-39c4-4283-ab14-e1c4e2b69fa2/scope_of_testing.md';
fs.writeFileSync(outPath, md);
console.log('Saved to', outPath);
