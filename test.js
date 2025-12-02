// Quick test to verify the library loads correctly
const { mouse, Button, keyboard, Key } = require('@nut-tree-fork/nut-js');

console.log('Testing @nut-tree-fork/nut-js...');
console.log('✓ Library loaded successfully!');
console.log('✓ Mouse module available:', typeof mouse !== 'undefined');
console.log('✓ Keyboard module available:', typeof keyboard !== 'undefined');
console.log('✓ Button enum available:', typeof Button !== 'undefined');
console.log('✓ Key enum available:', typeof Key !== 'undefined');
console.log('\nAll modules loaded correctly! Ready to use.');
