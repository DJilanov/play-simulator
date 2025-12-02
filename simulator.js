const { mouse, left, right, Button, keyboard, Key } = require('@nut-tree-fork/nut-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Setup ESC key handler
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}

process.stdin.on('keypress', (str, key) => {
    if (key && key.name === 'escape') {
        console.log('\n\n🛑 ESC key pressed - Stopping simulator...');
        process.exit(0);
    }
    if (key && key.ctrl && key.name === 'c') {
        console.log('\n\n🛑 Ctrl+C pressed - Stopping simulator...');
        process.exit(0);
    }
});

// Configuration
const TYPING_SPEED_MIN = 50;  // Minimum delay between keystrokes (ms)
const TYPING_SPEED_MAX = 150; // Maximum delay between keystrokes (ms)
const MOUSE_INACCURACY = 5;   // Random offset range for human-like movements (pixels)
const MOUSE_MOVE_STEPS = 10;  // Number of intermediate steps for smooth movement

/**
 * Sleep function for delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get random delay for realistic typing
 */
function getRandomDelay() {
    return Math.floor(Math.random() * (TYPING_SPEED_MAX - TYPING_SPEED_MIN + 1)) + TYPING_SPEED_MIN;
}

/**
 * Get random offset for human-like inaccuracy
 */
function getRandomOffset() {
    return Math.floor(Math.random() * (MOUSE_INACCURACY * 2 + 1)) - MOUSE_INACCURACY;
}

/**
 * Get random offset within a custom range
 */
function getRandomOffsetRange(range) {
    return Math.floor(Math.random() * (range * 2 + 1)) - range;
}

/**
 * Move mouse to coordinates without clicking (with human-like movement)
 */
async function moveMouse(x, y, humanLike = true) {
    // Add small random offset for human-like inaccuracy
    const targetX = humanLike ? x + getRandomOffset() : x;
    const targetY = humanLike ? y + getRandomOffset() : y;

    console.log(`Moving mouse to (${x}, ${y})...`);

    if (humanLike) {
        // Get current position
        const start = await mouse.getPosition();

        // Move in steps for more natural movement
        for (let step = 1; step <= MOUSE_MOVE_STEPS; step++) {
            const progress = step / MOUSE_MOVE_STEPS;

            // Ease-in-out function for more natural acceleration/deceleration
            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const currentX = Math.round(start.x + (targetX - start.x) * eased);
            const currentY = Math.round(start.y + (targetY - start.y) * eased);

            await mouse.setPosition({ x: currentX, y: currentY });
            await sleep(10); // Small delay between steps
        }
    } else {
        // Precise movement without steps
        await mouse.setPosition({ x: targetX, y: targetY });
    }

    await sleep(100); // Small delay after movement
}

/**
 * Move mouse smoothly to coordinates and click
 */
async function moveAndClick(x, y, humanLike = true) {
    await moveMouse(x, y, humanLike);
    console.log(`Clicking at (${x}, ${y})...`);
    await mouse.click(Button.LEFT);
    await sleep(300); // Small delay after click
}

/**
 * Click at current position
 */
async function clickAt(button = Button.LEFT) {
    await mouse.click(button);
    await sleep(300);
}

/**
 * Double click at current position
 */
async function doubleClickAt(button = Button.LEFT) {
    await mouse.doubleClick(button);
    await sleep(300);
}

/**
 * Get current mouse position
 */
async function getMousePosition() {
    return await mouse.getPosition();
}

/**
 * Type text character by character with realistic timing
 */
async function typeText(text) {
    console.log('Starting to type text...');
    console.log(`Total characters: ${text.length}`);

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        // Handle special characters
        if (char === '\n') {
            console.log('\\n - New line');
            await keyboard.type(Key.Enter);
        } else if (char === '\t') {
            console.log('\\t - Tab');
            await keyboard.type(Key.Tab);
        } else {
            // Type regular character
            await keyboard.type(char);
        }

        // Random delay between keystrokes for realistic typing
        const delay = getRandomDelay();
        await sleep(delay);

        // Progress indicator every 50 characters
        if ((i + 1) % 50 === 0) {
            console.log(`Typed ${i + 1}/${text.length} characters...`);
        }
    }

    console.log('Finished typing!');
}

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('=== Mouse & Keyboard Simulator (Infinite Loop Mode) ===\n');

        // Read text file
        const textFilePath = path.join(__dirname, 'input.txt');
        console.log(`Reading text from: ${textFilePath}`);

        if (!fs.existsSync(textFilePath)) {
            console.error(`Error: input.txt not found at ${textFilePath}`);
            console.log('Please create an input.txt file with the text you want to type.');
            process.exit(1);
        }

        const textToType = fs.readFileSync(textFilePath, 'utf8');
        console.log(`Loaded ${textToType.length} characters from file.\n`);

        // Give user time to focus the target window
        console.log('Starting in 30 seconds... Please focus the target window!');
        console.log('⚠️  Press ESC to stop the simulator at any time');
        for (let i = 30; i > 0; i--) {
            console.log(`${i}...`);
            await sleep(1000);
        }
        console.log('Starting now!\n');

        // Infinite loop
        let cycleNumber = 1;
        const startY = 400;  // Starting Y position
        const yOffset = 50;  // Pixels to move down each cycle

        while (true) {
            console.log(`\n${'='.repeat(50)}`);
            console.log(`🔄 Cycle ${cycleNumber} - Starting...`);
            console.log('='.repeat(50));

            // Calculate Y position for this cycle (moves down 50px each time)
            const currentY = startY + (cycleNumber - 1) * yOffset;
            console.log(`Target Y position: ${currentY} (offset: ${(cycleNumber - 1) * yOffset}px from start)`);

            // Step 1: Move to initial position and click
            console.log(`Clicking row at position (200, ${currentY})...`);
            await moveAndClick(200, currentY);

            // Step 2: Click near (400, 400) with ±20px variation for more human-like behavior
            const clickX = 600 + getRandomOffsetRange(20);
            const clickY = 600 + getRandomOffsetRange(20);
            console.log(`Clicking file at position (~600, ~600) -> actual: (${clickX}, ${clickY})...`);
            await moveAndClick(clickX, clickY);

            // Step 3: Type the text from file
         
         
            await typeText(textToType);

            console.log(`\n✅ Cycle ${cycleNumber} complete!`);
            console.log('Waiting 2 seconds before next cycle...\n');
            await sleep(2000);

            cycleNumber++;
        }

    } catch (error) {
        console.error('Error during simulation:', error);
        process.exit(1);
    }
}

// Export functions for use in other scripts
module.exports = {
    sleep,
    moveMouse,
    moveAndClick,
    clickAt,
    doubleClickAt,
    getMousePosition,
    typeText,
    getRandomOffsetRange,
    Button,
    Key,
    // Export configuration constants
    MOUSE_INACCURACY,
    MOUSE_MOVE_STEPS
};

// Run the simulator only if this file is executed directly
if (require.main === module) {
    main();
}
