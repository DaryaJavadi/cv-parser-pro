const fs = require('fs');

// Read server.js
let content = fs.readFileSync('server.js', 'utf8');

// Fix the broken extractLinksWithPython function
const brokenFunction = `// Enhanced Python-based link extraction

            try {
                const result = JSON.parse(output.trim());
                console.log(\`✅ Python extraction result:\`, result);
                resolve(result);
            } catch (parseError) {
                console.error(\`❌ Failed to parse Python output:\`, parseError.message);
                console.error(\`Raw output: \${output}\`);
                resolve({ linkedin: null, github: null, error: 'Failed to parse Python output' });
            }
        });

        pythonProcess.on('error', (error) => {
            console.error(\`❌ Python process error:\`, error.message);
            resolve({ linkedin: null, github: null, error: error.message });
        });
    });
}`;

const fixedFunction = `// Enhanced Python-based link extraction
async function extractLinksWithPython(filePath) {
    return new Promise((resolve, reject) => {
        console.log(\`🐍 Running Python link extraction on: \${filePath}\`);
        
        const pythonProcess = spawn('python', [
            path.join(__dirname, 'link_extractor.py'),
            filePath
        ]);

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(\`❌ Python script failed with code \${code}\`);
                console.error(\`Error output: \${errorOutput}\`);
                resolve({ linkedin: null, github: null, error: errorOutput });
                return;
            }

            try {
                const result = JSON.parse(output.trim());
                console.log(\`✅ Python extraction result:\`, result);
                resolve(result);
            } catch (parseError) {
                console.error(\`❌ Failed to parse Python output:\`, parseError.message);
                console.error(\`Raw output: \${output}\`);
                resolve({ linkedin: null, github: null, error: 'Failed to parse Python output' });
            }
        });

        pythonProcess.on('error', (error) => {
            console.error(\`❌ Python process error:\`, error.message);
            resolve({ linkedin: null, github: null, error: error.message });
        });
    });
}`;

// Replace the broken function
content = content.replace(brokenFunction, fixedFunction);

// Write back to server.js
fs.writeFileSync('server.js', content);

console.log('✅ Fixed syntax error in server.js');
console.log('🚀 Server should now start without errors');
