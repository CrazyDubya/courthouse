// Debug script to find which sample arguments are missing legal terms
const fs = require('fs');

// Read the motionTemplates file
const content = fs.readFileSync('./src/data/motionTemplates.ts', 'utf8');

// Extract sample_argument lines
const sampleArguments = content.match(/sample_argument: '([^']+)'/g);

if (sampleArguments) {
  sampleArguments.forEach((match, index) => {
    const argument = match.replace("sample_argument: '", '').replace("'", '');
    
    const hasLegalTerms = argument.toLowerCase().includes('court') ||
                        argument.toLowerCase().includes('motion') ||
                        argument.toLowerCase().includes('defendant') ||
                        argument.toLowerCase().includes('plaintiff') ||
                        argument.toLowerCase().includes('evidence');
    
    if (!hasLegalTerms) {
      console.log(`Template ${index + 1} missing legal terms:`);
      console.log(`"${argument}"`);
      console.log('---');
    }
  });
}