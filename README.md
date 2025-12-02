# Mouse & Keyboard Simulator

A Node.js application that simulates mouse movements, clicks, and realistic keyboard input using system-level automation.

## Features

- **Mouse Control**: Moves mouse to specific coordinates and performs clicks
- **Realistic Typing**: Simulates human-like typing with random delays between keystrokes
- **File-based Input**: Reads text from a file and types it character by character
- **Special Characters**: Properly handles newlines, tabs, spaces, and punctuation
- **System-level Simulation**: Uses @nut-tree-fork/nut-js for real OS-level input that applications recognize

## Installation

```bash
npm install
```

Note: @nut-tree-fork/nut-js may require some additional dependencies:
- **macOS**: Should work out of the box (may need accessibility permissions)
- **Windows**: Should work out of the box
- **Linux**: May need `libxtst-dev` and X11 libraries

## Usage

1. Edit [input.txt](input.txt) with the text you want to type
2. Run the simulator:
   ```bash
   npm start
   ```
3. You'll have 5 seconds to focus the target window (e.g., text editor, terminal)
4. The simulator will:
   - Move mouse to (200, 200) and click
   - Move mouse to (600, 600) and click
   - Type the contents of input.txt with realistic timing

## Configuration

You can modify these constants in [simulator.js](simulator.js):

```javascript
const TYPING_SPEED_MIN = 50;  // Minimum delay between keystrokes (ms)
const TYPING_SPEED_MAX = 150; // Maximum delay between keystrokes (ms)
const MOUSE_MOVE_DURATION = 0.5; // Duration for smooth mouse movement
```

## How It Works

1. **Mouse Movement**: Uses `mouse.setPosition({ x, y })` to move the cursor to exact pixel coordinates
2. **Clicking**: Uses `mouse.click(Button.LEFT)` to perform left clicks
3. **Typing**: Uses `keyboard.type(char)` for regular characters and `keyboard.type(Key.Enter)` for special keys
4. **Timing**: Adds random delays between keystrokes (50-150ms) to simulate human typing

## Example

The included [input.txt](input.txt) demonstrates:
- Multiple lines with newline characters
- Proper spacing
- Punctuation marks
- Numbers

Feel free to replace it with any text you want to simulate typing!

## Safety Notes

⚠️ **Warning**: This tool has full control over your mouse and keyboard. Make sure you:
- Know what text you're typing
- Have a way to stop the script if needed (Ctrl+C in terminal)
- Are focused on the correct window
- Don't run it on sensitive applications without testing first

## Requirements

- Node.js 12 or higher
- Native build tools for robotjs compilation
- macOS, Windows, or Linux
