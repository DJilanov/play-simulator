// Import shared functions from simulator
const {
    sleep,
    moveMouse,
    moveAndClick,
    clickAt,
    doubleClickAt,
    getMousePosition,
    Button,
    MOUSE_INACCURACY,
    MOUSE_MOVE_STEPS
} = require('./simulator');

/**
 * Move mouse to position with description, human-like movement, and automatic click
 */
async function moveAndClickWithDelay(x, y, description) {
    if (description) {
        console.log(description);
    }
    await moveAndClick(x, y, true); // true = human-like movement
    await sleep(300); // Extra delay to see the result
}

/**
 * Draw a square pattern with mouse (with clicks at each corner)
 */
async function drawSquare(startX, startY, size) {
    console.log(`\n📐 Drawing ${size}x${size} square starting at (${startX}, ${startY})`);
    console.log(`   (Using ±${MOUSE_INACCURACY}px human-like inaccuracy with ${MOUSE_MOVE_STEPS} movement steps)`);

    // Top-left
    await moveAndClickWithDelay(startX, startY, '  Corner 1 (Top-Left)');

    // Top-right
    await moveAndClickWithDelay(startX + size, startY, '  Corner 2 (Top-Right)');

    // Bottom-right
    await moveAndClickWithDelay(startX + size, startY + size, '  Corner 3 (Bottom-Right)');

    // Bottom-left
    await moveAndClickWithDelay(startX, startY + size, '  Corner 4 (Bottom-Left)');

    // Back to start
    await moveAndClickWithDelay(startX, startY, '  Back to start');
}

/**
 * Move mouse in a diagonal pattern (with clicks)
 */
async function diagonalMovements() {
    console.log('\n↗️ Diagonal movements with human-like inaccuracies');

    await moveAndClickWithDelay(100, 100, '  Top-left');
    await moveAndClickWithDelay(500, 500, '  Center');
    await moveAndClickWithDelay(900, 100, '  Top-right');
    await moveAndClickWithDelay(500, 500, '  Center');
    await moveAndClickWithDelay(100, 900, '  Bottom-left');
    await moveAndClickWithDelay(500, 500, '  Center');
    await moveAndClickWithDelay(900, 900, '  Bottom-right');
    await moveAndClickWithDelay(500, 500, '  Center');
}

/**
 * Test different click types
 */
async function testClicks(x, y) {
    console.log(`\n🖱️  Testing different click types near (${x}, ${y})`);

    console.log('  → Moving and left clicking');
    await moveAndClick(x, y, true);
    await sleep(300);

    console.log('  → Moving and double clicking');
    await moveMouse(x + 50, y, true);
    await doubleClickAt(Button.LEFT);
    await sleep(300);

    console.log('  → Moving and right clicking');
    await moveAndClick(x + 100, y, true);
    await clickAt(Button.RIGHT);
    await sleep(300);
}

/**
 * Show current mouse position
 */
async function showCurrentPosition() {
    const position = await getMousePosition();
    console.log(`Current mouse position: (${position.x}, ${position.y})`);
}

/**
 * Main test function
 */
async function main() {
    try {
        console.log('╔═══════════════════════════════════════╗');
        console.log('║   Mouse Movement Test Script         ║');
        console.log('║   (Infinite Loop Mode)               ║');
        console.log('╚═══════════════════════════════════════╝\n');

        // Show current position
        await showCurrentPosition();

        // Countdown
        console.log('\nStarting tests in 3 seconds...');
        console.log('⚠️  This will run FOREVER until you stop it (Ctrl+C)');
        for (let i = 3; i > 0; i--) {
            console.log(`${i}...`);
            await sleep(1000);
        }
        console.log('🚀 Starting!\n');

        // Infinite loop
        let cycleNumber = 1;
        while (true) {
            console.log(`\n${'='.repeat(50)}`);
            console.log(`🔄 Cycle ${cycleNumber}`);
            console.log('='.repeat(50));

            // Test 1: Simple movements with clicks
            console.log('\n📍 Test 1: Basic movements with human-like behavior');
            console.log(`   Each movement has ±${MOUSE_INACCURACY}px random offset and smooth ${MOUSE_MOVE_STEPS}-step animation`);
            await moveAndClickWithDelay(200, 200, '  Position 1 → Click');
            await moveAndClickWithDelay(600, 200, '  Position 2 → Click');
            await moveAndClickWithDelay(600, 600, '  Position 3 → Click');
            await moveAndClickWithDelay(200, 600, '  Position 4 → Click');

            // Test 2: Square pattern
            await drawSquare(300, 300, 200);

            // Test 3: Diagonal movements
            await diagonalMovements();

            // Test 4: Click tests
            await testClicks(500, 400);

            // Show final position
            console.log('\n');
            await showCurrentPosition();

            console.log(`\n✅ Cycle ${cycleNumber} complete!`);
            console.log('Waiting 2 seconds before next cycle...\n');
            await sleep(2000);

            cycleNumber++;
        }

    } catch (error) {
        console.error('❌ Error during mouse tests:', error);
        process.exit(1);
    }
}

// Run the tests
main();
