import { DirectiveInfo } from "./types";

export const directiveDatabase: Map<string, DirectiveInfo> = new Map([
    // Section directives
    ['.text', { description: 'Begin executable code section', usage: '.text' }],
    ['.data', { description: 'Begin initialized data section', usage: '.data' }],
    ['.bss', { description: 'Begin uninitialized data section (zero-filled at load)', usage: '.bss' }],
    ['.rodata', { description: 'Begin read-only data section', usage: '.rodata' }],
    ['.section', { description: 'Define or switch to a section', usage: '.section name [, "flags"] [, @type]' }],

    // Symbol directives
    ['.globl', { description: 'Make symbol visible to linker (global)', usage: '.globl symbol_name' }],
    ['.global', { description: 'Make symbol visible to linker (alias for .globl)', usage: '.global symbol_name' }],
    ['.weak', { description: 'Declare weak symbol (can be overridden)', usage: '.weak symbol_name' }],
    ['.local', { description: 'Make symbol local (not visible to linker)', usage: '.local symbol_name' }],
    ['.type', { description: 'Set symbol type (@function, @object, etc.)', usage: '.type symbol_name, @type' }],
    ['.size', { description: 'Set symbol size', usage: '.size symbol_name, expression' }],
    ['.hidden', { description: 'Set hidden visibility for symbol', usage: '.hidden symbol_name' }],
    ['.protected', { description: 'Set protected visibility for symbol', usage: '.protected symbol_name' }],

    // Data definition directives
    ['.byte', { description: 'Allocate and initialize byte(s) (8-bit)', usage: '.byte value1 [, value2, ...]' }],
    ['.word', { description: 'Allocate and initialize word(s) (16-bit)', usage: '.word value1 [, value2, ...]' }],
    ['.short', { description: 'Allocate and initialize short(s) (16-bit, alias for .word)', usage: '.short value1 [, value2, ...]' }],
    ['.int', { description: 'Allocate and initialize int(s) (32-bit)', usage: '.int value1 [, value2, ...]' }],
    ['.long', { description: 'Allocate and initialize long(s) (32-bit)', usage: '.long value1 [, value2, ...]' }],
    ['.quad', { description: 'Allocate and initialize quadword(s) (64-bit)', usage: '.quad value1 [, value2, ...]' }],
    ['.octa', { description: 'Allocate and initialize octa(s) (128-bit)', usage: '.octa value1 [, value2, ...]' }],
    ['.float', { description: 'Allocate and initialize single-precision float(s)', usage: '.float value1 [, value2, ...]' }],
    ['.double', { description: 'Allocate and initialize double-precision float(s)', usage: '.double value1 [, value2, ...]' }],
    ['.ascii', { description: 'Allocate ASCII string without null terminator', usage: '.ascii "string"' }],
    ['.asciz', { description: 'Allocate ASCII string with null terminator', usage: '.asciz "string"' }],
    ['.string', { description: 'Allocate string with null terminator (alias for .asciz)', usage: '.string "string"' }],
    ['.zero', { description: 'Allocate zero-filled bytes', usage: '.zero count' }],
    ['.space', { description: 'Allocate space (bytes), optionally filled with value', usage: '.space size [, fill]' }],
    ['.skip', { description: 'Skip bytes (alias for .space)', usage: '.skip size [, fill]' }],
    ['.fill', { description: 'Fill memory with repeated value', usage: '.fill repeat, size, value' }],

    // Alignment directives
    ['.align', { description: 'Align next data/code on boundary', usage: '.align boundary [, fill] [, max]' }],
    ['.balign', { description: 'Align on byte boundary', usage: '.balign boundary [, fill] [, max]' }],
    ['.p2align', { description: 'Align on power-of-2 boundary', usage: '.p2align power [, fill] [, max]' }],

    // Symbol value directives
    ['.equ', { description: 'Define symbol as constant value', usage: '.equ symbol, expression' }],
    ['.set', { description: 'Set symbol value (can be redefined)', usage: '.set symbol, expression' }],
    ['.equiv', { description: 'Define symbol equivalent to expression', usage: '.equiv symbol, expression' }],

    // Common storage directives
    ['.comm', { description: 'Declare common symbol (allocated by linker)', usage: '.comm symbol, size [, alignment]' }],
    ['.lcomm', { description: 'Declare local common symbol', usage: '.lcomm symbol, size [, alignment]' }],

    // CFI (Call Frame Information) directives
    ['.cfi_startproc', { description: 'Start CFI procedure', usage: '.cfi_startproc [simple]' }],
    ['.cfi_endproc', { description: 'End CFI procedure', usage: '.cfi_endproc' }],
    ['.cfi_def_cfa', { description: 'Define canonical frame address (CFA)', usage: '.cfi_def_cfa register, offset' }],
    ['.cfi_def_cfa_offset', { description: 'Define CFA offset', usage: '.cfi_def_cfa_offset offset' }],
    ['.cfi_def_cfa_register', { description: 'Define CFA register', usage: '.cfi_def_cfa_register register' }],
    ['.cfi_offset', { description: 'Save register at offset from CFA', usage: '.cfi_offset register, offset' }],
    ['.cfi_restore', { description: 'Restore register to initial state', usage: '.cfi_restore register' }],
    ['.cfi_adjust_cfa_offset', { description: 'Adjust CFA offset', usage: '.cfi_adjust_cfa_offset offset' }],
    ['.cfi_remember_state', { description: 'Remember current CFI state', usage: '.cfi_remember_state' }],
    ['.cfi_restore_state', { description: 'Restore saved CFI state', usage: '.cfi_restore_state' }],

    // Debug directives
    ['.file', { description: 'Set source file name for debugging', usage: '.file "filename"' }],
    ['.loc', { description: 'Set source location for debugging', usage: '.loc file_number line [column]' }],
    ['.line', { description: 'Set line number', usage: '.line line_number' }],
    ['.ident', { description: 'Add identification string to object file', usage: '.ident "string"' }],

    // Macro directives
    ['.macro', { description: 'Begin macro definition', usage: '.macro name [arg1] [, arg2] ...' }],
    ['.endm', { description: 'End macro definition', usage: '.endm' }],
    ['.exitm', { description: 'Exit macro early', usage: '.exitm' }],

    // Conditional assembly directives
    ['.if', { description: 'Begin conditional assembly', usage: '.if expression' }],
    ['.ifdef', { description: 'If symbol is defined', usage: '.ifdef symbol' }],
    ['.ifndef', { description: 'If symbol is not defined', usage: '.ifndef symbol' }],
    ['.else', { description: 'Alternative for conditional', usage: '.else' }],
    ['.endif', { description: 'End conditional', usage: '.endif' }],

    // Repeat directives
    ['.rept', { description: 'Repeat block', usage: '.rept count' }],
    ['.endr', { description: 'End repeat block', usage: '.endr' }],

    // Other directives
    ['.include', { description: 'Include another file', usage: '.include "filename"' }],
    ['.incbin', { description: 'Include binary file', usage: '.incbin "filename" [, skip] [, count]' }],
    ['.org', { description: 'Set location counter (origin)', usage: '.org address' }],
]);