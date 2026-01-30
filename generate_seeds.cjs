const fs = require('fs');
const path = require('path');

// Configuration
const COUNTS = {
    simple: 250,
    advanced: 250,
    expert: 250
};

// Utilities
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// LTR Calculator
const calculateLTR = (numbers, ops) => {
    let result = numbers[0];
    for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        const nextNum = numbers[i + 1];
        switch (op) {
            case '+': result += nextNum; break;
            case '-': result -= nextNum; break;
            case '*': result *= nextNum; break;
            case '/':
                if (nextNum === 0 || result % nextNum !== 0) return null;
                result /= nextNum;
                break;
        }
    }
    return result;
};

// Smart Op Generator
// Tries to pick from allowedOps. If division chosen and invalid, falls back to others.
const generateValidOps = (numbers, allowedOps) => {
    const ops = [];
    let current = numbers[0];
    for (let i = 0; i < numbers.length - 1; i++) {
        const nextNum = numbers[i + 1];
        let op = randItem(allowedOps);

        // Retry op selection if invalid
        let tries = 0;
        while (tries < 10) {
            let valid = true;
            if (op === '/') {
                if (nextNum === 0 || current % nextNum !== 0) valid = false;
            }
            // Also avoid result becoming too huge or negative if desired? 
            // Let's accept negatives, but maybe limit distinct sizes? 
            // Let's just focus on integer validity.

            if (valid) break;

            // Pick another op
            op = randItem(allowedOps.filter(o => o !== '/')); // Fallback to safe ops
            tries++;
        }

        // Update current
        switch (op) {
            case '+': current += nextNum; break;
            case '-': current -= nextNum; break;
            case '*': current *= nextNum; break;
            case '/': current /= nextNum; break;
        }
        ops.push(op);
    }
    return { ops, result: current };
}

function generateGrid(rows, cols, allowedOps) {
    let attempts = 0;
    while (true) {
        attempts++;
        const m = Array(rows).fill(0).map(() => Array(cols).fill(0));
        const oh = Array(rows).fill(0).map(() => []);
        const ov = Array(cols).fill(0).map(() => []);

        // 1. Fill internal numbers (0..rows-2, 0..cols-2)
        for (let r = 0; r < rows - 1; r++) {
            for (let c = 0; c < cols - 1; c++) {
                m[r][c] = randInt(1, 12); // Smaller numbers to keep results manageable
            }
        }

        // 2. Generate Horizontal Ops & Results for top rows
        let validRows = true;
        for (let r = 0; r < rows - 1; r++) {
            const numbers = [];
            for (let c = 0; c < cols - 1; c++) numbers.push(m[r][c]);
            const { ops, result } = generateValidOps(numbers, allowedOps);

            if (Math.abs(result) > 999) { validRows = false; break; } // limit size

            oh[r] = ops;
            m[r][cols - 1] = result;
        }
        if (!validRows) continue;

        // 3. Generate Vertical Ops & Results for left cols
        let validCols = true;
        for (let c = 0; c < cols - 1; c++) {
            const numbers = [];
            for (let r = 0; r < rows - 1; r++) numbers.push(m[r][c]);
            const { ops, result } = generateValidOps(numbers, allowedOps);

            if (Math.abs(result) > 999) { validCols = false; break; }

            ov[c] = ops;
            m[rows - 1][c] = result;
        }
        if (!validCols) continue;

        // 4. THE CROSSING (m[rows-1][cols-1])
        // Now we have the last row (numbers) and last col (numbers).
        // We need to generate operators for them that match the same result.

        // Last Row Check
        const lastRowNums = [];
        for (let c = 0; c < cols - 1; c++) lastRowNums.push(m[rows - 1][c]);
        const resRowData = generateValidOps(lastRowNums, allowedOps);
        oh[rows - 1] = resRowData.ops;
        const finalViaRow = resRowData.result;

        // Last Col Check
        const lastColNums = [];
        for (let r = 0; r < rows - 1; r++) lastColNums.push(m[r][cols - 1]);
        const resColData = generateValidOps(lastColNums, allowedOps);
        ov[cols - 1] = resColData.ops;
        const finalViaCol = resColData.result;

        // CRITICAL CHECK
        if (finalViaRow === finalViaCol) {
            m[rows - 1][cols - 1] = finalViaRow;
            return { m, oh, ov };
        }

        // If fail, we just retry the whole grid. 
        // Since step 1-3 are super fast now (guaranteed valid), we cycle quickly to find a crossing match.
    }
}

// Generate All
const simple = [];
const advanced = [];
const expert = [];

console.log('Generating Simple...');
for (let i = 0; i < COUNTS.simple; i++) simple.push(generateGrid(3, 4, ['+', '-', '*', '/']));

console.log('Generating Advanced...');
for (let i = 0; i < COUNTS.advanced; i++) advanced.push(generateGrid(4, 6, ['+', '-', '*']));

console.log('Generating Expert...');
for (let i = 0; i < COUNTS.expert; i++) expert.push(generateGrid(5, 6, ['+', '-', '*', '/'])); // Division included

// Write Output
const content = `
export const simpleSeeds = ${JSON.stringify(simple)};
export const advancedSeeds = ${JSON.stringify(advanced)};
export const expertSeeds = ${JSON.stringify(expert)};
`;

fs.writeFileSync(path.join(__dirname, 'src/lib/seeds.ts'), content);
console.log('Seeds generated successfully!');
