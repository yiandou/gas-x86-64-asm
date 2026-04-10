
# GAS-asm AT&T VSCode extension

A VSCode extension for GAS AT&T assembly.
Currently only has support for the x86_64/AMD64 architecture.

## Features

- Syntax highlighting: Highlights most common assembly instructions, registers, and directives.
- Register state tracking: Visualization of register values, flags, stack, and memory state.
- Dead code detection: Detects unreachable code after unconditional jumps and returns.
- Hover documentation: Documentation of instructions, registers, and syscalls on hover.

## Settings

Contributes the following settings:
- `gas-asm.performance.targetCPU`: Target CPU microarchitectue for instruction details
- `gas-asm.enableDeadCodeDetection`: Enable dead code detection warnings

## Known Issues

- Register state tracking uses symbolic execution for a fair amount of instructions, and may not be 100% accurate for more complex control flow.
- FPU stack tracking is only approximate.
- Memory and stack are not fully tracked.

## Release Notes

### 1.0.0
Initial release