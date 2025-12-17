const { mouse, left, right, Button, keyboard, Key } = require('@nut-tree-fork/nut-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

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
 * Handle pause with macOS app switching (Chrome refresh -> Slack -> Cursor)
 */
async function handleMacOSPause(pauseDuration) {
    try {
        console.log('🌐 Opening Google Chrome...');
        await execAsync('open -a "Google Chrome"');
        await sleep(1000);

        console.log('🔄 Refreshing Chrome page...');
        await execAsync('osascript -e \'tell application "Google Chrome" to activate\' -e \'tell application "System Events" to keystroke "r" using command down\'');
        await sleep(1000);

        console.log('💬 Opening Slack...');
        await execAsync('open -a "Slack"');
        await sleep(1000);

        console.log(`⏸️  Pausing in Slack for ${Math.round(pauseDuration / 1000)} seconds...`);
        await sleep(pauseDuration);

        console.log('💻 Returning to Cursor...');
        await execAsync('open -a "Cursor"');
        await sleep(1000);

        console.log('▶️  Resuming typing...\n');
    } catch (error) {
        console.error('Error during macOS app switching:', error.message);
        console.log('⚠️  Falling back to simple pause...');
        await sleep(pauseDuration);
        console.log('▶️  Resuming typing...\n');
    }
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
 * Scroll mouse wheel
 */
async function scrollMouseWheel(amount) {
    // Positive amount scrolls down, negative scrolls up
    const scrollAmount = amount > 0 ? -amount : Math.abs(amount);
    await mouse.scrollDown(Math.abs(scrollAmount));
    console.log(`🖱️  Scrolled ${Math.abs(scrollAmount)} pixels`);
    await sleep(200);
}

/**
 * Move mouse randomly without clicking
 */
async function moveMouseRandomly(range) {
    const currentPos = await mouse.getPosition();
    const offsetX = getRandomOffsetRange(range);
    const offsetY = getRandomOffsetRange(range);
    const newX = currentPos.x + offsetX;
    const newY = currentPos.y + offsetY;

    console.log(`🔀 Random mouse movement: (${offsetX}, ${offsetY}) pixels`);
    await moveMouse(newX, newY, true);
}

/**
 * Type text character by character with realistic timing, scrolling, and mouse movements
 */
async function typeText(text, sessionStartTime) {
    console.log('Starting to type text...');
    console.log(`Total characters: ${text.length}`);

    let rowCount = 0;
    let lastScrollRow = 0;
    let lastMouseMoveTime = Date.now();
    let lastPauseTime = sessionStartTime;

    const lines = text.split('\n');
    let charIndex = 0;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];

        // Type each character in the line
        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            // Check if it's time for a 20-minute pause (±2 min)
            const timeSinceLastPause = Date.now() - lastPauseTime;
            const pauseInterval = (20 * 60 * 1000) + getRandomOffsetRange(2 * 60 * 1000); // 20 min ± 2 min

            if (timeSinceLastPause >= pauseInterval) {
                const pauseDuration = (2 * 60 * 1000) + getRandomOffsetRange(30 * 1000); // 2 min ± 30 sec
                console.log(`\n⏸️  Taking a ${Math.round(pauseDuration / 1000)} second break...`);

                // Check if running on macOS
                if (process.platform === 'darwin') {
                    await handleMacOSPause(pauseDuration);
                } else {
                    await sleep(pauseDuration);
                    console.log('▶️  Resuming typing...\n');
                }

                lastPauseTime = Date.now();
                lastMouseMoveTime = Date.now(); // Reset mouse move timer after pause
            }

            // Check if it's time for random mouse movement (every 30 seconds)
            const timeSinceLastMove = Date.now() - lastMouseMoveTime;
            if (timeSinceLastMove >= 30000) { // 30 seconds
                const moveRange = 40 + getRandomOffsetRange(5); // 40 ± 5 pixels
                await moveMouseRandomly(moveRange);
                lastMouseMoveTime = Date.now();
            }

            // Type regular character
            if (char === '\t') {
                // Type 4 spaces instead of Tab key to ensure consistent indentation
                await keyboard.type('    '); // 4 spaces
            } else {
                await keyboard.type(char);
            }

            // Random delay between keystrokes for realistic typing
            const delay = getRandomDelay();
            await sleep(delay);

            charIndex++;

            // Progress indicator every 50 characters
            if (charIndex % 50 === 0) {
                console.log(`Typed ${charIndex}/${text.length} characters...`);
            }
        }

        // Press Enter for new line (except for last line)
        if (lineIndex < lines.length - 1) {
            await keyboard.type(Key.Enter);

            // Move to beginning of line to clear auto-indent
            await sleep(50);
            await keyboard.type(Key.LeftCmd, Key.Left); // Cmd+Left = go to start of line
            await sleep(50);

            rowCount++;
            charIndex++; // Count the newline character

            // Scroll every 10 rows (±1)
            const scrollInterval = 10 + getRandomOffsetRange(1);
            if (rowCount - lastScrollRow >= scrollInterval) {
                const scrollAmount = 50 + getRandomOffsetRange(5); // 50 ± 5 pixels
                await scrollMouseWheel(scrollAmount);
                lastScrollRow = rowCount;
            }

            // Random delay between keystrokes
            const delay = getRandomDelay();
            await sleep(delay);
        }
    }

    console.log('Finished typing!');
}

/**
 * Main execution function
 */
async function main() {
    try {
        
        // Read text file
        const textFilePath = path.join(__dirname, 'input.txt');

        if (!fs.existsSync(textFilePath)) {
            console.error(`Error: input.txt not found at ${textFilePath}`);
            console.log('Please create an input.txt file with the text you want to type.');
            process.exit(1);
        }

        const textToType = fs.readFileSync(textFilePath, 'utf8');

        // Give user time to focus the target window
        for (let i = 30; i > 0; i--) {
            console.log(`${i}...`);
            await sleep(1000);
        }
        console.log('Starting now!\n');

        // Infinite loop
        let cycleNumber = 1;
        const startY = 400;  // Starting Y position
        const yOffset = 50;  // Pixels to move down each cycle
        const sessionStartTime = Date.now();

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

            // Step 3: Type the text from file with human-like behaviors
            await typeText(textToType, sessionStartTime);

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
    scrollMouseWheel,
    moveMouseRandomly,
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
