import * as vscode from 'vscode';
import * as types from './types';
import { instructionDatabase } from './instr';
import { LINUX_SYSCALLS } from './syscall';
import { registerDatabase } from './register';
import { directiveDatabase } from './directive';

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// System V AMD64 ABI register conventions
const PARAM_REGISTERS = ['%rdi', '%rsi', '%rdx', '%rcx', '%r8', '%r9'];
const RETURN_REGISTERS = ['%rax', '%rdx']; // %rdx for second return value
const CALLEE_SAVED = ['%rbx', '%rbp', '%r12', '%r13', '%r14', '%r15'];
const CALLER_SAVED = ['%rax', '%rcx', '%rdx', '%rsi', '%rdi', '%r8', '%r9', '%r10', '%r11'];

function getRegisterCategory(reg: string): 'gpr' | 'simd' | 'fpu' | 'other' {
    if (reg.match(/^%(r(ax|bx|cx|dx|si|di|bp|sp|ip)|r(8|9|1[0-5]))$/)) return 'gpr';
    if (reg.match(/^%(e(ax|bx|cx|dx|si|di|bp|sp)|r(8|9|1[0-5])d)$/)) return 'gpr';
    if (reg.match(/^%((ax|bx|cx|dx|si|di|bp|sp)|r(8|9|1[0-5])w)$/)) return 'gpr';
    if (reg.match(/^%([abcd][hl]|[sd]il|[sb]pl|r(8|9|1[0-5])b)$/)) return 'gpr';
    if (reg.match(/^%(xmm|ymm|zmm)\d+$/)) return 'simd';
    if (reg.match(/^%st(\(\d+\))?$/)) return 'fpu';
    return 'other';
}

function normalizeRegister(reg: string): string {
    if (getRegisterCategory(reg) !== 'gpr') {
        return reg;
    }

    // Keep it co-located
    type RegMap = { [key: string]: string };

    // Classic gprs 
    const classicMap: RegMap = {
        // 32-bit to 64-bit
        '%eax': '%rax', '%ebx': '%rbx', '%ecx': '%rcx', '%edx': '%rdx',
        '%esi': '%rsi', '%edi': '%rdi', '%ebp': '%rbp', '%esp': '%rsp',
        // 16-bit to 64-bit
        '%ax': '%rax', '%bx': '%rbx', '%cx': '%rcx', '%dx': '%rdx',
        '%si': '%rsi', '%di': '%rdi', '%bp': '%rbp', '%sp': '%rsp',
        // 8-bit to 64-bit
        '%al': '%rax', '%ah': '%rax',
        '%bl': '%rbx', '%bh': '%rbx',
        '%cl': '%rcx', '%ch': '%rcx',
        '%dl': '%rdx', '%dh': '%rdx',
        '%sil': '%rsi', '%dil': '%rdi',
        '%bpl': '%rbp', '%spl': '%rsp',
    };

    if (classicMap[reg]) return classicMap[reg];

    // r8-r15 family
    const extMatch = reg.match(/^%(r(8|9|1[0-5]))[dwb]$/);
    if (extMatch) return `%${extMatch[1]}`;

    // Already canonical
    return reg;
}

// Returns write width in bits based on register name
function getRegisterSize(reg: string): 8 | 16 | 32 | 64 {
    // 64-bit: %rax … %rsp, %rip, %r8 ... %r15
    if (reg.match(/^%(r(ax|bx|cx|dx|si|di|bp|sp|ip)|r(8|9|1[0-5]))$/)) { return 64; }
    // 32-bit: %eax … %esp, %r8d ... %r15d
    if (reg.match(/^%(e(ax|bx|cx|dx|si|di|bp|sp)|r(8|9|1[0-5])d)$/)) { return 32; }
    // 16-bit: %ax … %sp, %r8w ... %r15w
    if (reg.match(/^%((ax|bx|cx|dx|si|di|bp|sp)|r(8|9|1[0-5])w)$/)) { return 16; }
    // 8-bit: all byte registers
    if (reg.match(/^%([abcd][hl]|[sd]il|[sb]pl|r(8|9|1[0-5])b)$/)) { return 8; }
    // Non-GPR or unknown — treat as 64-bit (no masking needed)
    return 64;
}

// Writes "value" to the register of "rawReg" (before normalize), applies
// partial-register write semantics
// 64-bit write -> direct
// 32-bit write -> ZX to 64-bit
// 16-bit write -> MERGE: replace bits 15:0, preserve bits 63:16
// 8-bit low write -> MERGE: replace bits 7:0, preserve 63:16
// 8-bit high write -> MERGE: replace bits 15:8, preserve bits 63:16 and 7:0
// All writes should go through this
function setRegister(
    state: types.FullState,
    rawReg: string,
    value: types.RegisterValue
): void {
    const canonical = normalizeRegister(rawReg);
    const size = getRegisterSize(rawReg);

    if (size === 64) {
        state.registers[canonical] = value;
        return;
    }

    if (size === 32) {
        // Mask value to 32-bits if immediate, store under canonical 64-bit
        if (value.type === 'immediate') {
            // Mask to unsigned 32-bit
            const masked = value.value >>> 0;
            state.registers[canonical] = { type: 'immediate', value: masked };
        } else {
            // Symbolic, cannot fold, know zero-extended
            state.registers[canonical] = {
                type: 'symbolic',
                expr: `zext32(${formatValue(value)})`
            };
        }
        return;
    }

    // 16-bit, 8-bit, merge into existing 64-bit value
    // If existing value unknown, cannot produce meaningful merge
    const existing = state.registers[canonical];

    if (size === 16) {
        if (value.type === 'immediate' && existing?.type === 'immediate') {
            const merged = (existing.value & ~0xFFFF) | (value.value & 0xFFFF);
            state.registers[canonical] = { type: 'immediate', value: merged };
        } else {
            // Cannot merge in a useful way
            state.registers[canonical] = { type: 'unknown' };
        }
        return;
    }

    // size === 8
    const isHighByte = /^%[abcd]h$/.test(rawReg);

    if (isHighByte) {
        if (value.type === 'immediate' && existing?.type === 'immediate') {
            // Replace 15:8, preserve 63:16 and 7:0
            const merged = (existing.value & ~0xFF00) | ((value.value & 0xFF) << 8);
            state.registers[canonical] = { type: 'immediate', value: merged };
        } else {
            state.registers[canonical] = { type: 'unknown' };
        }
    } else {
        if (value.type === 'immediate' && existing?.type === 'immediate') {
            // Replace 7:0, preserve 63:8
            const merged = (existing.value & ~0xFF) | (value.value & 0xFF);
            state.registers[canonical] = { type: 'immediate', value: merged };
        } else {
            state.registers[canonical] = { type: 'unknown' };
        }
    }
}

function parseOperand(operand: string): types.RegisterValue {
    operand = operand.trim();

    // Immediate value
    if (operand.startsWith('$')) {
        const valueStr = operand.substring(1);
        // Hex
        if (valueStr.startsWith('0x') || valueStr.startsWith('0X')) {
            return { type: 'immediate', value: parseInt(valueStr, 16) };
        }
        // Binary
        if (valueStr.startsWith('0b') || valueStr.startsWith('0B')) {
            return { type: 'immediate', value: parseInt(valueStr.substring(2), 2) };
        }
        // Octal (starts with 0)
        if (valueStr.startsWith('0') && valueStr.length > 1) {
            return { type: 'immediate', value: parseInt(valueStr, 8) };
        }
        // Decimal
        const num = parseInt(valueStr, 10);
        if (!isNaN(num)) {
            return { type: 'immediate', value: num };
        }
    }

    // Register
    if (operand.startsWith('%')) {
        return { type: 'register', reg: normalizeRegister(operand) };
    }

    // Memory reference or symbolic
    return { type: 'symbolic', expr: operand };
}

function formatValue(value: types.RegisterValue, depth: number = 0): string {
    if (depth > 5) return '...'; // Prevent excessive recursion

    switch (value.type) {
        case 'immediate':
            return `0x${value.value.toString(16)} (${value.value})`;
        case 'register':
            return value.reg;
        case 'symbolic':
            return value.expr;
        case 'memory':
            return `*${formatValue(value.addr, depth + 1)}`;
        case 'binary':
            const left = formatValue(value.left, depth + 1);
            const right = formatValue(value.right, depth + 1);
            return `(${left} ${value.op} ${right})`;
        case 'unknown':
            return '?';
    }
}

function getMemoryKey(addr: types.RegisterValue): string | null {
    if (addr.type === 'immediate') {
        return `0x${addr.value.toString(16)}`;
    }
    if (addr.type === 'register') {
        return addr.reg;
    }
    if (addr.type === 'symbolic') {
        return addr.expr;
    }
    return null;
}

// Format flag states for display
function formatFlags(flags: types.FlagState): string {
    const parts: string[] = [];
    if (flags.ZF) parts.push(`ZF=${flags.ZF}`);
    if (flags.CF) parts.push(`CF=${flags.CF}`);
    if (flags.SF) parts.push(`SF=${flags.SF}`);
    if (flags.OF) parts.push(`OF=${flags.OF}`);
    return parts.join(', ');
}

function formatStack(stack: types.StackState): string[] {
    if (stack.items.length === 0) {
        return [];
    }

    const lines: string[] = [];
    lines.push('**Stack State:**');
    lines.push('```');
    lines.push('        Address  │ Value');
    lines.push('        ─────────┼─────────────────');

    // Show stack growing downward (higher indices = deeper in stack)
    for (let i = stack.items.length - 1; i >= 0; i--) {
        const offset = stack.offset - (stack.items.length - 1 - i) * 8;
        const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
        const value = formatValue(stack.items[i]);
        const arrow = i === stack.items.length - 1 ? ' ← %rsp' : '';
        lines.push(`%rsp${offsetStr.padStart(4)}  │ ${value}${arrow}`);
    }

    lines.push('```');
    return lines;
}

function analyzeFunctionInterface(document: vscode.TextDocument, functionName: string): types.FunctionInfo | null {
    // Find the function label
    let startLine = -1;
    let endLine = -1;

    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i).text.trim();
        if (line === `${functionName}:`) {
            startLine = i;
            break;
        }
    }

    if (startLine === -1) {
        return null;
    }

    // Find the end of the function (next label or last ret)
    let lastRetLine = -1;
    for (let i = startLine + 1; i < document.lineCount; i++) {
        const line = document.lineAt(i).text.trim();

        // Check for ret instructions
        if (line.match(/^ret[qlfn]?\s*$/)) {
            lastRetLine = i;
        }

        // Stop at next function label
        if (line.match(/^[a-zA-Z_][a-zA-Z0-9_]*:$/)) {
            endLine = i - 1;
            break;
        }
    }

    if (endLine === -1) {
        endLine = lastRetLine !== -1 ? lastRetLine : document.lineCount - 1;
    }

    const info: types.FunctionInfo = {
        name: functionName,
        startLine,
        endLine,
        parametersUsed: [],
        returnRegisters: [],
        registersClobbered: [],
        callsOthers: []
    };

    const registersRead = new Set<string>();
    const registersWritten = new Set<string>();

    // Track what's written in the last few instructions before each ret
    const returnRegisterCandidates = new Set<string>();

    // First pass: find all ret instructions and analyze what's set before them
    const retLines: number[] = [];
    for (let i = startLine + 1; i <= endLine; i++) {
        const line = document.lineAt(i).text.trim();
        if (line.match(/^ret[qlfn]?\s*$/)) {
            retLines.push(i);
        }
    }

    // For each ret, look back up to 10 instructions to find what's being prepared
    retLines.forEach(retLine => {
        const lookbackStart = Math.max(startLine + 1, retLine - 10);
        const registersSetBeforeThisRet = new Set<string>();

        for (let i = retLine - 1; i >= lookbackStart; i--) {
            const line = document.lineAt(i).text;
            const trimmed = line.trim();

            // Skip comments, empty lines, directives
            if (trimmed.startsWith('#') || trimmed.startsWith('//') ||
                trimmed.length === 0 || trimmed.startsWith('.')) {
                continue;
            }

            // Skip labels but don't stop at them
            if (trimmed.match(/^[a-zA-Z0-9_.]+:\s*$/)) {
                continue;
            }

            // Stop at control flow (jumps, calls) but NOT at common return-prep instructions
            const instr = trimmed.split(/\s+/)[0].toLowerCase();
            if (instr.match(/^(call|jmp|j[a-z]+|loop)/) &&
                !instr.match(/^(leave|pop)/)) {
                break;
            }

            // Parse instruction
            const instrMatch = trimmed.match(/^\s*([a-zA-Z][a-zA-Z0-9]*)\s+(.+?)(?:\s*#.*)?$/);
            if (!instrMatch) continue;

            const instrName = instrMatch[1].toLowerCase();
            const operands = instrMatch[2].split(',').map(s => s.trim());

            // Track destination register for instructions that write to return registers
            if (instrName.startsWith('mov') && operands.length === 2) {
                const destOp = operands[1];
                const destRegs = destOp.matchAll(/%([a-z0-9]+)/g);
                for (const match of destRegs) {
                    const reg = normalizeRegister(`%${match[1]}`);
                    if (RETURN_REGISTERS.includes(reg)) {
                        registersSetBeforeThisRet.add(reg);
                    }
                }
            } else if (instrName.startsWith('lea') ||
                instrName.match(/^(add|sub|and|or|xor|imul|mul|idiv|div|shl|shr|sar|sal|inc|dec|neg|not)$/)) {
                // These instructions modify their destination (last operand)
                const destOp = operands[operands.length - 1];
                const destRegs = destOp.matchAll(/%([a-z0-9]+)/g);
                for (const match of destRegs) {
                    const reg = normalizeRegister(`%${match[1]}`);
                    if (RETURN_REGISTERS.includes(reg)) {
                        registersSetBeforeThisRet.add(reg);
                    }
                }
            } else if (instrName.match(/^pop$/)) {
                // Pop writes to register
                if (operands.length === 1) {
                    const destRegs = operands[0].matchAll(/%([a-z0-9]+)/g);
                    for (const match of destRegs) {
                        const reg = normalizeRegister(`%${match[1]}`);
                        if (RETURN_REGISTERS.includes(reg)) {
                            registersSetBeforeThisRet.add(reg);
                        }
                    }
                }
            }
        }

        // Add to overall return register candidates
        registersSetBeforeThisRet.forEach(reg => returnRegisterCandidates.add(reg));
    });

    // Second pass: analyze full function body for parameters and clobbers
    for (let i = startLine + 1; i <= endLine; i++) {
        const line = document.lineAt(i).text;
        const trimmed = line.trim();

        // Skip comments, empty lines, labels, directives
        if (trimmed.startsWith('#') || trimmed.startsWith('//') ||
            trimmed.length === 0 || trimmed.startsWith('.') ||
            trimmed.match(/^[a-zA-Z0-9_.]+:\s*$/)) {
            continue;
        }

        // Look for function calls
        const callMatch = trimmed.match(/^call[q]?\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (callMatch) {
            info.callsOthers.push(callMatch[1]);

            // After a call, caller-saved registers are potentially clobbered
            // BUT we don't mark them as written for parameter detection purposes
            // Only mark non-return registers as definitively clobbered
            CALLER_SAVED.forEach(reg => {
                if (!RETURN_REGISTERS.includes(reg)) {
                    registersWritten.add(reg);
                }
            });
            continue;
        }

        // Parse instruction to find register usage
        const instrMatch = trimmed.match(/^\s*([a-zA-Z][a-zA-Z0-9]*)\s+(.+?)(?:\s*#.*)?$/);
        if (!instrMatch) continue;

        const instr = instrMatch[1].toLowerCase();
        const operands = instrMatch[2].split(',').map(s => s.trim());

        // Analyze register reads and writes
        if (instr.startsWith('mov') && operands.length === 2) {
            // mov src, dest - src is read, dest is written
            const srcRegs = operands[0].matchAll(/%([a-z0-9]+)/g);
            const destRegs = operands[1].matchAll(/%([a-z0-9]+)/g);

            for (const match of srcRegs) {
                const reg = normalizeRegister(`%${match[1]}`);
                if (!registersWritten.has(reg)) {
                    registersRead.add(reg);
                }
            }

            for (const match of destRegs) {
                const reg = normalizeRegister(`%${match[1]}`);
                registersWritten.add(reg);
            }
        } else if (instr.startsWith('lea') && operands.length === 2) {
            // lea mem, dest - only dest is written (memory operand is computed, not read)
            const destRegs = operands[1].matchAll(/%([a-z0-9]+)/g);
            for (const match of destRegs) {
                const reg = normalizeRegister(`%${match[1]}`);
                registersWritten.add(reg);
            }

            // But registers in the address calculation are read
            const srcRegs = operands[0].matchAll(/%([a-z0-9]+)/g);
            for (const match of srcRegs) {
                const reg = normalizeRegister(`%${match[1]}`);
                if (!registersWritten.has(reg)) {
                    registersRead.add(reg);
                }
            }
        } else if (instr.match(/^(sub|and|or|xor|imul|shl|shr|sar|sal|adc|sbb)/)) {
            // Two-operand arithmetic: both read, second written
            if (operands.length === 2) {
                // First operand is always read
                const srcRegs = operands[0].matchAll(/%([a-z0-9]+)/g);
                for (const match of srcRegs) {
                    const reg = normalizeRegister(`%${match[1]}`);
                    if (!registersWritten.has(reg)) {
                        registersRead.add(reg);
                    }
                }

                // Second operand is read then written
                const destRegs = operands[1].matchAll(/%([a-z0-9]+)/g);
                for (const match of destRegs) {
                    const reg = normalizeRegister(`%${match[1]}`);
                    if (!registersWritten.has(reg)) {
                        registersRead.add(reg);
                    }
                    registersWritten.add(reg);
                }
            }
        } else if (instr.match(/^(cmp|test)/)) {
            // Compare: all operands are read only
            operands.forEach(op => {
                const regs = op.matchAll(/%([a-z0-9]+)/g);
                for (const match of regs) {
                    const reg = normalizeRegister(`%${match[1]}`);
                    if (!registersWritten.has(reg)) {
                        registersRead.add(reg);
                    }
                }
            });
        } else if (instr.match(/^(inc|dec|neg|not)/)) {
            // Unary operations: operand is read and written
            if (operands.length === 1) {
                const regs = operands[0].matchAll(/%([a-z0-9]+)/g);
                for (const match of regs) {
                    const reg = normalizeRegister(`%${match[1]}`);
                    if (!registersWritten.has(reg)) {
                        registersRead.add(reg);
                    }
                    registersWritten.add(reg);
                }
            }
        } else if (instr.match(/^push/)) {
            // Push: operand is read
            operands.forEach(op => {
                const regs = op.matchAll(/%([a-z0-9]+)/g);
                for (const match of regs) {
                    const reg = normalizeRegister(`%${match[1]}`);
                    if (!registersWritten.has(reg)) {
                        registersRead.add(reg);
                    }
                }
            });
        } else if (instr.match(/^pop/)) {
            // Pop: operand is written
            if (operands.length === 1) {
                const regs = operands[0].matchAll(/%([a-z0-9]+)/g);
                for (const match of regs) {
                    const reg = normalizeRegister(`%${match[1]}`);
                    registersWritten.add(reg);
                }
            }
        }
    }

    // Determine parameters (parameter registers read before written)
    PARAM_REGISTERS.forEach(reg => {
        if (registersRead.has(reg)) {
            info.parametersUsed.push(reg);
        }
    });

    // Determine return values based on what's actually written
    // Standard convention: %rax (always check), %rdx (for 128-bit returns)
    if (registersWritten.has('%rax')) {
        info.returnRegisters.push('%rax');
    }
    if (registersWritten.has('%rdx') && info.parametersUsed.length <= 2) {
        // Only consider %rdx as return if it's not used as a parameter
        // (If function takes 3+ params, %rdx is a parameter, not a return)
        info.returnRegisters.push('%rdx');
    }

    // If function has ret but doesn't write to %rax, it's void
    // (or returns via memory/other mechanism)

    // All written registers are clobbered, EXCEPT:
    // 1. Return registers that we detected
    // 2. Stack pointer (%rsp) and base pointer (%rbp) - managed by convention
    info.registersClobbered = Array.from(registersWritten).filter(reg =>
        !info.returnRegisters.includes(reg) && reg !== '%rsp' && reg !== '%rbp'
    );

    return info;
}

const LABEL_RE = /^(\d+|[a-zA-Z_.][a-zA-Z0-9_.]*):/;
const BRANCH_TARGET_RE = /^\s*(?:j\w+|call[q]?|loop(?:e|ne|z|nz)?)\s+([a-zA-Z_.][a-zA-Z0-9_.]*|\d+[fb]?)\b/;

function detectDeadCode(document: vscode.TextDocument): types.DeadCodeRange[] {
    const deadCodeRanges: types.DeadCodeRange[] = [];
    // Use a two-pass
    // First pass: collect labels that appear as targets
    const branchTargetLabels = new Set<string>();

    for (let i = 0; i < document.lineCount; i++) {
        const trimmed = document.lineAt(i).text.trim();
        const bm = trimmed.match(BRANCH_TARGET_RE);
        if (bm) {
            // Strip trailing 'f'/'b' suffixes
            branchTargetLabels.add(bm[1].replace(/[fb]$/, ''));
        }
    }

    function isInstruction(trimmed: string): boolean {
        if (trimmed.length === 0) return false;
        if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*')) return false;
        if (trimmed.startsWith('.')) return false;
        if (LABEL_RE.test(trimmed)) return false;
        return /^[a-zA-Z]/.test(trimmed)
    }

    function flushDeadCode(
        firstLine: number,
        lastLine: number,
        reason: string
    ): void {
        if (firstLine !== -1 && lastLine !== -1) {
            deadCodeRanges.push({
                range: new vscode.Range(
                    firstLine,
                    0,
                    lastLine,
                    document.lineAt(lastLine).text.length
                ),
                reason
            });
        }
    }

    // Pass 2, linear scan
    let inDeadCode = false;
    let deadCodeReason = '';
    let firstDeadInstructionLine = -1;
    let lastDeadInstructionLine = -1;

    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i).text;
        const trimmed = line.trim();

        if (trimmed.length === 0 || trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
            continue;
        }

        // Labels makes points after reachable, dead-code region open before must be closed
        const labelMatch = trimmed.match(LABEL_RE);
        if (labelMatch) {
            // Close any open dead-code region.
            if (inDeadCode) {
                flushDeadCode(firstDeadInstructionLine, lastDeadInstructionLine, deadCodeReason);
                inDeadCode = false;
                firstDeadInstructionLine = -1;
                lastDeadInstructionLine = -1;
            }

            // Rest of line may be instruction
            const afterLabel = trimmed.slice(labelMatch[0].length).trim();
            if (afterLabel.length === 0 || afterLabel.startsWith('#') || afterLabel.startsWith('//') || afterLabel.startsWith('/*')) {
                continue;
            }

            // TODO: Fall through with suffix as if standalone line
            // Would retest with suffix below, would need refactoring
            // Continue here for now, examine suffix in future iteration. Check inline
            const suffixTrimmed = afterLabel;
            const suffixUncondJmp = suffixTrimmed.match(/^(jmp|jmpq|ret|retq|retf|retn)\b/);
            if (suffixUncondJmp && !inDeadCode) {
                inDeadCode = true;
                firstDeadInstructionLine = -1;
                lastDeadInstructionLine = -1;
                deadCodeReason = `Unreachable code after unconditional ${suffixUncondJmp[1]}`;
            }
            const suffixNoReturn = suffixTrimmed.match(/^(hlt|ud2)\b/);
            if (suffixNoReturn && !inDeadCode) {
                inDeadCode = true;
                firstDeadInstructionLine = -1;
                lastDeadInstructionLine = -1;
                deadCodeReason = `Unreachable code after ${suffixNoReturn[1]} (does not return)`;
            }
            // int3 on same line as label, treat as hlt
            if (/^int3\b/.test(suffixTrimmed) && !inDeadCode) {
                inDeadCode = true;
                firstDeadInstructionLine = -1;
                lastDeadInstructionLine = -1;
                deadCodeReason = 'Unreachable code after int3 (breakpoint trap)';
            }
            continue;
        }

        // Most directives don't change control flow
        // Watch for ones that do
        if (trimmed.startsWith('.')) {
            const isSectionSwitch = /^\.(text|data|bss|rodata|section|pushsection|popsection|previous)\b/.test(trimmed);
            if (isSectionSwitch && inDeadCode) {
                flushDeadCode(firstDeadInstructionLine, lastDeadInstructionLine, deadCodeReason);
                inDeadCode = false;
                firstDeadInstructionLine = -1;
                lastDeadInstructionLine = -1;
            }
            // All directives (section-switch or not) are skipped as
            // instructions — they cannot themselves be "dead".
            continue;
        }

        const isInstr = isInstruction(trimmed);

        const unconditionalJump = trimmed.match(/^\s*(jmp|jmpq|ret|retq|retf|retn)\b/);
        if (unconditionalJump && isInstr && !inDeadCode) {
            // Start tracking dead code after this instruction
            const instruction = unconditionalJump[1];
            inDeadCode = true;
            firstDeadInstructionLine = -1;  // Will be set when we find first dead instruction
            lastDeadInstructionLine = -1;
            deadCodeReason = `Unreachable code after unconditional ${instruction}`;
            continue;
        }

        // Check for other instructions that don't return
        const noReturnInstruction = trimmed.match(/^\s*(hlt|ud2)\b/);
        if (noReturnInstruction && isInstr && !inDeadCode) {
            inDeadCode = true;
            firstDeadInstructionLine = -1;
            lastDeadInstructionLine = -1;
            deadCodeReason = `Unreachable code after ${noReturnInstruction[1]} (does not return)`;
            continue;
        }

        // Check for int3 (breakpoint) - might be intentional, but still doesn't ret
        const int3Match = trimmed.match(/^\s*int3\b/);
        if (int3Match && isInstr && !inDeadCode) {
            inDeadCode = true;
            firstDeadInstructionLine = -1;
            lastDeadInstructionLine = -1;
            deadCodeReason = 'Unreachable code after int3 (breakpoint trap)';
            continue;
        }

        // Check for syscall exit
        if (/^syscall\b/.test(trimmed) && isInstr && i > 0 && !inDeadCode) {
            let isExitSyscall = false;
            // Look back at least 5 lines to find syscall num
            for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
                const prevLine = document.lineAt(j).text.trim();
                // $60 (exit) or $231 (exit_group)
                if (/mov[bwlq]?\s+\$(?:60|231)\s*,\s*%[re]ax/.test(prevLine)) {
                    isExitSyscall = true;
                    break;
                }
                // Stop looking hit a label or instruction that mods rax
                if (
                    LABEL_RE.test(prevLine) ||
                    (/^[a-zA-Z]/.test(prevLine) &&
                        /%[re]ax/.test(prevLine) &&
                        !/\b(?:cmp|test)\b/.test(prevLine))
                ) {
                    break;
                }
            }

            if (isExitSyscall) {
                inDeadCode = true;
                firstDeadInstructionLine = -1;
                lastDeadInstructionLine = -1;
                deadCodeReason = 'Unreachable code after exit syscall';
                continue;
            }
        }

        if (inDeadCode && isInstr) {
            if (firstDeadInstructionLine === -1) {
                firstDeadInstructionLine = i;
            }
            lastDeadInstructionLine = i;
        }
    }

    // Handle dead code at end of file
    if (inDeadCode) {
        flushDeadCode(firstDeadInstructionLine, lastDeadInstructionLine, deadCodeReason);
    }
    return deadCodeRanges;
}

class RegisterTreeItem extends vscode.TreeItem {
    public afterItem?: RegisterTreeItem;

    constructor(
        public override readonly label: string,
        public override readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly itemType: 'category' | 'register' | 'register-after' | 'flag' | 'flag-after' | 'stack' | 'memory' | 'memory-after' | 'instruction' | 'stack-header' | 'fpu' | 'fpu-header',
        public readonly registerName?: string,
        public readonly value?: types.RegisterValue
    ) {
        super(label, collapsibleState);
        if (itemType === 'category') {
            this.contextValue = 'category';
        } else if (itemType === 'register') {
            this.contextValue = 'register';
            this.tooltip = `${registerName}: ${formatValue(value!)}`;
        } else if (itemType === 'instruction') {
            this.contextValue = 'instruction';
            this.iconPath = new vscode.ThemeIcon('debug-stackframe');
        } else if (itemType === 'stack-header') {
            this.iconPath = new vscode.ThemeIcon('chevron-right');
        }
    }
}

class RegisterStateProvider implements vscode.TreeDataProvider<RegisterTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<RegisterTreeItem | undefined | null | void> = new vscode.EventEmitter<RegisterTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<RegisterTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private stateBefore: types.FullState | null = null;
    private stateAfter: types.FullState | null = null;
    private currentDocument: vscode.TextDocument | null = null;
    private currentLine: number = -1;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    updateState(document: vscode.TextDocument, line: number): void {
        this.currentDocument = document;
        this.currentLine = line;

        this.stateBefore = line > 0 ? analyzeRegisters(document, line - 1) : {
            registers: {},
            memory: {},
            stack: { items: [] as types.RegisterValue[], offset: 0 },
            flags: {},
            fpuStack: { stack: Array(8).fill({ type: 'unknown' }), top: 0, statusWord: {} }
        };
        this.stateAfter = analyzeRegisters(document, line);

        this.refresh();
    }

    getTreeItem(element: RegisterTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: RegisterTreeItem): vscode.ProviderResult<RegisterTreeItem[]> {
        if (!this.stateAfter || !this.currentDocument) {
            return Promise.resolve([]);
        }

        if (!element) {
            const categories: RegisterTreeItem[] = [];

            const currentLine = this.currentDocument.lineAt(this.currentLine);
            const trimmed = currentLine.text.trim();
            if (trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.startsWith('//') && !trimmed.startsWith('.')) {
                const instrMatch = trimmed.match(/^\s*([a-zA-Z][a-zA-Z0-9]*)/);
                if (instrMatch) {
                    categories.push(new RegisterTreeItem(
                        `Line ${this.currentLine + 1}: ${trimmed.substring(0, 50)}${trimmed.length > 50 ? '...' : ''}`,
                        vscode.TreeItemCollapsibleState.None,
                        'instruction'
                    ));
                }
            }

            const changes = this.calculateChanges();

            const gprRegs = this.getRegistersForCategory('gpr');
            if (gprRegs.length > 0) {
                const changedCount = gprRegs.filter(([reg]) =>
                    changes.registers.some(c => c.name === reg)
                ).length;
                const label = changedCount > 0
                    ? `General Purpose Registers (${changedCount} changed)`
                    : 'General Purpose Registers';
                categories.push(new RegisterTreeItem(
                    label,
                    vscode.TreeItemCollapsibleState.Expanded,
                    'category'
                ));
            }

            // SIMD Registers
            const simdRegs = this.getRegistersForCategory('simd');
            if (simdRegs.length > 0) {
                const changedCount = simdRegs.filter(([reg]) =>
                    changes.registers.some(c => c.name === reg)
                ).length;
                const label = changedCount > 0
                    ? `SIMD Registers (${changedCount} changed)`
                    : 'SIMD Registers';
                categories.push(new RegisterTreeItem(
                    label,
                    vscode.TreeItemCollapsibleState.Expanded,
                    'category'
                ));
            }

            // FPU Registers
            const fpuRegs = this.getRegistersForCategory('fpu');
            if (fpuRegs.length > 0) {
                const changedCount = fpuRegs.filter(([reg]) =>
                    changes.registers.some(c => c.name === reg)
                ).length;
                const label = changedCount > 0
                    ? `FPU Registers (${changedCount} changed)`
                    : 'FPU Registers';
                categories.push(new RegisterTreeItem(
                    label,
                    vscode.TreeItemCollapsibleState.Expanded,
                    'category'
                ));
            }

            // Other Registers
            const otherRegs = this.getRegistersForCategory('other');
            if (otherRegs.length > 0) {
                const changedCount = otherRegs.filter(([reg]) =>
                    changes.registers.some(c => c.name === reg)
                ).length;
                const label = changedCount > 0
                    ? `Other Registers (${changedCount} changed)`
                    : 'Other Registers';
                categories.push(new RegisterTreeItem(
                    label,
                    vscode.TreeItemCollapsibleState.Expanded,
                    'category'
                ));
            }

            // Flags
            if (Object.keys(this.stateAfter.flags).length > 0) {
                const changedCount = changes.flags.length;
                const label = changedCount > 0
                    ? `Flags (${changedCount} changed)`
                    : 'Flags';
                categories.push(new RegisterTreeItem(
                    label,
                    vscode.TreeItemCollapsibleState.Expanded,
                    'category'
                ));
            }

            // Stack
            if (this.stateAfter.stack.items.length > 0 || this.stateBefore!.stack.items.length > 0) {
                const beforeCount = this.stateBefore!.stack.items.length;
                const afterCount = this.stateAfter.stack.items.length;
                const label = beforeCount !== afterCount
                    ? `Stack (${beforeCount} => ${afterCount} items)`
                    : `Stack (${afterCount} items)`;
                categories.push(new RegisterTreeItem(
                    label,
                    vscode.TreeItemCollapsibleState.Expanded,
                    'category'
                ));
            }

            // Memory
            const memoryCount = Object.keys(this.stateAfter.memory).length;
            const beforeMemoryCount = Object.keys(this.stateBefore!.memory).length;
            if (memoryCount > 0 || beforeMemoryCount > 0) {
                const changedCount = changes.memory.length;
                const label = changedCount > 0
                    ? `Memory (${changedCount} changed)`
                    : `Memory (${memoryCount} locations)`;
                categories.push(new RegisterTreeItem(
                    label,
                    vscode.TreeItemCollapsibleState.Expanded,
                    'category'
                ));
            }

            // FPU stack
            if (this.stateAfter.fpuStack && this.stateAfter.fpuStack.stack.some(v => v.type !== 'unknown')) {
                const fpuCount = this.stateAfter.fpuStack.stack.filter(v => v.type !== 'unknown').length;
                categories.push(new RegisterTreeItem(
                    `FPU Stack (ST(${this.stateAfter.fpuStack.top}), ${fpuCount} values)`,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'category'
                ));
            }

            return Promise.resolve(categories);
        } else {
            const items: RegisterTreeItem[] = [];
            const changes = this.calculateChanges();

            if (element.itemType === 'instruction') {
                return Promise.resolve([]);
            }

            if (element.label?.startsWith('General Purpose Registers')) {
                const gprRegs = this.getRegistersForCategory('gpr');
                for (const [reg, afterValue] of gprRegs) {
                    const item = this.createRegisterItem(reg, afterValue, changes.registers);
                    items.push(item);
                    if (item.afterItem) {
                        items.push(item.afterItem);
                    }
                }
            } else if (element.label?.startsWith('SIMD Registers')) {
                const simdRegs = this.getRegistersForCategory('simd');
                for (const [reg, afterValue] of simdRegs) {
                    const item = this.createRegisterItem(reg, afterValue, changes.registers);
                    items.push(item);
                    if (item.afterItem) {
                        items.push(item.afterItem);
                    }
                }
            } else if (element.label?.startsWith('FPU Registers')) {
                const fpuRegs = this.getRegistersForCategory('fpu');
                for (const [reg, afterValue] of fpuRegs) {
                    const item = this.createRegisterItem(reg, afterValue, changes.registers);
                    items.push(item);
                    if (item.afterItem) {
                        items.push(item.afterItem);
                    }
                }
            } else if (element.label?.startsWith('Other Registers')) {
                const otherRegs = this.getRegistersForCategory('other');
                for (const [reg, afterValue] of otherRegs) {
                    const item = this.createRegisterItem(reg, afterValue, changes.registers);
                    items.push(item);
                    if (item.afterItem) {
                        items.push(item.afterItem);
                    }
                }
            } else if (element.label?.startsWith('Flags')) {
                for (const [flag, afterCondition] of Object.entries(this.stateAfter.flags)) {
                    const beforeCondition = this.stateBefore!.flags[flag as keyof types.FlagState];
                    const changed = beforeCondition !== afterCondition;

                    if (changed) {
                        const label = `${flag}: ${beforeCondition || undefined}`;
                        const item = new RegisterTreeItem(
                            label,
                            vscode.TreeItemCollapsibleState.None,
                            'flag'
                        );
                        item.iconPath = new vscode.ThemeIcon('symbol-boolean', new vscode.ThemeColor('charts.yellow'));
                        items.push(item);

                        const afterItem = new RegisterTreeItem(
                            `   ⮕ ${afterCondition}`,
                            vscode.TreeItemCollapsibleState.None,
                            'flag-after'
                        );
                        afterItem.iconPath = new vscode.ThemeIcon('arrow-small-right', new vscode.ThemeColor('charts.yellow'));
                        items.push(afterItem);
                    } else {
                        const item = new RegisterTreeItem(
                            `${flag} = ${afterCondition}`,
                            vscode.TreeItemCollapsibleState.None,
                            'flag'
                        );
                        item.iconPath = new vscode.ThemeIcon('symbol-boolean');
                        items.push(item);
                    }
                }
            } else if (element.label?.startsWith('Stack')) {
                // Show stack with before/after if it changed
                const beforeStack = this.stateBefore!.stack;
                const afterStack = this.stateAfter.stack;

                if (beforeStack.items.length !== afterStack.items.length) {
                    // Stack size changed - show both
                    items.push(new RegisterTreeItem(
                        'Before:',
                        vscode.TreeItemCollapsibleState.None,
                        'stack-header'
                    ));

                    for (let i = beforeStack.items.length - 1; i >= 0; i--) {
                        const offset = beforeStack.offset - (beforeStack.items.length - 1 - i) * 8;
                        const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
                        const value = formatValue(beforeStack.items[i]);
                        const label = i === beforeStack.items.length - 1
                            ? `  %rsp${offsetStr}: ${value} ← top`
                            : `  %rsp${offsetStr}: ${value}`;

                        const item = new RegisterTreeItem(
                            label,
                            vscode.TreeItemCollapsibleState.None,
                            'stack'
                        );
                        item.iconPath = new vscode.ThemeIcon('symbol-array');
                        items.push(item);
                    }

                    items.push(new RegisterTreeItem(
                        'After:',
                        vscode.TreeItemCollapsibleState.None,
                        'stack-header'
                    ));

                    for (let i = afterStack.items.length - 1; i >= 0; i--) {
                        const offset = afterStack.offset - (afterStack.items.length - 1 - i) * 8;
                        const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
                        const value = formatValue(afterStack.items[i]);
                        const label = i === afterStack.items.length - 1
                            ? `  %rsp${offsetStr}: ${value} ← top`
                            : `  %rsp${offsetStr}: ${value}`;

                        const item = new RegisterTreeItem(
                            label,
                            vscode.TreeItemCollapsibleState.None,
                            'stack'
                        );
                        item.iconPath = new vscode.ThemeIcon('symbol-array', new vscode.ThemeColor('charts.yellow'));
                        items.push(item);
                    }
                } else {
                    // Show current stack
                    for (let i = afterStack.items.length - 1; i >= 0; i--) {
                        const offset = afterStack.offset - (afterStack.items.length - 1 - i) * 8;
                        const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
                        const value = formatValue(afterStack.items[i]);
                        const label = i === afterStack.items.length - 1
                            ? `%rsp${offsetStr}: ${value} ← top`
                            : `%rsp${offsetStr}: ${value}`;

                        const item = new RegisterTreeItem(
                            label,
                            vscode.TreeItemCollapsibleState.None,
                            'stack'
                        );
                        item.iconPath = new vscode.ThemeIcon('symbol-array');
                        items.push(item);
                    }
                }
            } else if (element.label?.startsWith('Memory')) {
                for (const change of changes.memory) {
                    const label = `*${change.name}: ${change.before !== 'undefined' ? change.before : 'undefined'}`;

                    const item = new RegisterTreeItem(
                        label,
                        vscode.TreeItemCollapsibleState.None,
                        'memory'
                    );
                    item.iconPath = new vscode.ThemeIcon('symbol-variable', new vscode.ThemeColor('charts.yellow'));
                    items.push(item);

                    const afterItem = new RegisterTreeItem(
                        `   ⮕ ${change.after}`,
                        vscode.TreeItemCollapsibleState.None,
                        'memory-after'
                    );
                    afterItem.iconPath = new vscode.ThemeIcon('arrow-small-right', new vscode.ThemeColor('charts.yellow'));
                    items.push(afterItem);
                }

                // Unchanged memory
                for (const [addr, value] of Object.entries(this.stateAfter.memory)) {
                    if (!changes.memory.some(c => c.name === addr)) {
                        const item = new RegisterTreeItem(
                            `*${addr}`,
                            vscode.TreeItemCollapsibleState.None,
                            'memory'
                        );
                        item.description = formatValue(value);
                        item.iconPath = new vscode.ThemeIcon('symbol-variable');
                        items.push(item);
                    }
                }
            } else if (element.label?.startsWith('FPU Stack')) {
                const fpuStack = this.stateAfter.fpuStack!;

                // ST(0) - ST(7)
                for (let i = 0; i < 8; i++) {
                    const physicalIndex = (fpuStack.top + i) & 7;
                    const value = fpuStack.stack[physicalIndex];

                    if (value.type !== 'unknown') {
                        const label = i === 0 ? `ST(0): ${formatValue(value)} ← top` : `ST(${i}): ${formatValue(value)}`;
                        const item = new RegisterTreeItem(
                            label,
                            vscode.TreeItemCollapsibleState.None,
                            'fpu'
                        );
                        item.iconPath = new vscode.ThemeIcon('symbol-number', new vscode.ThemeColor('charts.blue'));
                        items.push(item);
                    }
                }

                if (fpuStack.statusWord.C0 || fpuStack.statusWord.C2 || fpuStack.statusWord.C3) {
                    const ccItem = new RegisterTreeItem(
                        'Condition Codes:',
                        vscode.TreeItemCollapsibleState.None,
                        'fpu-header'
                    );
                    items.push(ccItem);

                    if (fpuStack.statusWord.C0) {
                        items.push(new RegisterTreeItem(`  C0: ${fpuStack.statusWord.C0}`, vscode.TreeItemCollapsibleState.None, 'fpu'));
                    }
                    if (fpuStack.statusWord.C2) {
                        items.push(new RegisterTreeItem(`  C2: ${fpuStack.statusWord.C2}`, vscode.TreeItemCollapsibleState.None, 'fpu'));
                    }
                    if (fpuStack.statusWord.C3) {
                        items.push(new RegisterTreeItem(`  C3: ${fpuStack.statusWord.C3}`, vscode.TreeItemCollapsibleState.None, 'fpu'));
                    }
                }
            }

            return Promise.resolve(items);
        }
    }

    private getRegistersForCategory(category: 'gpr' | 'simd' | 'fpu' | 'other'): [string, types.RegisterValue][] {
        return Object.entries(this.stateAfter!.registers).filter(([reg, _]) => getRegisterCategory(reg) === category)
            .sort((a, b) => a[0].localeCompare(b[0]));
    }

    private calculateChanges() {
        const registerChanges: { name: string, before: string, after: string }[] = [];
        const flagChanges: { name: string, before: string, after: string }[] = [];
        const memoryChanges: { name: string, before: string, after: string }[] = [];

        for (const [reg, afterVal] of Object.entries(this.stateAfter!.registers)) {
            const beforeVal = this.stateBefore!.registers[reg];
            const afterStr = formatValue(afterVal);
            const beforeStr = beforeVal ? formatValue(beforeVal) : 'undefined';

            if (!beforeVal || formatValue(beforeVal) !== afterStr) {
                registerChanges.push({ name: reg, before: beforeStr, after: afterStr });
            }
        }

        // Flag changes
        for (const [flag, afterCond] of Object.entries(this.stateAfter!.flags)) {
            const beforeCond = this.stateBefore!.flags[flag as keyof types.FlagState];
            if (beforeCond !== afterCond) {
                flagChanges.push({ name: flag, before: beforeCond || 'undefined', after: afterCond });
            }
        }

        // Memory changes
        for (const [addr, afterVal] of Object.entries(this.stateAfter!.memory)) {
            const beforeVal = this.stateBefore!.memory[addr];
            const afterStr = formatValue(afterVal);
            const beforeStr = beforeVal ? formatValue(beforeVal) : 'undefined';

            if (!beforeVal || formatValue(beforeVal) !== afterStr) {
                memoryChanges.push({ name: addr, before: beforeStr, after: afterStr });
            }
        }

        return {
            registers: registerChanges,
            flags: flagChanges,
            memory: memoryChanges
        };
    }

    private createRegisterItem(reg: string, afterValue: types.RegisterValue, changes: { name: string, before: string, after: string }[]): RegisterTreeItem {
        const change = changes.find(c => c.name === reg);

        let label: string;
        if (change) {
            // Show before => after
            label = `${reg}: ${change.before}`;

            const item = new RegisterTreeItem(
                label,
                vscode.TreeItemCollapsibleState.None,
                'register',
                reg,
                afterValue
            );
            item.iconPath = new vscode.ThemeIcon('symbol-number', new vscode.ThemeColor('charts.yellow'));

            const afterItem = new RegisterTreeItem(
                `   ⮕ ${change.after}`,
                vscode.TreeItemCollapsibleState.None,
                'register-after',
                reg,
                afterValue,
            );
            afterItem.iconPath = new vscode.ThemeIcon('arrow-small-right', new vscode.ThemeColor('charts.yellow'));

            item.afterItem = afterItem;

            return item;
        } else {
            // No change, show current value
            label = `${reg} = ${formatValue(afterValue)}`;
        }

        const item = new RegisterTreeItem(
            label,
            vscode.TreeItemCollapsibleState.None,
            'register',
            reg,
            afterValue
        );

        // Set icon and color based on whether it changed
        if (change) {
            // Changed - yellow highlight
            item.iconPath = new vscode.ThemeIcon('symbol-number', new vscode.ThemeColor('charts.yellow'));
        } else if (afterValue.type === 'immediate') {
            item.iconPath = new vscode.ThemeIcon('symbol-number', new vscode.ThemeColor('charts.green'));
        } else if (afterValue.type === 'symbolic' || afterValue.type === 'binary') {
            item.iconPath = new vscode.ThemeIcon('symbol-operator', new vscode.ThemeColor('charts.blue'));
        } else if (afterValue.type === 'unknown') {
            item.iconPath = new vscode.ThemeIcon('question', new vscode.ThemeColor('charts.red'));
        } else {
            item.iconPath = new vscode.ThemeIcon('symbol-variable');
        }

        return item;
    }
}

/* function formatPerformanceInfo(perf: types.PerformanceInfo, cpu: string): string {
    let content = `**Performance (${cpu}):**\n\n`;
    const maxCycles = 10;
    const filled = Math.min(perf.latency, maxCycles);
    const empty = Math.max(0, maxCycles - filled);
    const dots = '●'.repeat(filled) + '○'.repeat(empty);

    content += `Latency: ${perf.latency} cycles${perf.latency !== 1 ? 's' : ''} \`[${dots}]\`\n\n`;
    content += `Throughput: ${perf.throughput.toFixed(2)} CPI\n\n`;
    content += `Ports: ${perf.ports.join(', ')}\n\n`;
    content += `Size: ${perf.sizeBytes} bytes\n\n`;

    return content;
}; */

/* function formatAlternatives(alternatives: types.Alternative[]): string {
    let content = `**Alternative Implementations:**\n\n`;

    alternatives.forEach((alt, idx) => {
        content += `**${idx + 1}. ${alt.description}**\n\n`;
        content += `Latency: ${alt.latency} cycles | Size: ${alt.instructions} instr, ${alt.sizeBytes} bytes\n\n`;
        content += '```gas-asm\n' + alt.code + '\n```\n\n';

        if (alt.notes && alt.notes.length > 0) {
            content += `*Notes:* ${alt.notes.join(', ')}\n\n`;
        }
        if (alt.tradeoffs) {
            content += `*Tradeoffs:* ${alt.tradeoffs}\n\n`;
        }

        content += `[Copy](command:gas-asm.copyCode?${encodeURIComponent(JSON.stringify({ code: alt.code }))})\n\n`;
        content += '---\n\n';
    });

    return content;
}*/

function createHoverProvider(): vscode.HoverProvider {
    return {
        provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
            const range = document.getWordRangeAtPosition(position, /[.%]?[a-zA-Z_][a-zA-Z0-9_().]*/);
            if (!range) {
                return null;
            }

            const word = document.getText(range);
            const line = document.lineAt(position).text;
            const trimmed = line.trim();

            const config = vscode.workspace.getConfiguration('gas-asm.performance');
            const targetCPU = config.get<string>('targetCPU', 'skylake');

            if (word === 'syscall') {
                const markdown = new vscode.MarkdownString();
                markdown.appendMarkdown('**System Call**\n\n');

                const fullState = analyzeRegisters(document, position.line);
                const raxValue = fullState.registers['%rax'];

                let syscallNum: number | null = null;
                if (raxValue && raxValue.type === 'immediate') {
                    syscallNum = raxValue.value;
                }

                if (syscallNum !== null && LINUX_SYSCALLS.has(syscallNum)) {
                    const syscallInfo = LINUX_SYSCALLS.get(syscallNum)!;

                    markdown.appendMarkdown(`**Syscall \`${syscallInfo.name}\` (${syscallNum})**\n\n`);
                    markdown.appendMarkdown(`${syscallInfo.description}\n\n`);

                    if (syscallInfo.parameters.length > 0) {
                        markdown.appendMarkdown('**Parameters:**\n```\n');
                        syscallInfo.parameters.forEach(param => {
                            markdown.appendMarkdown(`${param}\n`);
                        });
                        markdown.appendMarkdown('```\n\n');

                        markdown.appendMarkdown('**Current arguments:**\n```\n');
                        const argRegs = ['%rdi', '%rsi', '%rdx', '%r10', '%r8', '%r9'];
                        syscallInfo.parameters.forEach((_param, i) => {
                            const reg = argRegs[i];
                            const val = fullState.registers[reg];
                            if (val) {
                                markdown.appendMarkdown(`${reg} = ${formatValue(val)}\n`);
                            }
                        });
                    } else {
                        markdown.appendMarkdown('**Parameters:** None\n\n');
                    }

                    markdown.appendMarkdown(`**Returns:** ${syscallInfo.returns}\n\n`);

                    if (syscallInfo.errors) {
                        markdown.appendMarkdown(`**Errors:** ${syscallInfo.errors}\n\n`);
                    }
                } else {
                    markdown.appendMarkdown(`**Syscall Numer:** ${syscallNum !== null ? syscallNum : 'unknown'}\n\n`);
                    if (syscallNum === null) {
                        markdown.appendMarkdown('*Cannot determine syscall number: %rax value is not known\n');
                    } else {
                        markdown.appendMarkdown('*Syscall number not recognized*\n');
                    }
                }
                return new vscode.Hover(markdown);
            }

            const callMatch = line.match(/^\s*call[q]?\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (callMatch && callMatch[1] === word) {
                const functionInfo = analyzeFunctionInterface(document, word);

                const markdown = new vscode.MarkdownString();

                if (functionInfo) {
                    const infoLines = formatFunctionInfo(functionInfo);
                    infoLines.forEach(line => markdown.appendMarkdown(line + '\n'));
                } else {
                    markdown.appendMarkdown(`**Function Call: \`${word}\`**\n\n`);
                    markdown.appendMarkdown('*External function or definition not found in current file*\n\n');

                    // Show System V AMD64 ABI info
                    markdown.appendMarkdown('**Standard Calling Convention (System V AMD64 ABI):**\n');
                    markdown.appendMarkdown('```\n');
                    markdown.appendMarkdown('Parameters: %rdi, %rsi, %rdx, %rcx, %r8, %r9\n');
                    markdown.appendMarkdown('Return: %rax (integer), %xmm0 (float)\n');
                    markdown.appendMarkdown('Clobbered: %rax, %rcx, %rdx, %rsi, %rdi, %r8-%r11\n');
                    markdown.appendMarkdown('Preserved: %rbx, %rbp, %r12-%r15\n');
                    markdown.appendMarkdown('```\n');
                }

                return new vscode.Hover(markdown);
            }

            // Check for directives
            if (word.startsWith('.')) {
                const directiveInfo = directiveDatabase.get(word);
                if (directiveInfo) {
                    const markdown = new vscode.MarkdownString();
                    markdown.appendMarkdown(`**${word}**\n\n`);
                    markdown.appendMarkdown(`${directiveInfo.description}\n\n`);
                    if (directiveInfo.usage) {
                        markdown.appendCodeblock(directiveInfo.usage, 'gas-asm');
                    }
                    return new vscode.Hover(markdown);
                }
            }

            if (word.startsWith('%')) {
                const registerInfo = registerDatabase.get(word);
                const markdown = new vscode.MarkdownString();

                if (registerInfo) {
                    markdown.appendMarkdown(`**${word}** (${registerInfo.size}-bit)\n\n`);
                    markdown.appendMarkdown(`${registerInfo.description}\n\n`);
                    markdown.appendMarkdown(`*Type:* ${registerInfo.type}\n\n`);
                }

                const fullState = analyzeRegisters(document, position.line);
                const normalizedReg = normalizeRegister(word);
                const regCategory = getRegisterCategory(word);
                const value = fullState.registers[normalizedReg];

                if (value) {
                    markdown.appendMarkdown('---\n\n');
                    markdown.appendMarkdown(`**Current Value:**\n\n`);

                    const formattedValue = formatValue(value);
                    markdown.appendCodeblock(formattedValue, 'text');

                    const allStates: string[] = [];
                    for (const [reg, val] of Object.entries(fullState.registers)) {
                        if (val.type !== 'unknown') {
                            const thisCategory = getRegisterCategory(reg);
                            // Show GPR with GPR, SIMD with SIMD, etc.
                            if (thisCategory === regCategory || regCategory === 'gpr') {
                                allStates.push(`${reg} = ${formatValue(val)}`);
                            }
                        }
                    }

                    if (allStates.length > 1) {
                        const categoryName = regCategory === 'gpr' ? 'general purpose registers' :
                            regCategory === 'simd' ? 'SIMD registers' :
                                regCategory === 'fpu' ? 'FPU registers' : 'registers';
                        markdown.appendMarkdown(`\n*All known ${categoryName} at this point:*\n\n`);
                        markdown.appendCodeblock(allStates.join('\n'), 'text');
                    }

                    const stackLines = formatStack(fullState.stack);
                    if (stackLines.length > 0) {
                        markdown.appendMarkdown('\n');
                        stackLines.forEach(line => markdown.appendMarkdown(line + '\n'));
                    }

                    // Show memory state (only stack/frame-relative addresses for clarity)
                    const memoryItems = Object.entries(fullState.memory).filter(([addr]) =>
                        addr.includes('%rsp') || addr.includes('%rbp')
                    );
                    if (memoryItems.length > 0) {
                        markdown.appendMarkdown('\n**Memory (stack frame):**\n\n');
                        markdown.appendCodeblock(
                            memoryItems.map(([addr, val]) => `${addr} = ${formatValue(val)}`).join('\n'),
                            'text'
                        );
                    }

                    // Show other memory separately if present
                    const otherMemory = Object.entries(fullState.memory).filter(([addr]) =>
                        !addr.includes('%rsp') && !addr.includes('%rbp')
                    );
                    if (otherMemory.length > 0 && otherMemory.length <= 3) {
                        markdown.appendMarkdown('\n**Other Memory:**\n\n');
                        markdown.appendCodeblock(
                            otherMemory.map(([addr, val]) => `*${addr} = ${formatValue(val)}`).join('\n'),
                            'text'
                        );
                    }

                    // Show flag state
                    const flagStr = formatFlags(fullState.flags);
                    if (flagStr) {
                        markdown.appendMarkdown(`\n**Flags:** ${flagStr}\n`);
                    }
                }

                return new vscode.Hover(markdown);
            }

            const instructionInfo = instructionDatabase.get(word);
            if (instructionInfo) {
                const markdown = new vscode.MarkdownString();

                // Check if we're on an instruction line
                const instrMatch = trimmed.match(/^\s*([a-zA-Z][a-zA-Z0-9]*)\s+(.+?)(?:\s*#.*)?$/);
                if (instrMatch && instrMatch[1].toLowerCase() === word.toLowerCase()) {
                    // We're hovering over an instruction on an instruction line - show state changes

                    // Get state before and after this instruction
                    const stateBefore = position.line > 0 ? analyzeRegisters(document, position.line - 1) : {
                        registers: {},
                        memory: {},
                        stack: { items: [] as types.RegisterValue[], offset: 0 },
                        flags: {},
                        fpuStack: { stack: Array(8).fill({ type: 'unknown' }), top: 0, statusWord: {} }
                    };
                    const stateAfter = analyzeRegisters(document, position.line);

                    // Find what changed
                    const changes: { type: 'register' | 'flag' | 'stack' | 'memory', name: string, before: string, after: string }[] = [];

                    // Check register changes
                    for (const [reg, afterVal] of Object.entries(stateAfter.registers)) {
                        const beforeVal = (stateBefore.registers as any)[reg];
                        const afterStr = formatValue(afterVal);
                        const beforeStr = beforeVal ? formatValue(beforeVal) : 'undefined';

                        if (!beforeVal || formatValue(beforeVal) !== afterStr) {
                            changes.push({
                                type: 'register',
                                name: reg,
                                before: beforeStr,
                                after: afterStr
                            });
                        }
                    }

                    // Check flag changes
                    for (const [flag, afterCond] of Object.entries(stateAfter.flags)) {
                        const beforeCond = (stateBefore.flags as any)[flag];
                        if (beforeCond !== afterCond) {
                            changes.push({
                                type: 'flag',
                                name: flag,
                                before: beforeCond || 'undefined',
                                after: afterCond
                            });
                        }
                    }

                    // Check stack changes
                    if (stateAfter.stack.items.length !== stateBefore.stack.items.length) {
                        changes.push({
                            type: 'stack',
                            name: 'Stack',
                            before: `${stateBefore.stack.items.length} items`,
                            after: `${stateAfter.stack.items.length} items`
                        });
                    }

                    // Check memory changes
                    for (const [addr, afterVal] of Object.entries(stateAfter.memory)) {
                        const beforeVal = stateBefore.memory[addr as keyof typeof stateBefore.memory];
                        const afterStr = formatValue(afterVal);
                        const beforeStr = beforeVal ? formatValue(beforeVal) : 'undefined';

                        if (!beforeVal || formatValue(beforeVal) !== afterStr) {
                            changes.push({
                                type: 'memory',
                                name: `*${addr}`,
                                before: beforeStr,
                                after: afterStr
                            });
                        }
                    }

                    // If we found changes, show them first
                    if (changes.length > 0) {
                        markdown.appendMarkdown(`**${word}** - State Changes\n\n`);

                        // Group by type
                        const registerChanges = changes.filter(c => c.type === 'register');
                        const flagChanges = changes.filter(c => c.type === 'flag');
                        const stackChanges = changes.filter(c => c.type === 'stack');
                        const memoryChanges = changes.filter(c => c.type === 'memory');

                        if (registerChanges.length > 0) {
                            markdown.appendMarkdown('**Registers:**\n```\n');
                            registerChanges.forEach(change => {
                                markdown.appendMarkdown(`${change.name}: ${change.before} => ${change.after}\n`);
                            });
                            markdown.appendMarkdown('```\n\n');
                        }

                        if (flagChanges.length > 0) {
                            markdown.appendMarkdown('**Flags:**\n```\n');
                            flagChanges.forEach(change => {
                                markdown.appendMarkdown(`${change.name}: ${change.before} => ${change.after}\n`);
                            });
                            markdown.appendMarkdown('```\n\n');
                        }

                        if (stackChanges.length > 0) {
                            markdown.appendMarkdown('**Stack:**\n```\n');
                            stackChanges.forEach(change => {
                                markdown.appendMarkdown(`${change.before} => ${change.after}\n`);
                            });
                            markdown.appendMarkdown('```\n\n');
                        }

                        if (memoryChanges.length > 0) {
                            markdown.appendMarkdown('**Memory:**\n```\n');
                            memoryChanges.forEach(change => {
                                markdown.appendMarkdown(`${change.name}: ${change.before} => ${change.after}\n`);
                            });
                            markdown.appendMarkdown('```\n\n');
                        }

                        markdown.appendMarkdown('---\n\n');
                    }
                }

                // Show instruction info
                markdown.appendMarkdown(`**${word}** - ${instructionInfo.description}\n\n`);
                markdown.appendCodeblock(`${word} ${instructionInfo.operands}`, 'gas-asm');
                if (instructionInfo.category) {
                    markdown.appendMarkdown(`\n*Category:* ${instructionInfo.category}`);
                }
                if (instructionInfo.flags) {
                    markdown.appendMarkdown(`\n\n*Flags Affected:* ${instructionInfo.flags}`);
                }

                if (instructionInfo.performance) {
                    const perf = instructionInfo.performance[targetCPU];
                    if (perf) {
                        markdown.appendMarkdown(`\n\n*Performance (${targetCPU}):* `);
                        markdown.appendMarkdown(`${perf.latency}cy latency, ${perf.throughput.toFixed(2)} CPI, ${perf.sizeBytes}B`);
                    }
                }

                if (instructionInfo.alternatives && instructionInfo.alternatives.length > 0) {
                    markdown.appendMarkdown(`\n\n[View ${instructionInfo.alternatives.length} alternative${instructionInfo.alternatives.length > 1 ? 's' : ''}](command:gas-asm.showAlternatives?${encodeURIComponent(JSON.stringify({ instruction: word }))})`);
                }

                markdown.isTrusted = true;
                return new vscode.Hover(markdown);
            }

            return null;
        }
    };
}

function formatFunctionInfo(info: types.FunctionInfo): string[] {
    const lines: string[] = [];

    lines.push(`**Function: \`${info.name}\`**\n`);

    if (info.parametersUsed.length > 0) {
        lines.push('**Parameters (detected):**');
        lines.push('```');
        info.parametersUsed.forEach((reg, i) => {
            lines.push(`  arg${i + 1}: ${reg}`);
        });
        lines.push('```\n');
    } else {
        lines.push('**Parameters:** None detected\n');
    }

    // Return values
    if (info.returnRegisters.length > 0) {
        lines.push('**Returns:**');
        lines.push('```');
        info.returnRegisters.forEach(reg => {
            lines.push(`  ${reg}`);
        });
        lines.push('```\n');
    } else {
        lines.push('**Returns:** void\n');
    }

    // Clobbers
    const callerSavedClobbered = info.registersClobbered.filter(r =>
        CALLER_SAVED.includes(r)
    );
    const calleeSavedClobbered = info.registersClobbered.filter(r =>
        CALLEE_SAVED.includes(r)
    );

    if (callerSavedClobbered.length > 0 || calleeSavedClobbered.length > 0) {
        lines.push('**Clobbers:**');
        lines.push('```');
        if (callerSavedClobbered.length > 0) {
            lines.push(`  Caller-saved: ${callerSavedClobbered.join(', ')}`);
        }
        if (calleeSavedClobbered.length > 0) {
            lines.push(`  Callee-saved: ${calleeSavedClobbered.join(', ')}`);
        }
        lines.push('```\n');
    }

    // Calls other functions
    if (info.callsOthers.length > 0) {
        lines.push(`**Calls:** ${info.callsOthers.join(', ')}\n`);
    }

    lines.push(`*Lines ${info.startLine + 1}-${info.endLine + 1}*`);

    return lines;
}

function evaluateBinary(op: string, left: types.RegisterValue, right: types.RegisterValue): types.RegisterValue {
    if (left.type === 'immediate' && right.type === 'immediate') {
        let result: number;
        switch (op) {
            case '+': result = left.value + right.value; break;
            case '-': result = left.value - right.value; break;
            case '*': result = left.value * right.value; break;
            case '&': result = left.value & right.value; break;
            case '|': result = left.value | right.value; break;
            case '^': result = left.value ^ right.value; break;
            case '<<': result = left.value << right.value; break;
            case '>>': result = left.value >> right.value; break;
            default: return { type: 'binary', op, left, right };
        }
        return { type: 'immediate', value: result };
    }
    return { type: 'binary', op, left, right };
}

function analyzeRegisters(document: vscode.TextDocument, targetLine: number): types.FullState {
    const state: types.FullState = {
        registers: {},
        memory: {},
        stack: { items: [], offset: 0 },
        flags: {},
        fpuStack: {
            stack: new Array(8).fill({ type: 'unknown' }),
            top: 0,
            statusWord: {}
        }
    };

    let functionStart = 0;
    for (let i = targetLine; i >= 0; i--) {
        const line = document.lineAt(i).text.trim();
        if (line.match(/^[a-zA-Z_][a-zA-Z0-9_]*:\s*$/)) {
            functionStart = i + 1;
            break;
        }
    }

    // Analyze ffrom function start to target line
    for (let i = functionStart; i <= targetLine; i++) {
        const line = document.lineAt(i).text;
        const trimmed = line.trim();

        if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.length === 0) {
            continue;
        }

        // Skip labels
        if (trimmed.match(/^[a-zA-Z0-9_.]+:\s*$/)) {
            continue;
        }

        // Skip directives
        if (trimmed.startsWith('.')) {
            continue;
        }

        const instrMatch = trimmed.match(/^\s*([a-zA-Z][a-zA-Z0-9]*)\s+(.+?)(?:\s*#.*)?$/);
        if (!instrMatch) continue;

        const instr = instrMatch[1].toLowerCase();
        const operands = instrMatch[2].split(',').map(s => s.trim());

        if (instr.match(/^push[bwlq]?$/)) {
            // push src - decrements %rsp and stores value
            if (operands.length === 1) {
                const src = parseOperand(operands[0]);
                state.stack.items.push(src);
                state.stack.offset -= 8; // Assuming 64-bit pushes
                // Update %rsp
                const rspVal = state.registers['%rsp'] || { type: 'symbolic', expr: '%rsp' };
                state.registers['%rsp'] = evaluateBinary('-', rspVal, { type: 'immediate', value: 8 });
            }
        } else if (instr.match(/^pop[bwlq]?$/)) {
            // pop dest - loads from stack and increments %rsp
            if (operands.length === 1 && operands[0].startsWith('%')) {
                const rawDestReg = operands[0];
                if (state.stack.items.length > 0) {
                    setRegister(state, rawDestReg, state.stack.items.pop()!);
                    state.stack.offset += 8;
                } else {
                    setRegister(state, rawDestReg, { type: 'unknown' });
                }
                // Update %rsp
                const rspVal = state.registers['%rsp'] || { type: 'symbolic', expr: '%rsp' };
                state.registers['%rsp'] = evaluateBinary('+', rspVal, { type: 'immediate', value: 8 });
            }
        }

        // Handle memory operations
        else if (instr.startsWith('mov') && !instr.match(/^mov(aps|ups|apd|upd|ss|sd|dqa|dqu)$/)) {
            // Memory store: mov src, (%reg) or mov src, offset(%reg)
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const dest = operands[1];

                // Check if destination is memory
                const memMatch = dest.match(/^(-?\d+)?\((%[a-z0-9]+)(?:,\s*(%[a-z0-9]+)(?:,\s*([1248]))?)?\)$/);
                if (memMatch) {
                    const offset = memMatch[1] ? parseInt(memMatch[1]) : 0;
                    const baseReg = normalizeRegister(memMatch[2]);
                    const indexReg = memMatch[3] ? normalizeRegister(memMatch[3]) : null;
                    const scale = memMatch[4] ? parseInt(memMatch[4]) : 1;

                    const baseVal = state.registers[baseReg] || { type: 'symbolic', expr: baseReg };
                    const indexVal = indexReg ? (state.registers[indexReg] || { type: 'symbolic', expr: indexReg }) : null;

                    if (baseVal.type === 'immediate' && (!indexVal || indexVal.type === 'immediate')) {
                        let addr = baseVal.value + offset;
                        if (indexVal && indexVal.type === 'immediate') {
                            addr += indexVal.value * scale;
                        }

                        const memKey = `0x${addr.toString(16)}`;
                        state.memory[memKey] = src;
                    } else {
                        let addrExpr = formatValue(baseVal);
                        if (offset !== 0) {
                            addrExpr += offset > 0 ? ` + ${offset}` : ` - ${-offset}`;
                        }
                        if (indexVal) {
                            if (scale === 1) {
                                addrExpr += ` + ${formatValue(indexVal)}`;
                            } else {
                                addrExpr += ` + ${formatValue(indexVal)} * ${scale}`;
                            }
                        }
                        state.memory[addrExpr] = src;
                    }
                    continue;
                }

                // Memory load: mov (%reg), dest or mov offset(%reg), dest
                const srcMemMatch = operands[0].match(/^(-?\d+)?\((%[a-z0-9]+)\)$/);
                if (srcMemMatch && operands[1].startsWith('%')) {
                    const offset = srcMemMatch[1] ? parseInt(srcMemMatch[1]) : 0;
                    const baseReg = normalizeRegister(srcMemMatch[2]);
                    const baseVal = state.registers[baseReg] || { type: 'symbolic', expr: baseReg };

                    let addr: types.RegisterValue;
                    if (offset === 0) {
                        addr = baseVal;
                    } else {
                        addr = evaluateBinary('+', baseVal, { type: 'immediate', value: offset });
                    }

                    const rawDestReg = operands[1];
                    const memKey = getMemoryKey(addr);

                    if (memKey && state.memory[memKey]) {
                        setRegister(state, rawDestReg, state.memory[memKey]);
                    } else {
                        setRegister(state, rawDestReg, { type: 'memory', addr });
                    }
                    continue;
                }

                // Regular register move
                if (operands[1].startsWith('%')) {
                    const rawDestReg = operands[1];
                    setRegister(state, rawDestReg, src);
                }
            }
        }

        // Handle comparison and set flags
        else if (instr.match(/^cmp[bwlq]?$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const dest = parseOperand(operands[1]);

                if (src.type === 'immediate' && dest.type === 'immediate') {
                    const result = dest.value - src.value;

                    state.flags.ZF = result === 0 ? '1' : '0';
                    state.flags.CF = dest.value < src.value ? '1' : '0';
                    state.flags.SF = result < 0 ? '1' : '0';
                    state.flags.OF = ((dest.value ^ src.value) & (dest.value ^ result)) < 0 ? '1' : '0';
                } else {
                    const destStr = dest.type === 'register' ? formatValue(state.registers[normalizeRegister(dest.reg)] || dest) : formatValue(dest);
                    const srcStr = formatValue(src);

                    state.flags.ZF = `${destStr} == ${srcStr}`;
                    state.flags.CF = `${destStr} < ${srcStr} (unsigned)`;
                    state.flags.SF = `${destStr} < ${srcStr} (signed)`;
                }
            }
        } else if (instr.match(/^test[bwlq]?$/)) {
            // test src, dest - computes dest & src and sets flags
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const dest = parseOperand(operands[1]);

                if (src.type === 'immediate' && dest.type === 'immediate') {
                    const result = dest.value & src.value;

                    state.flags.ZF = result === 0 ? '1' : '0';
                    state.flags.SF = result < 0 ? '1' : '0';
                    state.flags.CF = '0';
                    state.flags.OF = '0';
                } else {
                    const destStr = dest.type === 'register' ? formatValue(state.registers[normalizeRegister(dest.reg)] || dest) : formatValue(dest);
                    const srcStr = formatValue(src);

                    state.flags.ZF = `(${destStr} & ${srcStr}) == 0`;
                    state.flags.SF = `(${destStr} & ${srcStr}) < 0`;
                    state.flags.CF = '0';
                    state.flags.OF = '0';
                }
            }
        } else if (instr.match(/^add[bwlq]?$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(rawDestReg);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (currentVal.type === 'immediate' && src.type === 'immediate') {
                    const bits = instr.endsWith('b') ? 8 : instr.endsWith('w') ? 16 : instr.endsWith('l') ? 32 : 64;
                    const maxVal = bits === 64 ? Number.MAX_SAFE_INTEGER : (1 << bits) - 1;
                    const signBit = 1 << (bits - 1);

                    const result = currentVal.value + src.value;
                    const maskedResult = result & maxVal;

                    setRegister(state, rawDestReg, { type: 'immediate', value: maskedResult });

                    state.flags.ZF = maskedResult === 0 ? '1' : '0';
                    state.flags.SF = (maskedResult & signBit) ? '1' : '0';
                    state.flags.CF = result > maxVal ? '1' : '0';

                    const srcSign = src.value & signBit;
                    const destSign = currentVal.value & signBit;
                    const resultSign = maskedResult & signBit;
                    state.flags.OF = (srcSign === destSign && srcSign !== resultSign) ? '1' : '0';

                    state.flags.AF = ((currentVal.value & 0xF) + (src.value & 0xF)) > 0xF ? '1' : '0';
                } else {
                    setRegister(state, rawDestReg, evaluateBinary('+', currentVal, src));
                    state.flags.ZF = 'result == 0';
                    state.flags.SF = 'result < 0';
                    state.flags.CF = 'carry';
                    state.flags.OF = 'overflow';
                }
            }
        } else if (instr.match(/^sub[bwlq]?$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (currentVal.type === 'immediate' && src.type === 'immediate') {
                    const bits = instr.endsWith('b') ? 8 : instr.endsWith('w') ? 16 : instr.endsWith('l') ? 32 : 64;
                    const maxVal = bits === 64 ? Number.MAX_SAFE_INTEGER : (1 << bits) - 1;
                    const signBit = 1 << (bits - 1);

                    const result = currentVal.value - src.value;
                    const maskedResult = result & maxVal;

                    setRegister(state, rawDestReg, { type: 'immediate', value: maskedResult });

                    state.flags.ZF = maskedResult === 0 ? '1' : '0';
                    state.flags.SF = (maskedResult & signBit) ? '1' : '0';
                    state.flags.CF = currentVal.value < src.value ? '1' : '0';

                    const srcSign = src.value & signBit;
                    const destSign = currentVal.value & signBit;
                    const resultSign = maskedResult & signBit;
                    state.flags.OF = (srcSign !== destSign && resultSign === srcSign) ? '1' : '0';

                    state.flags.AF = ((currentVal.value & 0xF) - (src.value & 0xF)) < 0 ? '1' : '0';
                } else {
                    setRegister(state, rawDestReg, evaluateBinary('-', currentVal, src));
                    state.flags.ZF = 'result == 0';
                    state.flags.SF = 'result < 0';
                    state.flags.CF = 'borrow';
                    state.flags.OF = 'overflow';
                }
            }
        } else if (instr.startsWith('lea')) {
            if (operands.length === 2) {
                const rawDestReg = operands[1];
                const src = operands[0];

                const complexMatch = src.match(/^(-?\d+)?\((%[a-z0-9]+)(?:,\s*(%a-z0-9+)(?:,\s*([1248]))?)?\)$/);
                if (complexMatch) {
                    const offset = complexMatch[1] ? parseInt(complexMatch[1]) : 0;
                    const baseReg = normalizeRegister(complexMatch[2]);
                    const indexReg = complexMatch[3] ? normalizeRegister(complexMatch[3]) : null;
                    const scale = complexMatch[4] ? parseInt(complexMatch[4]) : 1;

                    const baseVal = state.registers[baseReg] || { type: 'unknown' };
                    const indexVal = indexReg ? (state.registers[indexReg] || { type: 'unknown' }) : null;

                    if (baseVal.type === 'immediate' && (!indexVal || indexVal.type === 'immediate')) {
                        let result = baseVal.value + offset;
                        if (indexVal && indexVal.type === 'immediate') {
                            result += indexVal.value * scale;
                        }
                        setRegister(state, rawDestReg, { type: 'immediate', value: result });
                    } else {
                        let expr = formatValue(baseVal);
                        if (offset !== 0) {
                            expr += offset > 0 ? ` + ${offset}` : ` - ${-offset}`;
                        }
                        if (indexVal) {
                            if (scale === 1) {
                                expr += ` + ${formatValue(indexVal)}`;
                            } else {
                                expr += ` + ${formatValue(indexVal)} * ${scale}`;
                            }
                        }
                        setRegister(state, rawDestReg, { type: 'symbolic', expr });
                    }
                } else {
                    setRegister(state, rawDestReg, { type: 'symbolic', expr: `&${src}` });
                }
            }
        } else if (instr.startsWith('add')) {
            // add src, dest - dest = dest + src
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                setRegister(state, rawDestReg, evaluateBinary('+', currentVal, src));
                // Set flags
                state.flags.ZF = `result == 0`;
                state.flags.SF = `result < 0`;
            }
        } else if (instr.startsWith('sub')) {
            // sub src, dest - dest = dest - src
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                setRegister(state, rawDestReg, evaluateBinary('-', currentVal, src));
                // Set flags
                state.flags.ZF = `result == 0`;
                state.flags.SF = `result < 0`;
            }
        } else if (instr.match(/^(imul)[bwlq]?$/)) {
            if (operands.length === 1) {
                const src = parseOperand(operands[0]);
                const raxVal = state.registers['%rax'] || { type: 'unknown' };

                if (raxVal.type === 'immediate' && src.type === 'immediate') {
                    const bits = instr.endsWith('b') ? 8 : instr.endsWith('w') ? 16 : instr.endsWith('l') ? 32 : 64;
                    const result = BigInt(raxVal.value) * BigInt(src.value);
                    const lowMask = (1n << BigInt(bits)) - 1n;

                    const low = Number(result & lowMask);
                    const high = Number(result >> BigInt(bits));

                    state.registers['%rax'] = { type: 'immediate', value: low };
                    state.registers['%rdx'] = { type: 'immediate', value: high };

                    const signExtended = low < 0 ? -1 : 0;
                    state.flags.CF = high !== signExtended ? '1' : '0';
                    state.flags.OF = high !== signExtended ? '1' : '0';
                } else {
                    state.registers['%rax'] = evaluateBinary('*', raxVal, src);
                    state.registers['%rdx'] = { type: 'symbolic', expr: 'high_bits' };
                    state.flags.OF = 'overflow';
                    state.flags.CF = 'carry';
                }
            } else if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (currentVal.type === 'immediate' && src.type === 'immediate') {
                    const bits = instr.endsWith('b') ? 8 : instr.endsWith('w') ? 16 : instr.endsWith('l') ? 32 : 64;
                    const result = currentVal.value * src.value;
                    const maskedResult = result & ((1 << bits) - 1);

                    setRegister(state, rawDestReg, { type: 'immediate', value: maskedResult });

                    state.flags.CF = result !== maskedResult ? '1' : '0';
                    state.flags.OF = result !== maskedResult ? '1' : '0';
                } else {
                    setRegister(state, rawDestReg, evaluateBinary('*', currentVal, src));
                    state.flags.OF = 'overflow';
                    state.flags.CF = 'carry';
                }
            } else if (operands.length === 3) {
                const src1 = parseOperand(operands[0]);
                const src2 = parseOperand(operands[1]);
                const rawDestReg = operands[2];

                if (src1.type === 'immediate' && src2.type === 'immediate') {
                    const bits = instr.endsWith('b') ? 8 : instr.endsWith('w') ? 16 : instr.endsWith('l') ? 32 : 64;
                    const result = src1.value * src2.value;
                    const maskedResult = result & ((1 << bits) - 1);

                    setRegister(state, rawDestReg, { type: 'immediate', value: maskedResult });

                    state.flags.CF = result !== maskedResult ? '1' : '0';
                    state.flags.OF = result !== maskedResult ? '1' : '0';
                } else {
                    setRegister(state, rawDestReg, evaluateBinary('*', src1, src2));
                    state.flags.OF = 'overflow';
                    state.flags.CF = 'carry';
                }
            }
        } else if (instr.match(/^(mul)[bwlq]?$/)) {
            if (operands.length === 1) {
                const src = parseOperand(operands[0]);
                const raxVal = state.registers['%rax'] || { type: 'unknown' };

                if (raxVal.type === 'immediate' && src.type === 'immediate') {
                    const bits = instr.endsWith('b') ? 8 : instr.endsWith('w') ? 16 : instr.endsWith('l') ? 32 : 64;
                    const result = BigInt(raxVal.value >>> 0) * BigInt(src.value >>> 0);
                    const lowMask = (1n << BigInt(bits)) - 1n;

                    const low = Number(result & lowMask);
                    const high = Number(result >> BigInt(bits));

                    state.registers['%rax'] = { type: 'immediate', value: low };
                    state.registers['%rdx'] = { type: 'immediate', value: high };

                    state.flags.CF = high !== 0 ? '1' : '0';
                    state.flags.OF = high !== 0 ? '1' : '0';
                } else {
                    state.registers['%rax'] = evaluateBinary('*', raxVal, src);
                    state.registers['%rdx'] = { type: 'symbolic', expr: 'high_bits' };
                    state.flags.OF = 'overflow';
                    state.flags.CF = 'carry';
                }
            }
        } else if (instr.match(/^(div)[bwlq]?$/)) {
            if (operands.length === 1) {
                const divisor = parseOperand(operands[0]);
                const raxVal = state.registers['%rax'] || { type: 'unknown' };
                const rdxVal = state.registers['%rdx'] || { type: 'immediate', value: 0 };

                if (raxVal.type === 'immediate' && rdxVal.type === 'immediate' && divisor.type === 'immediate' && divisor.value !== 0) {
                    const bits = instr.endsWith('b') ? 8 : instr.endsWith('w') ? 16 : instr.endsWith('l') ? 32 : 64;
                    const dividend = (BigInt(rdxVal.value >>> 0) << BigInt(bits)) | BigInt(raxVal.value >>> 0);
                    const divisorBig = BigInt(divisor.value >>> 0);

                    if (divisorBig !== 0n) {
                        const quotient = Number(dividend / divisorBig);
                        const remainder = Number(dividend % divisorBig);

                        state.registers['%rax'] = { type: 'immediate', value: quotient };
                        state.registers['%rdx'] = { type: 'immediate', value: remainder };
                    } else {
                        // Division by zero, result is undefined
                        state.registers['%rax'] = { type: 'unknown' };
                        state.registers['%rdx'] = { type: 'unknown' };
                    }
                } else {
                    state.registers['%rax'] = { type: 'symbolic', expr: `${formatValue(raxVal)} / ${formatValue(divisor)}` };
                    state.registers['%rdx'] = { type: 'symbolic', expr: `${formatValue(raxVal)} % ${formatValue(divisor)}` };
                }

                // Flags undef after div
                state.flags = {};
            }
        } else if (instr.match(/^(idiv)[bwlq]?$/)) {
            if (operands.length === 1) {
                const divisor = parseOperand(operands[0]);
                const raxVal = state.registers['%rax'] || { type: 'unknown' };
                const rdxVal = state.registers['%rdx'] || { type: 'immediate', value: 0 };

                if (raxVal.type === 'immediate' && rdxVal.type === 'immediate' && divisor.type === 'immediate' && divisor.value !== 0) {
                    const bits = instr.endsWith('b') ? 8 : instr.endsWith('w') ? 16 : instr.endsWith('l') ? 32 : 64;

                    const dividendLow = BigInt(raxVal.value);
                    const dividendHigh = BigInt(rdxVal.value);
                    const dividend = (dividendHigh << BigInt(bits)) | (dividendLow & ((1n << BigInt(bits)) - 1n));
                    const divisorBig = BigInt(divisor.value);

                    if (divisorBig !== 0n) {
                        const quotient = dividend / divisorBig;
                        const remainder = dividend % divisorBig;

                        state.registers['%rax'] = { type: 'immediate', value: Number(quotient) };
                        state.registers['%rdx'] = { type: 'immediate', value: Number(remainder) };
                    } else {
                        state.registers['%rax'] = { type: 'unknown' };
                        state.registers['%rdx'] = { type: 'unknown' };
                    }
                } else {
                    state.registers['%rax'] = { type: 'symbolic', expr: `${formatValue(raxVal)} / ${formatValue(divisor)}` };
                    state.registers['%rdx'] = { type: 'symbolic', expr: `${formatValue(raxVal)} % ${formatValue(divisor)}` };
                }
            }
            state.flags = {};
        }
        else if (instr.match(/^(inc)[bwlq]?$/)) {
            if (operands.length === 1) {
                const rawDestReg = operands[0];
                const destReg = normalizeRegister(operands[0]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                if (currentVal.type === 'immediate') {
                    const bits = instr.endsWith('b') ? 8 : instr.endsWith('w') ? 16 : instr.endsWith('l') ? 32 : 64;
                    const maxVal = bits === 64 ? Number.MAX_SAFE_INTEGER : (1 << bits) - 1;
                    const signBit = 1 << (bits - 1);

                    const result = currentVal.value + 1;
                    const maskedResult = result & maxVal;

                    setRegister(state, rawDestReg, { type: 'immediate', value: maskedResult });

                    state.flags.ZF = maskedResult === 0 ? '1' : '0';
                    state.flags.SF = (maskedResult & signBit) ? '1' : '0';

                    state.flags.OF = currentVal.value === (signBit - 1) ? '1' : '0';
                    state.flags.AF = (currentVal.value & 0xF) === 0xF ? '1' : '0';
                } else {
                    setRegister(state, rawDestReg, evaluateBinary('+', currentVal, { type: 'immediate', value: 1 }));
                    state.flags.ZF = 'result == 0';
                    state.flags.SF = 'result < 0';
                    state.flags.OF = 'overflow';
                }
            }
        } else if (instr.match(/^(dec)[bwlq]?$/)) {
            if (operands.length === 1) {
                const rawDestReg = operands[0];
                const destReg = normalizeRegister(operands[0]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (currentVal.type === 'immediate') {
                    const bits = instr.endsWith('b') ? 8 : instr.endsWith('w') ? 16 : instr.endsWith('l') ? 32 : 64;
                    const maxVal = bits === 64 ? Number.MAX_SAFE_INTEGER : (1 << bits) - 1;
                    const signBit = 1 << (bits - 1);

                    const result = currentVal.value - 1;
                    const maskedResult = result & maxVal;

                    setRegister(state, rawDestReg, { type: 'immediate', value: maskedResult });

                    state.flags.ZF = maskedResult === 0 ? '1' : '0';
                    state.flags.SF = (maskedResult & signBit) ? '1' : '0';
                    state.flags.OF = currentVal.value === signBit ? '1' : '0';
                    state.flags.AF = (currentVal.value & 0xF) === 0 ? '1' : '0';
                } else {
                    setRegister(state, rawDestReg, evaluateBinary('-', currentVal, { type: 'immediate', value: 1 }));
                    state.flags.ZF = 'result == 0';
                    state.flags.SF = 'result < 0';
                    state.flags.OF = 'overflow';
                }
            }
        } else if (instr.match(/^(neg)[bwlq]?$/)) {
            if (operands.length === 1) {
                const rawDestReg = operands[0];
                const destReg = normalizeRegister(operands[0]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                if (currentVal.type === 'immediate') {
                    const bits = instr.endsWith('b') ? 8 : instr.endsWith('w') ? 16 : instr.endsWith('l') ? 32 : 64;
                    const maxVal = bits === 64 ? Number.MAX_SAFE_INTEGER : (1 << bits) - 1;
                    const signBit = 1 << (bits - 1);

                    const result = (-currentVal.value) & maxVal;

                    setRegister(state, rawDestReg, { type: 'immediate', value: result });

                    state.flags.ZF = result === 0 ? '1' : '0';
                    state.flags.SF = (result & signBit) ? '1' : '0';
                    state.flags.CF = currentVal.value !== 0 ? '1' : '0';
                    state.flags.OF = currentVal.value === signBit ? '1' : '0';
                } else {
                    setRegister(state, rawDestReg, { type: 'symbolic', expr: `-${formatValue(currentVal)}` });
                    state.flags.ZF = 'result == 0';
                    state.flags.SF = 'result < 0';
                    state.flags.CF = 'operand != 0';
                    state.flags.OF = 'overflow';
                }
            }
        } else if (instr.match(/^(and)[bwlq]?$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                if (currentVal.type === 'immediate' && src.type === 'immediate') {
                    const result = currentVal.value & src.value;
                    const bits = instr.endsWith('b') ? 8 : instr.endsWith('w') ? 16 : instr.endsWith('l') ? 32 : 64;
                    const signBit = 1 << (bits - 1);

                    setRegister(state, rawDestReg, { type: 'immediate', value: result });

                    state.flags.ZF = result === 0 ? '1' : '0';
                    state.flags.SF = (result & signBit) ? '1' : '0';
                    // Always cleard
                    state.flags.CF = '0';
                    state.flags.OF = '0';

                    const lowByte = result & 0xFF;
                    let count = 0;
                    for (let i = 0; i < 8; i++) {
                        if (lowByte & (1 << i)) count++;
                    }
                    state.flags.PF = (count % 2 === 0) ? '1' : '0';
                } else {
                    setRegister(state, rawDestReg, evaluateBinary('&', currentVal, src));
                    state.flags.ZF = 'result == 0';
                    state.flags.SF = 'result < 0';
                    state.flags.CF = '0';
                    state.flags.OF = '0';
                }
            }
        } else if (instr.match(/^(or)[bwlq]?$/)) {
            // or src, dest - dest = dest | src
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (currentVal.type === 'immediate' && src.type === 'immediate') {
                    const result = currentVal.value | src.value;
                    const bits = instr.endsWith('b') ? 8 : instr.endsWith('w') ? 16 : instr.endsWith('l') ? 32 : 64;
                    const signBit = 1 << (bits - 1);

                    setRegister(state, rawDestReg, { type: 'immediate', value: result });

                    state.flags.ZF = result === 0 ? '1' : '0';
                    state.flags.SF = (result & signBit) ? '1' : '0';
                    // Always cleared
                    state.flags.CF = '0';
                    state.flags.OF = '0';

                    const lowByte = result & 0xFF;
                    let count = 0;
                    for (let i = 0; i < 8; i++) {
                        if (lowByte & (1 << i)) count++;
                    }
                    state.flags.PF = (count % 2 === 0) ? '1' : '0';
                } else {
                    setRegister(state, rawDestReg, evaluateBinary('|', currentVal, src));
                    state.flags.ZF = 'result == 0';
                    state.flags.SF = 'result < 0';
                    state.flags.CF = '0';
                    state.flags.OF = '0';
                }
            }
        } else if (instr.startsWith('xor')) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (src.type === 'register' && src.reg === destReg) {
                    setRegister(state, rawDestReg, { type: 'immediate', value: 0 });

                    state.flags.ZF = '1';
                    state.flags.SF = '0';
                    state.flags.CF = '0';
                    state.flags.OF = '0';
                    state.flags.PF = '1';
                } else if (currentVal.type === 'immediate' && src.type === 'immediate') {
                    const result = currentVal.value ^ src.value;
                    const bits = instr.endsWith('b') ? 8 : instr.endsWith('w') ? 16 : instr.endsWith('l') ? 32 : 64;
                    const signBit = 1 << (bits - 1);
                    const mask = bits === 64 ? -1 : (1 << bits) - 1;
                    const maskedResult = result & mask;

                    setRegister(state, rawDestReg, { type: 'immediate', value: maskedResult });

                    state.flags.ZF = maskedResult === 0 ? '1' : '0';
                    state.flags.SF = (maskedResult & signBit) ? '1' : '0';
                    // Always cleared
                    state.flags.CF = '0';
                    state.flags.OF = '0';

                    const lowByte = maskedResult & 0xFF;
                    let count = 0;
                    for (let i = 0; i < 8; i++) {
                        if (lowByte & (1 << i)) count++;
                    }
                    state.flags.PF = (count % 2 === 0) ? '1' : '0';
                } else {
                    setRegister(state, rawDestReg, evaluateBinary('^', currentVal, src));
                    state.flags.ZF = 'result == 0';
                    state.flags.SF = 'result < 0';
                    state.flags.CF = '0';
                    state.flags.OF = '0';
                }
            }
        } else if (instr.startsWith('shl') || instr.startsWith('sal')) {
            // shl src, dest - dest = dest << src
            if (operands.length === 2) {
                const count = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (currentVal.type === 'immediate' && count.type === 'immediate') {
                    const bits = 64;
                    const shiftCount = count.value & (bits - 1);
                    const result = (currentVal.value << shiftCount) >>> 0;

                    setRegister(state, rawDestReg, { type: 'immediate', value: result });
                    state.flags.ZF = result === 0 ? '1' : '0';
                    state.flags.SF = result < 0 ? '1' : '0';
                    state.flags.CF = shiftCount > 0 ? ((currentVal.value >> (bits - shiftCount)) & 1).toString() ? '1' : '0' : 'unchanged';
                } else {
                    setRegister(state, rawDestReg, evaluateBinary('<<', currentVal, count));
                    state.flags.ZF = 'result == 0';
                    state.flags.SF = 'result < 0';
                    state.flags.CF = 'last_bit_shifted';
                }
            }
        } else if (instr.startsWith('shr')) {
            // shr src, dest - dest = dest >> src
            if (operands.length === 2) {
                const count = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (currentVal.type === 'immediate' && count.type === 'immediate') {
                    const bits = 64;
                    const shiftCount = count.value & (bits - 1);
                    const result = (currentVal.value >>> shiftCount);

                    setRegister(state, rawDestReg, { type: 'immediate', value: result });
                    state.flags.ZF = result === 0 ? '1' : '0';
                    state.flags.SF = '0'; // Always 0 for logical shift
                    state.flags.CF = shiftCount > 0 ? ((currentVal.value >> (shiftCount - 1)) & 1) ? '1' : '0' : 'unchanged';
                } else {
                    setRegister(state, rawDestReg, evaluateBinary('>>', currentVal, count));
                    state.flags.ZF = 'result == 0';
                    state.flags.SF = 'result < 0';
                    state.flags.CF = 'last_bit_shifted';
                }
            }
        } else if (instr.startsWith('sar')) {
            if (operands.length === 2) {
                const count = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (currentVal.type === 'immediate' && count.type === 'immediate') {
                    const bits = 64;
                    const shiftCount = count.value & (bits - 1);
                    // Arithmetic shift preserves sign bit
                    const result = currentVal.value >> shiftCount;

                    setRegister(state, rawDestReg, { type: 'immediate', value: result });
                    state.flags.ZF = result === 0 ? '1' : '0';
                    state.flags.SF = result < 0 ? '1' : '0';
                    state.flags.CF = shiftCount > 0 ? ((currentVal.value >> (shiftCount - 1)) & 1) ? '1' : '0' : 'unchanged';
                } else {
                    setRegister(state, rawDestReg, evaluateBinary('>>', currentVal, count));
                    state.flags.ZF = 'result == 0';
                    state.flags.SF = 'result < 0';
                    state.flags.CF = 'last_bit_shifted';
                }
            }
        } else if (instr === 'call' || instr === 'callq') {
            // Function calls clobber volatile registers (System V AMD64 ABI)
            // Volatile: rax, rcx, rdx, rsi, rdi, r8-r11
            const volatileRegs = ['%rax', '%rcx', '%rdx', '%rsi', '%rdi',
                '%r8', '%r9', '%r10', '%r11'];
            volatileRegs.forEach(reg => {
                state.registers[reg] = { type: 'unknown' };
            });
            // Clear flags after function call
            state.flags = {};
        } else if (instr.startsWith('j')) {
            // Branches/loops - mark registers as unknown after branch
            // (We can't follow control flow, so be conservative)
            for (const reg in state.registers) {
                state.registers[reg] = { type: 'unknown' };
            }
            // Clear flags
            state.flags = {};
        } else if (instr.match(/^cmov(e|ne|g|ge|l|le|a|ae|b|be|c|nc|o|no|s|ns|p|np|pe|po|z|nz)(q|l|w)?$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                const match = instr.match(/^cmov([a-z]+)/);
                const condition = match ? match[1] : 'unknown';

                setRegister(state, rawDestReg, {
                    type: 'symbolic',
                    expr: `cmov_${condition}(${formatValue(src)}, ${formatValue(currentVal)})`
                });
            }
        } else if (instr.match(/^set(e|ne|g|ge|l|le|a|ae|b|be|c|nc|o|no|s|ns|p|np|pe|po|z|nz)$/)) {
            if (operands.length === 1 && operands[0].startsWith('%')) {
                const rawDestReg = operands[0];
                const match = instr.match(/^set([a-z]+)/);
                const condition = match ? match[1] : 'unknown';

                const condMap: { [key: string]: string } = {
                    'e': 'ZF',
                    'z': 'ZF',
                    'ne': '!ZF',
                    'nz': '!ZF',
                    'g': '!ZF && SF==OF',
                    'ge': 'SF==OF',
                    'l': 'SF!=OF',
                    'le': 'ZF || SF!=OF',
                    'a': '!CF && !ZF',
                    'ae': '!CF',
                    'b': 'CF',
                    'be': 'CF || ZF',
                    'c': 'CF',
                    'nc': '!CF',
                    'o': 'OF',
                    'no': '!OF',
                    's': 'SF',
                    'ns': '!SF',
                    'p': 'PF',
                    'pe': 'PF',
                    'np': '!PF',
                    'po': '!PF'
                };

                const flagExpr = condMap[condition] || condition;
                setRegister(state, rawDestReg, {
                    type: 'symbolic',
                    expr: `(${flagExpr}) ? 1 : 0`
                });
            }
        } else if (instr.match(/^(rol|ror)[bwlq]?$/)) {
            if (operands.length === 2) {
                const count = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (currentVal.type === 'immediate' && count.type === 'immediate') {
                    const bits = 64;
                    const mask = count.value % bits;

                    if (instr.startsWith('rol')) {
                        const result = ((currentVal.value << mask) | (currentVal.value >>> (bits - mask))) >>> 0;
                        setRegister(state, rawDestReg, { type: 'immediate', value: result });
                    } else {
                        const result = ((currentVal.value >>> mask) | (currentVal.value << (bits - mask))) >>> 0;
                        setRegister(state, rawDestReg, { type: 'immediate', value: result });
                    }
                } else {
                    const operation = instr.startsWith('rol') ? 'rotate_left' : 'rotate_right';
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `${operation}(${formatValue(currentVal)}, ${formatValue(count)})`
                    });
                }

                state.flags.CF = 'last_bit_shifted';
                if (count.type === 'immediate' && count.value === 1) {
                    state.flags.OF = 'msb_changed';
                }
            }
        } else if (instr.match(/^(rcl|rcr)[bwlq]?$/)) {
            // RCL/RCR include carry flag, can't compute without knowing CF
            if (operands.length === 2) {
                const count = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                const operation = instr.startsWith('rcl') ? 'rotate_carry_left' : 'rotate_carry_right';

                setRegister(state, rawDestReg, {
                    type: 'symbolic',
                    expr: `${operation}(${formatValue(currentVal)}, ${formatValue(count)}, CF)`
                });

                state.flags.CF = 'last_bit_shifted';
            }
        } else if (instr.match(/^(bsf|bsr)[wlq]?$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];

                if (src.type === 'immediate' && src.value !== 0) {
                    let result = 0;
                    if (instr.startsWith('bsf')) {
                        for (let i = 0; i < 64; i++) {
                            if (src.value & (1 << i)) {
                                result = i;
                                break;
                            }
                        }
                    } else {
                        for (let i = 63; i >= 0; i--) {
                            if (src.value & (1 << i)) {
                                result = i;
                                break;
                            }
                        }
                    }

                    setRegister(state, rawDestReg, { type: 'immediate', value: result });
                    state.flags.ZF = '0';
                } else {
                    const operation = instr.startsWith('bsf') ? 'bit_scan_forward' : 'bit_scan_reverse';
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `${operation}(${formatValue(src)})`
                    });
                    state.flags.ZF = `${formatValue(src)} == 0`;
                }
            }
        } else if (instr.match(/^(popcnt)[wlq]?$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];

                if (src.type === 'immediate') {
                    let count = 0;
                    let value = src.value;
                    while (value) {
                        count += value & 1;
                        value >>>= 1;
                    }
                    setRegister(state, rawDestReg, { type: 'immediate', value: count });
                    state.flags.ZF = count === 0 ? '1' : '0';
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `population_count(${formatValue(src)})`
                    });
                    state.flags.ZF = `${formatValue(src)} == 0`;

                }
            }
        } else if (instr.match(/^(lzcnt)[wlq]?$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];

                if (src.type === 'immediate') {
                    let count = 0;
                    const bits = 64;
                    for (let i = bits - 1; i >= 0; i--) {
                        if (src.value & (1 << i)) break;
                        count++;
                    }
                    setRegister(state, rawDestReg, { type: 'immediate', value: count });
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `leading_zero_count(${formatValue(src)})`
                    });
                }
            }
        } else if (instr.match(/^tzcnt[wlq]?$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];

                if (src.type === 'immediate') {
                    if (src.value === 0) {
                        setRegister(state, rawDestReg, { type: 'immediate', value: 64 });
                    } else {
                        let count = 0;
                        let value = src.value;
                        while ((value & 1) === 0) {
                            count++;
                            value >>>= 1;
                        }
                        setRegister(state, rawDestReg, { type: 'immediate', value: count });
                    }
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `trailing_zero_count(${formatValue(src)})`
                    });
                }
            }
        } else if (instr.match(/^(blsi)[lq]?$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];

                if (src.type === 'immediate') {
                    const result = src.value & -(src.value);
                    setRegister(state, rawDestReg, { type: 'immediate', value: result });
                    state.flags.ZF = result === 0 ? '1' : '0';
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `isolate_lowest_set_bit(${formatValue(src)})`
                    });
                    state.flags.ZF = `result == 0`;
                }
                state.flags.SF = 'result < 0';
                state.flags.CF = '0';
            }
        } else if (instr.match(/^blsmsk[lq]?$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];

                if (src.type === 'immediate') {
                    const result = src.value ^ (src.value - 1);
                    setRegister(state, rawDestReg, { type: 'immediate', value: result });
                    state.flags.ZF = '0';
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `mask_to_lowest_set_bit(${formatValue(src)})`
                    });
                    state.flags.ZF = '0';
                }
                state.flags.SF = 'result < 0';
                state.flags.CF = src.type === 'immediate' && src.value === 0 ? '1' : 'src == 0';
            }
        } else if (instr.match(/^blsr[lq]?$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];

                if (src.type === 'immediate') {
                    const result = src.value & (src.value - 1);
                    setRegister(state, rawDestReg, { type: 'immediate', value: result });
                    state.flags.ZF = result === 0 ? '1' : '0';
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `reset_lowest_set_bit(${formatValue(src)})`
                    });
                    state.flags.ZF = `result == 0`;
                }
                state.flags.SF = 'result < 0';
                state.flags.CF = src.type === 'immediate' && src.value === 0 ? '1' : 'src == 0';
            }
        } else if (instr.match(/^andn[lq]?$/)) {
            if (operands.length === 3) {
                const src1 = parseOperand(operands[0]);
                const src2 = parseOperand(operands[1]);
                const rawDestReg = operands[2];

                if (src1.type === 'immediate' && src2.type === 'immediate') {
                    const result = (~src1.value) & src2.value;
                    setRegister(state, rawDestReg, { type: 'immediate', value: result >>> 0 });
                    state.flags.ZF = result === 0 ? '1' : '0';
                    state.flags.SF = result < 0 ? '1' : '0';
                    state.flags.CF = '0';
                    state.flags.OF = '0';
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `~${formatValue(src1)} & ${formatValue(src2)}`
                    });
                    state.flags.ZF = `result == 0`;
                    state.flags.SF = `result < 0`;
                    state.flags.CF = '0';
                    state.flags.OF = '0';
                }
            }
        } else if (instr.match(/^bextr[lq]?$/)) {
            if (operands.length === 3) {
                const src = parseOperand(operands[0]);
                const control = parseOperand(operands[1]);
                const rawDestReg = operands[2];

                if (src.type === 'immediate' && control.type === 'immediate') {
                    // Control bits[7:0] = start, bits[15:8] = length
                    const start = control.value & 0xFF;
                    const length = (control.value >> 8) & 0xFF;

                    if (length === 0) {
                        setRegister(state, rawDestReg, { type: 'immediate', value: 0 });
                    } else {
                        const mask = (1 << length) - 1;
                        const result = (src.value >> start) & mask;
                        setRegister(state, rawDestReg, { type: 'immediate', value: result });
                    }
                    state.flags.CF = '0';
                    state.flags.OF = '0';
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `bit_extract(${formatValue(src)}, ${formatValue(control)})`
                    });
                    state.flags.ZF = `result == 0`;
                }
            }
        } else if (instr.match(/^bzhi[lq]?$/)) {
            if (operands.length === 3) {
                const src = parseOperand(operands[0]);
                const index = parseOperand(operands[1]);
                const rawDestReg = operands[2];

                if (src.type === 'immediate' && index.type === 'immediate') {
                    const bits = 64;
                    const indexVal = index.value & 0xFF;

                    if (indexVal >= bits) {
                        setRegister(state, rawDestReg, { type: 'immediate', value: src.value });
                    } else {
                        const mask = (1 << indexVal) - 1;
                        const result = src.value & mask;
                        setRegister(state, rawDestReg, { type: 'immediate', value: result });
                    }
                    state.flags.CF = index.value >= bits || (src.value >> indexVal) !== 0 ? '1' : '0';
                    state.flags.SF = '0';
                    state.flags.OF = '0';
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `zero_high_bits(${formatValue(src)}, ${formatValue(index)})`
                    });
                    state.flags.ZF = `result == 0`;
                }
            }
        } else if (instr.match(/^pdep[lq]?$/)) {
            if (operands.length === 3) {
                const src = parseOperand(operands[0]);
                const mask = parseOperand(operands[1]);
                const rawDestReg = operands[2];

                if (src.type === 'immediate' && mask.type === 'immediate') {
                    // Parallel deposit - scatter bits according to mask
                    let result = 0;
                    let srcBit = 0;

                    for (let i = 0; i < 64; i++) {
                        if (mask.value & (1 << i)) {
                            if (src.value & (1 << srcBit)) {
                                result |= (1 << i);
                            }
                            srcBit++;
                        }
                    }

                    setRegister(state, rawDestReg, { type: 'immediate', value: result });
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `parallel_deposit(${formatValue(src)}, ${formatValue(mask)})`
                    });
                }
            }
        } else if (instr.match(/^pext[lq]?$/)) {
            if (operands.length === 3) {
                const src = parseOperand(operands[0]);
                const mask = parseOperand(operands[1]);
                const rawDestReg = operands[2];

                if (src.type === 'immediate' && mask.type === 'immediate') {
                    let result = 0;
                    let destBit = 0;

                    for (let i = 0; i < 64; i++) {
                        if (mask.value & (1 << i)) {
                            if (src.value & (1 << i)) {
                                result |= (1 << destBit);
                            }
                            destBit++;
                        }
                    }

                    setRegister(state, rawDestReg, { type: 'immediate', value: result });
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `parallel_extract(${formatValue(src)}, ${formatValue(mask)})`
                    });
                }
            }
        } else if (instr.match(/^(bt|bts|btr|btc)[wlq]?$/)) {
            if (operands.length === 2) {
                const bit = parseOperand(operands[0]);
                const destOperand = operands[1];

                if (destOperand.startsWith('%')) {
                    const rawDestReg = destOperand;
                    const currentVal = state.registers[rawDestReg] || { type: 'unknown' };

                    if (currentVal.type === 'immediate' && bit.type === 'immediate') {
                        const bitPos = bit.value & 63;
                        const bitMask = 1 << bitPos;

                        state.flags.CF = (currentVal.value & bitMask) !== 0 ? '1' : '0';

                        if (instr === 'bts') {
                            setRegister(state, rawDestReg, { type: 'immediate', value: currentVal.value | bitMask });
                        } else if (instr === 'btr') {
                            setRegister(state, rawDestReg, { type: 'immediate', value: currentVal.value & ~bitMask });
                        } else if (instr === 'btc') {
                            setRegister(state, rawDestReg, { type: 'immediate', value: currentVal.value ^ bitMask });
                        } else {
                            // bt no mod reg
                        }
                    } else {
                        state.flags.CF = `bit_${formatValue(bit)}_of_${formatValue(currentVal)}`;

                        if (instr.startsWith('bts') || instr.startsWith('btr') || instr.startsWith('btc')) {
                            const operation = instr.startsWith('bts') ? 'set_bit' : instr.startsWith('btr') ? 'reset_bit' : 'complement_bit';
                            setRegister(state, rawDestReg, {
                                type: 'symbolic',
                                expr: `${operation}(${formatValue(currentVal)}, ${formatValue(bit)})`
                            });
                        }
                    }
                }
            }
        } else if (instr.match(/^movs(b|w)l$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];

                if (src.type === 'immediate') {
                    const srcSize = instr.includes('b') ? 8 : 16;
                    const signBit = 1 << (srcSize - 1);
                    const mask = (1 << srcSize) - 1;
                    let value = src.value & mask;

                    // Sign extend to 32 bits
                    if (value & signBit) {
                        value = value | (~mask & 0xFFFFFFFF);
                    }

                    setRegister(state, rawDestReg, { type: 'immediate', value: value | 0 });
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `sign_extend_to_32(${formatValue(src)})`
                    });
                }
            }
        } else if (instr.match(/^movz(b|w)l$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];

                if (src.type === 'immediate') {
                    const srcSize = instr.includes('b') ? 8 : 16;
                    const mask = (1 << srcSize) - 1;
                    setRegister(state, rawDestReg, { type: 'immediate', value: src.value & mask });
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `zero_extend_to_32(${formatValue(src)})`
                    });
                }
            }
        } else if (instr.match(/^xchg[bwlq]?$/)) {
            if (operands.length === 2) {
                const op1 = operands[0];
                const op2 = operands[1];

                if (op1.startsWith('%') && op2.startsWith('%')) {
                    const reg1 = normalizeRegister(op1);
                    const reg2 = normalizeRegister(op2);

                    const temp = state.registers[reg1];
                    state.registers[reg1] = state.registers[reg2] || { type: 'unknown' };
                    state.registers[reg2] = temp || { type: 'unknown' };
                }
            }
        } else if (instr.match(/^(shld|shrd)[wlq]?$/)) {
            if (operands.length === 3) {
                const count = parseOperand(operands[0]);
                const src = parseOperand(operands[1]);
                const rawDestReg = operands[2];
                const destReg = normalizeRegister(operands[2]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (currentVal.type === 'immediate' && src.type === 'immediate' && count.type === 'immediate') {
                    const bits = 64;
                    const shiftCount = count.value & (bits - 1);

                    if (instr.startsWith('shld')) {
                        const result = ((currentVal.value << shiftCount) | (src.value >>> (bits - shiftCount))) >>> 0;
                        setRegister(state, rawDestReg, { type: 'immediate', value: result });
                    } else {
                        const result = ((currentVal.value >>> shiftCount) | (src.value << (bits - shiftCount))) >>> 0;
                        setRegister(state, rawDestReg, { type: 'immediate', value: result });
                    }

                    state.flags.CF = 'last_bit_shifted';
                    if (shiftCount === 1) {
                        state.flags.OF = 'msb_changed';
                    }
                } else {
                    const operation = instr.startsWith('shld') ? 'shift_left_double' : 'shift_right_double';
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `${operation}(${formatValue(currentVal)}, ${formatValue(src)}, ${formatValue(count)})`
                    });
                    state.flags.CF = 'last_bit_shifted';
                }
                state.flags.ZF = 'result == 0';
                state.flags.SF = 'result < 0';
            }
        } else if (instr.match(/^(daa|das|aaa|aas|aam|aad)$/)) {
            const raxVal = state.registers['%rax'] || { type: 'unknown' };

            if (instr === 'daa') {
                // Decimal adjust after addition
                state.registers['%rax'] = { type: 'symbolic', expr: 'decimal_adjust_add(AL)' };
                state.flags.CF = 'carry';
                state.flags.AF = 'aux_carry';
                state.flags.ZF = 'AL == 0';
                state.flags.SF = 'AL < 0';
            } else if (instr === 'das') {
                // Decimal adjust after subtraction
                state.registers['%rax'] = { type: 'symbolic', expr: 'decimal_adjust_sub(AL)' };
                state.flags.CF = 'borrow';
                state.flags.AF = 'aux_borrow';
                state.flags.ZF = 'AL == 0';
                state.flags.SF = 'AL < 0';
            } else if (instr === 'aaa') {
                // ASCII adjust after addition
                state.registers['%rax'] = { type: 'symbolic', expr: 'ascii_adjust_add(AX)' };
                state.flags.CF = 'carry';
                state.flags.AF = 'carry';
            } else if (instr === 'aas') {
                // ASCII adjust after subtraction
                state.registers['%rax'] = { type: 'symbolic', expr: 'ascii_adjust_sub(AX)' };
                state.flags.CF = 'borrow';
                state.flags.AF = 'borrow';
            } else if (instr === 'aam') {
                // ASCII adjust after multiplication
                if (operands.length === 0 || (operands.length === 1 && operands[0] === '$10')) {
                    if (raxVal.type === 'immediate') {
                        const al = raxVal.value & 0xFF;
                        const ah = Math.floor(al / 10);
                        const newAl = al % 10;
                        state.registers['%rax'] = { type: 'immediate', value: (raxVal.value & 0xFFFFFF00) | (ah << 8) | newAl };
                    } else {
                        state.registers['%rax'] = { type: 'symbolic', expr: 'ascii_adjust_mul(AL)' };
                    }
                } else {
                    state.registers['%rax'] = { type: 'symbolic', expr: 'ascii_adjust_mul(AL)' };
                }
                state.flags.ZF = 'AL == 0';
                state.flags.SF = 'AL < 0';
            } else if (instr === 'aad') {
                if (operands.length === 0 || (operands.length === 1 && operands[0] === '$10')) {
                    if (raxVal.type === 'immediate') {
                        const al = raxVal.value & 0xFF;
                        const ah = (raxVal.value >> 8) & 0xFF;
                        const newAl = (al + ah * 10) & 0xFF;
                        state.registers['%rax'] = { type: 'immediate', value: (raxVal.value & 0xFFFF0000) | newAl };
                    } else {
                        state.registers['%rax'] = { type: 'symbolic', expr: 'ascii_adjust_div(AX)' };
                    }
                } else {
                    state.registers['%rax'] = { type: 'symbolic', expr: 'ascii_adjust_div(AX)' };
                }

                state.flags.ZF = 'AL == 0';
                state.flags.SF = 'AL < 0';
            }
        } else if (instr.match(/^bswap[lq]?$/)) {
            if (operands.length === 1) {
                const rawDestReg = operands[0];
                const destReg = normalizeRegister(operands[0]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (currentVal.type === 'immediate') {
                    let value = currentVal.value;
                    let result = 0;

                    const size = instr.endsWith('l') ? 32 : 64;
                    const bytes = size / 8;

                    for (let i = 0; i < bytes; i++) {
                        const byte = (value >> (i * 8)) & 0xFF;
                        result |= byte << ((bytes - 1 - i) * 8);
                    }

                    setRegister(state, rawDestReg, { type: 'immediate', value: result });
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `bswap(${formatValue(currentVal)})`
                    });
                }
            }
        } else if (instr.match(/^(lodsb|lodsw|lodsd|lodsq)$/)) {
            const size = instr.endsWith('b') ? 1 : instr.endsWith('w') ? 2 : instr.endsWith('d') ? 4 : 8;

            state.registers['%rax'] = { type: 'symbolic', expr: `*%rsi` };

            const rsiVal = state.registers['%rsi'] || { type: 'symbolic', expr: '%rsi' };
            if (rsiVal.type === 'immediate') {
                state.registers['%rsi'] = { type: 'immediate', value: rsiVal.value + size };
            } else {
                state.registers['%rsi'] = evaluateBinary('+', rsiVal, { type: 'immediate', value: size });
            }
        } else if (instr.match(/^(stosb|stosw|stosd|stosq)$/)) {
            const size = instr.endsWith('b') ? 1 : instr.endsWith('w') ? 2 : instr.endsWith('d') ? 4 : 8;

            const rdiVal = state.registers['%rdi'] || { type: 'symbolic', expr: '%rdi' };
            if (rdiVal.type === 'immediate') {
                state.registers['%rdi'] = { type: 'immediate', value: rdiVal.value + size };
            } else {
                state.registers['%rdi'] = evaluateBinary('+', rdiVal, { type: 'immediate', value: size });
            }
        } else if (instr.match(/^(movsb|movsw|movsd|movsq)$/)) {
            const size = instr.match('b') ? 1 : instr.match('w') ? 2 : instr.match('d') ? 4 : 8;

            const rsiVal = state.registers['%rsi'] || { type: 'symbolic', expr: '%rsi' };
            const rdiVal = state.registers['%rdi'] || { type: 'symbolic', expr: '%rdi' };

            if (rsiVal.type === 'immediate') {
                state.registers['%rsi'] = { type: 'immediate', value: rsiVal.value + size };
            } else {
                state.registers['%rsi'] = evaluateBinary('+', rsiVal, { type: 'immediate', value: size });
            }

            if (rdiVal.type === 'immediate') {
                state.registers['%rdi'] = { type: 'immediate', value: rdiVal.value + size };
            } else {
                state.registers['%rdi'] = evaluateBinary('+', rdiVal, { type: 'immediate', value: size });
            }
        } else if (instr.match(/^(cmpsb|cmpsw|cmpsd|cmpsq)$/)) {
            const size = instr.endsWith('b') ? 1 : instr.endsWith('w') ? 2 : instr.endsWith('d') ? 4 : 8;

            state.flags.ZF = '*%rsi == *%rdi';
            state.flags.CF = '*%rsi < *%rdi';
            state.flags.SF = '(*%rsi - *%rdi) < 0';

            const rsiVal = state.registers['%rsi'] || { type: 'symbolic', expr: '%rsi' };
            const rdiVal = state.registers['%rdi'] || { type: 'symbolic', expr: '%rdi' };

            if (rsiVal.type === 'immediate') {
                state.registers['%rsi'] = { type: 'immediate', value: rsiVal.value + size };
            } else {
                state.registers['%rsi'] = evaluateBinary('+', rsiVal, { type: 'immediate', value: size });
            }

            if (rdiVal.type === 'immediate') {
                state.registers['%rdi'] = { type: 'immediate', value: rdiVal.value + size };
            } else {
                state.registers['%rdi'] = evaluateBinary('+', rdiVal, { type: 'immediate', value: size });
            }
        } else if (instr.match(/^(scasb|scasw|scasd|scasq)$/)) {
            const size = instr.endsWith('b') ? 1 : instr.endsWith('w') ? 2 : instr.endsWith('d') ? 4 : 8;

            state.flags.ZF = '%rax == *%rdi';
            state.flags.CF = '%rax < *%rdi';
            state.flags.SF = '(%rax - *%rdi) < 0';

            const rdiVal = state.registers['%rdi'] || { type: 'symbolic', expr: '%rdi' };
            if (rdiVal.type === 'immediate') {
                state.registers['%rdi'] = { type: 'immediate', value: rdiVal.value + size };
            } else {
                state.registers['%rdi'] = evaluateBinary('+', rdiVal, { type: 'immediate', value: size });
            }
        } else if (instr.match(/^(loop|loope|loopz|loopne|loopnz)$/)) {
            const rcxVal = state.registers['%rcx'] || { type: 'unknown' };

            if (rcxVal.type === 'immediate') {
                state.registers['%rcx'] = { type: 'immediate', value: rcxVal.value - 1 };
            } else {
                state.registers['%rcx'] = evaluateBinary('-', rcxVal, { type: 'immediate', value: 1 });
            }

            // Might be unknown afterwards
        } else if (instr.match(/^(shufps|shufpd|pshufd|pshufb)$/)) {
            if (operands.length >= 2) {
                const rawDestReg = operands[operands.length - 1];
                const immediatePattern = operands.length === 3 ? operands[0] : null;

                setRegister(state, rawDestReg, {
                    type: 'symbolic',
                    expr: `${instr}_shuffle(${immediatePattern ? formatValue(parseOperand(immediatePattern)) : '...'})`
                });
            }
        } else if (instr.match(/^v(shufps|shufpd|pshufd|pshufb)$/)) {
            if (operands.length >= 3) {
                const rawDestReg = operands[operands.length - 1];

                setRegister(state, rawDestReg, {
                    type: 'symbolic',
                    expr: `${instr}_vec_shuffle(...)`
                });
            }
        } else if (instr.match(/^(pack|unpack)(ss|us|wd|dq)(wb|wd|dq)?$/)) {
            if (operands.length === 2) {
                const rawDestReg = operands[1];
                const src = parseOperand(operands[0]);

                setRegister(state, rawDestReg, {
                    type: 'symbolic',
                    expr: `${instr}(${formatValue(src)})`
                });
            }
        } else if (instr.match(/^(cmp|ucomis|comis)(ss|sd|ps|pd)?$/)) {
            if (operands.length === 2) {
                const src1 = parseOperand(operands[0]);
                const src2 = parseOperand(operands[1]);

                state.flags.ZF = `${formatValue(src1)} == ${formatValue(src2)}`;
                state.flags.CF = `${formatValue(src1)} < ${formatValue(src2)}`;
                state.flags.PF = `${formatValue(src1)} or ${formatValue(src2)} is NaN`;
            }
        } else if (instr.match(/^v(cmp|ucomis|comis)(ss|sd|ps|pd)$/)) {
            if (operands.length >= 2) {
                const src1 = parseOperand(operands[0]);
                const src2 = parseOperand(operands[1]);

                state.flags.ZF = `${formatValue(src1)} == ${formatValue(src2)}`;
                state.flags.CF = `${formatValue(src1)} < ${formatValue(src2)}`;
                state.flags.PF = `unordered`;
            }
        } else if (instr.match(/^(pcmpeq|pcmpgt)(b|w|d|q)$/)) {
            // SSE integer comparison - sets all bits to 1 if true, 0 if false
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                const comparison = instr.includes('eq') ? '==' : '>';
                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${formatValue(currentVal)} ${comparison} ${formatValue(src)} ? 0xFF... : 0x00...`
                });
            }
        } else if (instr.match(/^vpcmp(eq|gt)(b|w|d|q)$/)) {
            // AVX version
            if (operands.length === 3) {
                const src1 = parseOperand(operands[0]);
                const src2 = parseOperand(operands[1]);
                const destReg = operands[2];

                const comparison = instr.includes('eq') ? '==' : '>';
                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${formatValue(src1)} ${comparison} ${formatValue(src2)} ? 0xFF... : 0x00...`
                });
            }
        } else if (instr.match(/^(min|max)(ps|pd|ss|sd)$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                const operation = instr.startsWith('min') ? 'min' : 'max';

                if (currentVal.type === 'immediate' && src.type === 'immediate') {
                    const result = operation === 'min' ?
                        Math.min(currentVal.value, src.value) :
                        Math.max(currentVal.value, src.value);
                    setRegister(state, destReg, { type: 'immediate', value: result });
                } else {
                    setRegister(state, destReg, {
                        type: 'symbolic',
                        expr: `${operation}(${formatValue(currentVal)}, ${formatValue(src)})`
                    });
                };
            }
        } else if (instr.match(/^v(min|max)(ps|pd|ss|sd)$/)) {
            if (operands.length === 3) {
                const src1 = parseOperand(operands[0]);
                const src2 = parseOperand(operands[1]);
                const destReg = operands[2];

                const operation = instr.includes('min') ? 'min' : 'max';

                if (src1.type === 'immediate' && src2.type === 'immediate') {
                    const result = operation === 'min' ?
                        Math.min(src1.value, src2.value) :
                        Math.max(src1.value, src2.value);
                    setRegister(state, destReg, { type: 'immediate', value: result });
                } else {
                    setRegister(state, destReg, {
                        type: 'symbolic',
                        expr: `${operation}(${formatValue(src1)}, ${formatValue(src2)})`
                    });
                }
            }
        } else if (instr.match(/^p(min|max)(ub|uw|ud|sb|sw|sd)$/)) {
            // SSE integer min/max
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                const operation = instr.includes('min') ? 'min' : 'max';
                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${operation}(${formatValue(currentVal)}, ${formatValue(src)})`
                });
            }
        } else if (instr.match(/^(sqrt|rsqrt|rcp)(ps|pd|ss|sd)$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];

                const operation = instr.startsWith('sqrt') ? 'sqrt' :
                    instr.startsWith('rsqrt') ? 'rsqrt' : 'rcp';

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${operation}(${formatValue(src)})`
                });
            }
        } else if (instr.match(/^v(sqrt|rsqrt|rcp)(ps|pd|ss|sd)$/)) {
            if (operands.length >= 2) {
                const src = parseOperand(operands[operands.length - 2]);
                const destReg = operands[operands.length - 1];

                const operation = instr.includes('sqrt') ? 'sqrt' :
                    instr.includes('rsqrt') ? 'rsqrt' : 'rcp';

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${operation}(${formatValue(src)})`
                });
            }
        } else if (instr.match(/^(extract|insert)ps$/)) {
            if (operands.length === 3) {
                const imm = parseOperand(operands[0]);
                const src = parseOperand(operands[1]);
                const dest = operands[2];

                if (instr.startsWith('extract')) {
                    // Extract single precision float
                    setRegister(state, dest, {
                        type: 'symbolic',
                        expr: `extract_element(${formatValue(src)}, ${formatValue(imm)})`
                    });
                } else {
                    // Insert single precision float
                    const destReg = dest.startsWith('%') ? dest : operands[2];
                    setRegister(state, destReg, {
                        type: 'symbolic',
                        expr: `insert_element(dest, ${formatValue(src)}, ${formatValue(imm)})`
                    });
                }
            }
        } else if (instr.match(/^(pextr|pinsr)(b|w|d|q)$/)) {
            if (operands.length === 3) {
                const imm = parseOperand(operands[0]);
                const src = parseOperand(operands[1]);
                const dest = operands[2];

                if (instr.startsWith('pextr')) {
                    // Extract integer element
                    if (dest.startsWith('%')) {
                        const destReg = normalizeRegister(dest);
                        setRegister(state, destReg, {
                            type: 'symbolic',
                            expr: `extract_element(${formatValue(src)}, ${formatValue(imm)})`
                        });
                    }
                } else {
                    // Insert integer element
                    if (dest.startsWith('%')) {
                        setRegister(state, dest, {
                            type: 'symbolic',
                            expr: `insert_element(dest, ${formatValue(src)}, ${formatValue(imm)})`
                        });
                    }
                }
            }
        } else if (instr.match(/^v(extract|insert)(f128|i128)$/)) {
            if (operands.length === 3 || operands.length === 4) {
                const destReg = operands[operands.length - 1];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${instr}(...)`
                });
            }
        } else if (instr.match(/^(blend|pblend)(ps|pd|w|vb)$/)) {
            if (operands.length === 3) {
                const mask = parseOperand(operands[0]);
                const src = parseOperand(operands[1]);
                const destReg = operands[2];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `blend(${formatValue(src)}, dest, ${formatValue(mask)})`
                });
            }
        } else if (instr.match(/^v(blend|pblend)(ps|pd|w|vb)$/)) {
            if (operands.length === 4) {
                const mask = parseOperand(operands[0]);
                const src1 = parseOperand(operands[1]);
                const src2 = parseOperand(operands[2]);
                const destReg = operands[3];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `blend(${formatValue(src1)}, ${formatValue(src2)}, ${formatValue(mask)})`
                });
            }
        } else if (instr.match(/^(hadd|hsub)(ps|pd)$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];

                const operation = instr.startsWith('hadd') ? 'horizontal_add' : 'horizontal_sub';
                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${operation}(dest, ${formatValue(src)})`
                });
            }
        } else if (instr.match(/^v(hadd|hsub)(ps|pd)$/)) {
            if (operands.length === 3) {
                const src1 = parseOperand(operands[0]);
                const src2 = parseOperand(operands[1]);
                const destReg = operands[2];

                const operation = instr.includes('hadd') ? 'horizontal_add' : 'horizontal_sub';
                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${operation}(${formatValue(src1)}, ${formatValue(src2)})`
                });
            }
        } else if (instr.match(/^p(hadd|hsub|haddsw|hsubsw)(w|d)$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${instr}(dest, ${formatValue(src)})`
                });
            }
        } else if (instr.match(/^dp(ps|pd)$/)) {
            if (operands.length === 3) {
                const imm = parseOperand(operands[0]);
                const src = parseOperand(operands[1]);
                const destReg = operands[2];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `dot_product(dest, ${formatValue(src)}, ${formatValue(imm)})`
                });
            }
        } else if (instr.match(/^vdp(ps|pd)$/)) {
            if (operands.length === 4) {
                const imm = parseOperand(operands[0]);
                const src1 = parseOperand(operands[1]);
                const src2 = parseOperand(operands[2]);
                const destReg = operands[3];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `dot_product(${formatValue(src1)}, ${formatValue(src2)}, ${formatValue(imm)})`
                });
            }
        } else if (instr.match(/^round(ps|pd|ss|sd)$/)) {
            if (operands.length === 3) {
                const imm = parseOperand(operands[0]);
                const src = parseOperand(operands[1]);
                const destReg = operands[2];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `round(${formatValue(src)}, ${formatValue(imm)})`
                });
            }
        } else if (instr.match(/^vround(ps|pd|ss|sd)$/)) {
            if (operands.length >= 3) {
                const destReg = operands[operands.length - 1];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${instr}(...)`
                });
            }
        } else if (instr.match(/^vbroadcast(ss|sd|f128)$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `broadcast(${formatValue(src)})`
                });
            }
        } else if (instr.match(/^vpbroadcast(b|w|d|q)$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `broadcast(${formatValue(src)})`
                });
            }
        } else if (instr.match(/^cvt(ps2pd|pd2ps|ss2sd|sd2ss|dq2ps|ps2dq|dq2pd|pd2dq|si2ss|si2sd|ss2si|sd2si|tt?(ps|pd|ss|sd)2(dq|pi))$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${instr}(${formatValue(src)})`
                });
            }
        } else if (instr.match(/^vcvt(ps2pd|pd2ps|ss2sd|sd2ss|dq2ps|ps2dq|dq2pd|pd2dq|si2ss|si2sd|ss2si|sd2si|tt?(ps|pd|ss|sd)2(dq|pi))$/)) {
            if (operands.length >= 2) {
                const destReg = operands[operands.length - 1];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${instr}(...)`
                });
            }
        } else if (instr.startsWith('not')) {
            if (operands.length === 1) {
                const rawDestReg = operands[0];
                const destReg = normalizeRegister(operands[0]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (currentVal.type === 'immediate') {
                    const bits = 64;
                    const mask = (1n << BigInt(bits)) - 1n;
                    const result = Number((~BigInt(currentVal.value)) & mask);
                    setRegister(state, rawDestReg, { type: 'immediate', value: result });
                } else {
                    setRegister(state, rawDestReg, { type: 'symbolic', expr: `~${formatValue(currentVal)}` });
                }
            }
        } else if (instr.match(/^k(add|and|andn|mov|or|test|xnor|xor)(b|w|d|q)$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];

                // These operate on mask registers %k0-%k7
                const operation = instr.match(/^k([a-z]+)/)?.[1] || 'unknown';

                if (operation === 'mov') {
                    setRegister(state, destReg, src);
                } else if (operation === 'not') {
                    if (src.type === 'immediate') {
                        setRegister(state, destReg, { type: 'immediate', value: ~src.value });
                    } else {
                        setRegister(state, destReg, {
                            type: 'symbolic',
                            expr: `~${formatValue(src)}`
                        });
                    }
                } else {
                    const currentVal = state.registers[destReg] || { type: 'unknown' };
                    const opSymbol = operation === 'add' ? '+' :
                        operation === 'and' ? '&' :
                            operation === 'andn' ? '&~' :
                                operation === 'or' ? '|' :
                                    operation === 'xor' ? '^' :
                                        operation === 'xnor' ? '~^' : '?';

                    setRegister(state, destReg, {
                        type: 'symbolic',
                        expr: `${formatValue(currentVal)} ${opSymbol} ${formatValue(src)}`
                    });
                }
            }
        } else if (instr.match(/^(prefetch(nta|t0|t1|t2)|prefetchw|clflush|clflushopt|clwb)$/)) {
            // No register changes
        } else if (instr.match(/^(lfence|mfence|sfence)$/)) {
            // No register changes
        } else if (instr.match(/^aes(enc|enclast|dec|declast|imc|keygenassist)$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${instr}(dest, ${formatValue(src)})`
                });
            }
        } else if (instr.match(/^vaes(enc|enclast|dec|declast)$/)) {
            if (operands.length === 3) {
                const src1 = parseOperand(operands[0]);
                const src2 = parseOperand(operands[1]);
                const destReg = operands[2];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${instr}(${formatValue(src1)}, ${formatValue(src2)})`
                });
            }
        } else if (instr.match(/^pclmul(l?[hl]q[hl]?qdq|qdq)$/)) {
            if (operands.length >= 2) {
                const destReg = operands[operands.length - 1];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `${instr}(...)`
                });
            }
        } else if (instr.match(/^vpclmul(l?[hl]q[hl]?qdq|qdq)$/)) {
            if (operands.length === 4) {
                const imm = parseOperand(operands[0]);
                const src1 = parseOperand(operands[1]);
                const src2 = parseOperand(operands[2]);
                const destReg = operands[3];

                setRegister(state, destReg, {
                    type: 'symbolic',
                    expr: `pclmulqdq(${formatValue(src1)}, ${formatValue(src2)}, ${formatValue(imm)})`
                });
            }
        } else if (instr.match(/^(xsave|xsavec|xsaveopt|xsaves|xrstor|xrstors)(64)?$/)) {
            // Uses %rax:%rdx as mask
            // TODO: fully get this modeled
            if (instr.startsWith('xsave')) {
                // none
            } else {
                // Restoring state, every register potentially changes
                const volatileRegs = ['%rax', '%rcx', '%rdx', '%rsi', '%rdi', '%r8', '%r9', '%r10', '%r11'];
                volatileRegs.forEach(reg => [
                    state.registers[reg] = { type: 'unknown' }
                ]);
            }
        } else if (instr.match(/^(xgetbv|xsetbv)$/)) {
            if (instr === 'xgetbv') {
                state.registers['%rax'] = { type: 'symbolic', expr: 'xcr_low' };
                state.registers['%rdx'] = { type: 'symbolic', expr: 'xcr_high' };
            }
        } else if (instr.match(/^adc[bwlq]?$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (currentVal.type === 'immediate' && src.type === 'immediate') {
                    const carryVal = state.flags.CF === '1' ? 1 : state.flags.CF === '0' ? 0 : null;

                    if (carryVal !== null) {
                        const result = currentVal.value + src.value + carryVal;
                        setRegister(state, rawDestReg, { type: 'immediate', value: result });

                        state.flags.ZF = result === 0 ? '1' : '0';
                        state.flags.SF = result < 0 ? '1' : '0';
                        state.flags.CF = result > 0xFFFFFFFF ? '1' : '0';
                        state.flags.OF = 'overflow_check';
                    } else {
                        setRegister(state, rawDestReg, {
                            type: 'symbolic',
                            expr: `${formatValue(currentVal)} + ${formatValue(src)} + CF`
                        });
                        state.flags.ZF = 'result == 0';
                        state.flags.SF = 'result < 0';
                        state.flags.CF = 'carry';
                    }
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `${formatValue(currentVal)} + ${formatValue(src)} + CF`
                    });
                    state.flags.ZF = 'result == 0';
                    state.flags.SF = 'result < 0';
                    state.flags.CF = 'carry';
                }
            }
        } else if (instr.match(/^sbb[bwlq]?$/)) {
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const rawDestReg = operands[1];
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };

                if (currentVal.type === 'immediate' && src.type === 'immediate') {
                    const carryVal = state.flags.CF === '1' ? 1 : state.flags.CF === '0' ? 0 : null;

                    if (carryVal !== null) {
                        const result = currentVal.value - src.value - carryVal;
                        setRegister(state, rawDestReg, { type: 'immediate', value: result });

                        state.flags.ZF = result === 0 ? '1' : '0';
                        state.flags.SF = result < 0 ? '1' : '0';
                        state.flags.CF = result < 0 ? '1' : '0';
                        state.flags.OF = 'overflow_check';
                    } else {
                        setRegister(state, rawDestReg, {
                            type: 'symbolic',
                            expr: `${formatValue(currentVal)} - ${formatValue(src)} - CF`
                        });
                        state.flags.ZF = 'result == 0';
                        state.flags.SF = 'result < 0';
                        state.flags.CF = 'borrow';
                    }
                } else {
                    setRegister(state, rawDestReg, {
                        type: 'symbolic',
                        expr: `${formatValue(currentVal)} - ${formatValue(src)} - CF`
                    });
                    state.flags.ZF = 'result == 0';
                    state.flags.SF = 'result < 0';
                    state.flags.CF = 'borrow';
                }
            }
        }

        // SSE/AVX/FPU
        else if (instr.match(/^(movaps|movups|movapd|movupd|movss|movsd|movdqa|movdqu)$/)) {
            if (operands.length === 2 && operands[1].startsWith('%')) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                setRegister(state, destReg, src);
            }
        } else if (instr.match(/^v(movaps|movups|movapd|movupd|movss|movsd|movdqa|movdqu)$/)) {
            if (operands.length === 2 && operands[1].startsWith('%')) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                setRegister(state, destReg, src);
            }
        } else if (instr.match(/^(addps|addss|addpd|addsd|subps|subss|subpd|subsd|mulps|mulss|mulpd|mulsd|divps|divss|divpd|divsd)$/)) {
            if (operands.length === 2 && operands[1].startsWith('%')) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                const op = instr.includes('add') ? '+' : instr.includes('sub') ? '-' : instr.includes('mul') ? '*' : '/';
                setRegister(state, destReg, { type: 'symbolic', expr: `${formatValue(currentVal)} ${op} ${formatValue(src)}` });
            }
        } else if (instr.match(/^v(addps|addss|addpd|addsd|subps|subss|subpd|subsd|mulps|mulss|mulpd|mulsd|divps|divss|divpd|divsd)$/)) {
            if (operands.length === 3 && operands[2].startsWith('%')) {
                const src1 = parseOperand(operands[0]);
                const src2 = parseOperand(operands[1]);
                const destReg = operands[2];
                const op = instr.includes('add') ? '+' : instr.includes('sub') ? '-' : instr.includes('mul') ? '*' : '/';
                setRegister(state, destReg, { type: 'symbolic', expr: `${formatValue(src1)} ${op} ${formatValue(src2)}` });
            }
        } else if (instr.match(/^(xorps|xorpd|andps|andpd|orps|orpd)$/)) {
            if (operands.length === 2 && operands[1].startsWith('%')) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                if (instr.startsWith('xor') && src.type === 'register' && src.reg === destReg) {
                    setRegister(state, destReg, { type: 'immediate', value: 0 });
                } else {
                    const currentVal = state.registers[destReg] || { type: 'unknown' };
                    const op = instr.includes('xor') ? '^' : instr.includes('and') ? '&' : '|';
                    setRegister(state, destReg, { type: 'symbolic', expr: `${formatValue(currentVal)} ${op} ${formatValue(src)}` });
                }
            }
        } else if (instr.match(/^v(xorps|xorpd|andps|andpd|orps|orpd)$/)) {
            if (operands.length === 3 && operands[2].startsWith('%')) {
                const src1 = parseOperand(operands[0]);
                const src2 = parseOperand(operands[1]);
                const destReg = operands[2];
                if (instr.match(/^vxor/) && src1.type === 'register' && src2.type === 'register' &&
                    src1.reg === src2.reg && src1.reg === destReg) {
                    setRegister(state, destReg, { type: 'immediate', value: 0 });
                } else {
                    const op = instr.includes('xor') ? '^' : instr.includes('and') ? '&' : '|';
                    setRegister(state, destReg, { type: 'symbolic', expr: `${formatValue(src1)} ${op} ${formatValue(src2)}` });
                }
            }
        } else if (instr.match(/^(vzeroall|vzeroupper)$/)) {
            for (const reg in state.registers) {
                if (reg.match(/^%(ymm|zmm)\d+$/)) {
                    setRegister(state, reg, { type: 'immediate', value: 0 });
                }
            }
        } else if (instr.match(/^(paddb|paddw|paddd|paddq|psubb|psubw|psubd|psubq)$/)) {
            if (operands.length === 2 && operands[1].startsWith('%')) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                const op = instr.startsWith('padd') ? '+' : '-';
                setRegister(state, destReg, { type: 'symbolic', expr: `${formatValue(currentVal)} ${op} ${formatValue(src)}` });
            }
        } else if (instr.match(/^(pand|pandn|por|pxor)$/)) {
            if (operands.length === 2 && operands[1].startsWith('%')) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                if (instr === 'pxor' && src.type === 'register' && src.reg === destReg) {
                    setRegister(state, destReg, { type: 'immediate', value: 0 });
                } else {
                    const currentVal = state.registers[destReg] || { type: 'unknown' };
                    const op = instr === 'pxor' ? '^' : instr === 'pand' ? '&' : '|';
                    setRegister(state, destReg, { type: 'symbolic', expr: `${formatValue(currentVal)} ${op} ${formatValue(src)}` });
                }
            }
        } else if (instr.match(/^fld(s|l|t)?$/)) {
            state.fpuStack.top = (state.fpuStack.top - 1) & 7;

            if (operands.length === 1) {
                const src = parseOperand(operands[0]);

                const stMatch = operands[0].match(/^%st\((\d+)\)$/);
                if (stMatch) {
                    const index = parseInt(stMatch[1]);
                    const physicalIndex = (state.fpuStack.top + index) & 7;
                    state.fpuStack.stack[state.fpuStack.top] = state.fpuStack.stack[physicalIndex];
                } else {
                    state.fpuStack.stack[state.fpuStack.top] = src;
                }
            } else {
                state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
            }

            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fld1') {
            state.fpuStack.top = (state.fpuStack.top - 1) & 7;
            state.fpuStack.stack[state.fpuStack.top] = { type: 'symbolic', expr: '1.0' };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fldz') {
            state.fpuStack.top = (state.fpuStack.top - 1) & 7;
            state.fpuStack.stack[state.fpuStack.top] = { type: 'symbolic', expr: '0.0' };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fldpi') {
            state.fpuStack.top = (state.fpuStack.top - 1) & 7;
            state.fpuStack.stack[state.fpuStack.top] = { type: 'symbolic', expr: 'pi' };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fldl2e') {
            state.fpuStack.top = (state.fpuStack.top - 1) & 7;
            state.fpuStack.stack[state.fpuStack.top] = { type: 'symbolic', expr: 'log2(e)' };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fldl2t') {
            state.fpuStack.top = (state.fpuStack.top - 1) & 7;
            state.fpuStack.stack[state.fpuStack.top] = { type: 'symbolic', expr: 'log2(10)' };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fldlg2') {
            state.fpuStack.top = (state.fpuStack.top - 1) & 7;
            state.fpuStack.stack[state.fpuStack.top] = { type: 'symbolic', expr: 'log10(2)' };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fldln2') {
            state.fpuStack.top = (state.fpuStack.top - 1) & 7;
            state.fpuStack.stack[state.fpuStack.top] = { type: 'symbolic', expr: 'ln(2)' };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr.match(/^fild(l|ll|s)?$/)) {
            state.fpuStack.top = (state.fpuStack.top - 1) & 7;

            if (operands.length === 1) {
                const src = parseOperand(operands[0]);
                if (src.type === 'immediate') {
                    state.fpuStack.stack[state.fpuStack.top] = { type: 'symbolic', expr: `${src.value}.0` };
                } else {
                    state.fpuStack.stack[state.fpuStack.top] = { type: 'symbolic', expr: `float(${formatValue(src)})` };
                }
            }
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr.match(/^fst(s|l|t)$/)) {
            if (operands.length === 1) {
                const dest = operands[0];
                const st0Val = state.fpuStack.stack[state.fpuStack.top];

                const stMatch = dest.match(/^%st\((\d+)\)$/);
                if (stMatch) {
                    const index = parseInt(stMatch[1]);
                    const physicalIndex = (state.fpuStack.top + index) & 7;
                    state.fpuStack.stack[physicalIndex] = st0Val;
                }
                // Store to memory otherwise, do later
            }
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr.match(/^fstp(s|l|t)?$/)) {
            if (operands.length === 1) {
                const dest = operands[0];
                const st0Value = state.fpuStack.stack[state.fpuStack.top];

                const stMatch = dest.match(/^%st\((\d+)\)$/);
                if (stMatch) {
                    const index = parseInt(stMatch[1]);
                    const physicalIndex = (state.fpuStack.top + index) & 7;
                    state.fpuStack.stack[physicalIndex] = st0Value;
                }
            }

            state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
            state.fpuStack.top = (state.fpuStack.top + 1) & 7;
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr.match(/^fist(p)?(l|ll|s)?$/)) {
            const shouldPop = instr.includes('p');

            if (shouldPop) {
                state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
                state.fpuStack.top = (state.fpuStack.top + 1) & 7;
            }
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr.match(/^fadd(p)?$/)) {
            const st0 = state.fpuStack.stack[state.fpuStack.top];
            const st1Index = (state.fpuStack.top + 1) & 7;
            const st1 = state.fpuStack.stack[st1Index];

            const shouldPop = instr.endsWith('p');

            if (operands.length === 0 || operands[0] === '%st(1)') {
                state.fpuStack.stack[st1Index] = {
                    type: 'symbolic',
                    expr: `${formatValue(st1)} + ${formatValue(st0)}`
                };

                if (shouldPop) {
                    state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
                    state.fpuStack.top = (state.fpuStack.top + 1) & 7;
                }
            } else {
                const stMatch = operands[0].match(/^%st\((\d+)\)$/);
                if (stMatch) {
                    const index = parseInt(stMatch[1]);
                    const physicalIndex = (state.fpuStack.top + index) & 7;
                    const sti = state.fpuStack.stack[physicalIndex];

                    state.fpuStack.stack[state.fpuStack.top] = {
                        type: 'symbolic',
                        expr: `${formatValue(st0)} + ${formatValue(sti)}`
                    };
                }
            }
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr.match(/^fsub(p|r|rp)?$/)) {
            // Subtract operations
            const st0 = state.fpuStack.stack[state.fpuStack.top];
            const st1Index = (state.fpuStack.top + 1) & 7;
            const st1 = state.fpuStack.stack[st1Index];

            const isReverse = instr.includes('r');
            const shouldPop = instr.endsWith('p');

            if (operands.length === 0) {
                // Basic fsub/fsubr/fsubp/fsubrp
                if (isReverse) {
                    // ST(1) = ST(0) - ST(1)
                    state.fpuStack.stack[st1Index] = {
                        type: 'symbolic',
                        expr: `${formatValue(st0)} - ${formatValue(st1)}`
                    };
                } else {
                    // ST(1) = ST(1) - ST(0)
                    state.fpuStack.stack[st1Index] = {
                        type: 'symbolic',
                        expr: `${formatValue(st1)} - ${formatValue(st0)}`
                    };
                }

                if (shouldPop) {
                    state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
                    state.fpuStack.top = (state.fpuStack.top + 1) & 7;
                }
            }
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr.match(/^fmul(p)?$/)) {
            const st0 = state.fpuStack.stack[state.fpuStack.top];
            const st1Index = (state.fpuStack.top + 1) & 7;
            const st1 = state.fpuStack.stack[st1Index];

            const shouldPop = instr.endsWith('p');

            if (operands.length === 0 || operands[0] === '%st(1)') {
                state.fpuStack.stack[st1Index] = {
                    type: 'symbolic',
                    expr: `${formatValue(st1)} * ${formatValue(st0)}`
                };

                if (shouldPop) {
                    state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
                    state.fpuStack.top = (state.fpuStack.top + 1) & 7;
                }
            }
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr.match(/^fdiv(p|r|rp)?$/)) {
            const st0 = state.fpuStack.stack[state.fpuStack.top];
            const st1Index = (state.fpuStack.top + 1) & 7;
            const st1 = state.fpuStack.stack[st1Index];

            const isReverse = instr.includes('r');
            const shouldPop = instr.endsWith('p');

            if (operands.length === 0) {
                if (isReverse) {
                    state.fpuStack.stack[st1Index] = {
                        type: 'symbolic',
                        expr: `${formatValue(st0)} / ${formatValue(st1)}`
                    };
                } else {
                    state.fpuStack.stack[st1Index] = {
                        type: 'symbolic',
                        expr: `${formatValue(st1)} / ${formatValue(st0)}`
                    };
                }

                if (shouldPop) {
                    state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
                    state.fpuStack.top = (state.fpuStack.top + 1) & 7;
                }
            }
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fsqrt') {
            const st0 = state.fpuStack.stack[state.fpuStack.top];
            state.fpuStack.stack[state.fpuStack.top] = {
                type: 'symbolic',
                expr: `sqrt(${formatValue(st0)})`
            };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fabs') {
            const st0 = state.fpuStack.stack[state.fpuStack.top];
            state.fpuStack.stack[state.fpuStack.top] = {
                type: 'symbolic',
                expr: `abs(${formatValue(st0)})`
            };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fchs') {
            const st0 = state.fpuStack.stack[state.fpuStack.top];
            state.fpuStack.stack[state.fpuStack.top] = {
                type: 'symbolic',
                expr: `-${formatValue(st0)}`
            };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fsin') {
            const st0 = state.fpuStack.stack[state.fpuStack.top];
            state.fpuStack.stack[state.fpuStack.top] = {
                type: 'symbolic',
                expr: `sin(${formatValue(st0)})`
            };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fcos') {
            const st0 = state.fpuStack.stack[state.fpuStack.top];
            state.fpuStack.stack[state.fpuStack.top] = {
                type: 'symbolic',
                expr: `cos(${formatValue(st0)})`
            };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fsincos') {
            // Replace ST(0) w/ sin, push cos
            const st0 = state.fpuStack.stack[state.fpuStack.top];

            state.fpuStack.stack[state.fpuStack.top] = {
                type: 'symbolic',
                expr: `sin(${formatValue(st0)})`
            };

            state.fpuStack.top = (state.fpuStack.top - 1) & 7;
            state.fpuStack.stack[state.fpuStack.top] = {
                type: 'symbolic',
                expr: `cos(${formatValue(st0)})`
            };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fptan') {
            // ST(0) = tan(ST(0)), push 1.0
            const st0 = state.fpuStack.stack[state.fpuStack.top];

            state.fpuStack.stack[state.fpuStack.top] = {
                type: 'symbolic',
                expr: `tan(${formatValue(st0)})`
            };

            state.fpuStack.top = (state.fpuStack.top - 1) & 7;
            state.fpuStack.stack[state.fpuStack.top] = {
                type: 'symbolic',
                expr: `1.0`
            };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fpatan') {
            // ST(1) = arctan(ST(1)/ST(0)), pop both, push res
            const st0 = state.fpuStack.stack[state.fpuStack.top];
            const st1Index = (state.fpuStack.top + 1) & 7;
            const st1 = state.fpuStack.stack[st1Index];

            state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
            state.fpuStack.top = (state.fpuStack.top + 1) & 7;

            state.fpuStack.stack[state.fpuStack.top] = {
                type: 'symbolic',
                expr: `atan2(${formatValue(st1)}, ${formatValue(st0)})`
            };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr.match(/^f(yl2x|yl2xp1|2xm1)$/)) {
            // Log and exp functions
            const st0 = state.fpuStack.stack[state.fpuStack.top];
            const st1Index = (state.fpuStack.top + 1) & 7;
            const st1 = state.fpuStack.stack[st1Index];

            let expr: string;
            if (instr === 'fyl2x') {
                // ST(1) * log2(ST(0)), pop ST(0)
                expr = `${formatValue(st1)} * log₂(${formatValue(st0)})`;
            } else if (instr === 'fyl2xp1') {
                // ST(1) * log2(ST(0) + 1), pop ST(0)
                expr = `${formatValue(st1)} * log₂(${formatValue(st0)} + 1)`;
            } else {
                // 2^ST(0) - 1
                expr = `2^${formatValue(st0)} - 1`;
            }

            // Pop ST(0)
            state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
            state.fpuStack.top = (state.fpuStack.top + 1) & 7;

            // Store res
            state.fpuStack.stack[state.fpuStack.top] = { type: 'symbolic', expr };
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'fxch') {
            let index = 1;

            if (operands.length === 1) {
                const stMatch = operands[0].match(/^%st\((\d+)\)$/);
                if (stMatch) {
                    index = parseInt(stMatch[1]);
                }
            }

            const physicalIndex = (state.fpuStack.top + index) & 7;
            const temp = state.fpuStack.stack[state.fpuStack.top];
            state.fpuStack.stack[state.fpuStack.top] = state.fpuStack.stack[physicalIndex];
            state.fpuStack.stack[physicalIndex] = temp;
            state.fpuStack.statusWord.C1 = '0';
        } else if (instr === 'ffree') {
            if (operands.length === 1) {
                const stMatch = operands[0].match(/^%st\((\d+)\)$/);
                if (stMatch) {
                    const index = parseInt(stMatch[1]);
                    const physicalIndex = (state.fpuStack.top + index) & 7;
                    state.fpuStack.stack[physicalIndex] = { type: 'unknown' };
                }
            }
        } else if (instr === 'fincstp') {
            state.fpuStack.top = (state.fpuStack.top - 1) & 7;
        } else if (instr === 'fdecstp') {
            state.fpuStack.top = (state.fpuStack.top + 1) & 7;
        } else if (instr.match(/^fcom(p|pp)?$/)) {
            const st0 = state.fpuStack.stack[state.fpuStack.top];
            let other: types.RegisterValue;

            if (operands.length === 0) {
                const st1Index = (state.fpuStack.top + 1) & 7;
                other = state.fpuStack.stack[st1Index];
            } else {
                const stMatch = operands[0].match(/^%st\((\d+)\)$/);
                if (stMatch) {
                    const index = parseInt(stMatch[1]);
                    const physicalIndex = (state.fpuStack.top + index) & 7;
                    other = state.fpuStack.stack[physicalIndex];
                } else {
                    other = parseOperand(operands[0]);
                }
            }

            state.fpuStack.statusWord.C0 = `${formatValue(st0)} < ${formatValue(other)}`;
            state.fpuStack.statusWord.C2 = `${formatValue(st0)} == ${formatValue(other)} (unordered)`;
            state.fpuStack.statusWord.C3 = `${formatValue(st0)} == ${formatValue(other)}`;

            if (instr === 'fcomp') {
                state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
                state.fpuStack.top = (state.fpuStack.top + 1) & 7;
            } else if (instr === 'fcompp') {
                state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
                state.fpuStack.top = (state.fpuStack.top + 1) & 7;
                state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
                state.fpuStack.top = (state.fpuStack.top + 1) & 7;
            }
        } else if (instr.match(/^fucom(p|pp)?$/)) {
            const st0 = state.fpuStack.stack[state.fpuStack.top];
            const st1Index = (state.fpuStack.top + 1) & 7;
            const st1 = state.fpuStack.stack[st1Index];

            state.fpuStack.statusWord.C0 = `${formatValue(st0)} < ${formatValue(st1)}`;
            state.fpuStack.statusWord.C2 = `unordered`;
            state.fpuStack.statusWord.C3 = `${formatValue(st0)} == ${formatValue(st1)}`;

            if (instr === 'fucomp') {
                state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
                state.fpuStack.top = (state.fpuStack.top + 1) & 7;
            } else if (instr === 'fucompp') {
                state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
                state.fpuStack.top = (state.fpuStack.top + 1) & 7;
                state.fpuStack.stack[state.fpuStack.top] = { type: 'unknown' };
                state.fpuStack.top = (state.fpuStack.top + 1) & 7;
            }
        }
        else {
            // Unknown instruction - mark destination register(s) as unknown
            // Most instructions modify their last operand in AT&T syntax
            if (operands.length > 0) {
                const lastOperand = operands[operands.length - 1];
                if (lastOperand.startsWith('%')) {
                    setRegister(state, lastOperand, { type: 'unknown' });
                }
            }
        }
    }

    return state;
}

export function activate(context: vscode.ExtensionContext) {
    const cpuStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    cpuStatusBarItem.command = 'gas-asm.selectTargetCpu';

    const deadCodeDiagnostics = vscode.languages.createDiagnosticCollection('gas-asm-deadcode');
    context.subscriptions.push(deadCodeDiagnostics);

    function updateDeadCodeDiagnostics(document: vscode.TextDocument) {
        if (document.languageId !== 'gas-asm') {
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];
        const deadCodeRanges = detectDeadCode(document);

        for (const deadCode of deadCodeRanges) {
            const diagnostic = new vscode.Diagnostic(
                deadCode.range,
                deadCode.reason,
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.source = 'gas-asm';
            diagnostic.code = 'dead-code';
            diagnostics.push(diagnostic);
        }

        deadCodeDiagnostics.set(document.uri, diagnostics);
    }

    if (vscode.window.activeTextEditor) {
        updateDeadCodeDiagnostics(vscode.window.activeTextEditor.document);
    }

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.languageId === 'gas-asm') {
                updateDeadCodeDiagnostics(event.document);
            }
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updateDeadCodeDiagnostics(editor.document);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            updateDeadCodeDiagnostics(document);
        })
    );

    function updateCPUStatusBar() {
        const config = vscode.workspace.getConfiguration('gas-asm.performance');
        const cpu = config.get<string>('targetCPU', 'skylake');
        cpuStatusBarItem.text = `Target CPU: ${cpu}`;
        cpuStatusBarItem.tooltip = 'Click to change target CPU';
        cpuStatusBarItem.show();
    }

    updateCPUStatusBar();

    vscode.commands.registerCommand('gas-asm.toggleDeadCodeDetection', async () => {
        const config = vscode.workspace.getConfiguration('gas-asm');
        const current = config.get<boolean>('enableDeadCodeDetection', true);
        await config.update('enableDeadCodeDetection', !current, true);

        if (!current) {
            // Re-enable: run detection on active document
            if (vscode.window.activeTextEditor) {
                updateDeadCodeDiagnostics(vscode.window.activeTextEditor.document);
            }
            vscode.window.showInformationMessage('Dead code detection enabled');
        } else {
            // Disable: clear all diagnostics
            deadCodeDiagnostics.clear();
            vscode.window.showInformationMessage('Dead code detection disabled');
        }
    });

    const registerStateProvider = new RegisterStateProvider();
    const registerStateView = vscode.window.createTreeView('gas-asm.RegisterState', {
        treeDataProvider: registerStateProvider,
        showCollapseAll: true
    });
    context.subscriptions.push(registerStateView);

    let updateTimeout: NodeJS.Timeout | undefined;
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(event => {
            if (event.textEditor.document.languageId !== 'gas-asm') {
                return;
            }

            if (updateTimeout) {
                clearTimeout(updateTimeout);
            }

            updateTimeout = setTimeout(() => {
                const line = event.selections[0].active.line;
                registerStateProvider.updateState(event.textEditor.document, line);
            }, 100);
        })
    );
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.languageId !== 'gas-asm') {
                return;
            }

            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document === event.document) {
                if (updateTimeout) {
                    clearTimeout(updateTimeout);
                }

                updateTimeout = setTimeout(() => {
                    const line = editor.selection.active.line;
                    registerStateProvider.updateState(editor.document, line);
                }, 100);
            }
        })
    );
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.languageId === 'gas-asm') {
                const line = editor.selection.active.line;
                registerStateProvider.updateState(editor.document, line);
            }
        })
    );

    if (vscode.window.activeTextEditor?.document.languageId === 'gas-asm') {
        const editor = vscode.window.activeTextEditor;
        const line = editor.selection.active.line;
        registerStateProvider.updateState(editor.document, line);
    }

    context.subscriptions.push(
        cpuStatusBarItem,
        vscode.commands.registerCommand('gas-asm.selectTargetCpu', async () => {
            const cpus = ['skylake', 'haswell', 'icelake', 'zen2', 'zen3', 'm1', 'generic'];
            const selected = await vscode.window.showQuickPick(cpus, {
                placeHolder: 'Select target CPU microarchitecture'
            });
            if (selected) {
                await vscode.workspace.getConfiguration('gas-asm.performance').update('targetCPU', selected, true);
                updateCPUStatusBar();
                vscode.window.showInformationMessage(`Target CPU set to ${selected}`);
            }
        }),
        vscode.commands.registerCommand('gas-asm.copyCode', async (args: { code: string }) => {
            await vscode.env.clipboard.writeText(args.code);
            vscode.window.showInformationMessage('Code copied to clipboard');
        }),
        vscode.commands.registerCommand('gas-asm.showAlternatives', async (args: { instruction: string }) => {
            const instructionInfo = instructionDatabase.get(args.instruction);
            if (!instructionInfo || !instructionInfo.alternatives) {
                vscode.window.showInformationMessage(`No alternatives available for ${args.instruction}`);
                return;
            }

            // Create webview panel for alternatives
            const panel = vscode.window.createWebviewPanel(
                'gasAsmAlternatives',
                `Alternatives: ${args.instruction}`,
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            // Generate HTML content
            let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alternatives: ${args.instruction}</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            line-height: 1.6;
        }
        h1 {
            color: var(--vscode-textLink-foreground);
            border-bottom: 2px solid var(--vscode-textLink-foreground);
            padding-bottom: 10px;
        }
        .alternative {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
        }
        .alternative h3 {
            margin-top: 0;
            color: var(--vscode-textLink-activeForeground);
        }
        .stats {
            display: flex;
            gap: 20px;
            margin: 10px 0;
            font-size: 0.9em;
        }
        .stat {
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 4px 8px;
            border-radius: 3px;
        }
        pre {
            background: var(--vscode-textCodeBlock-background);
            padding: 12px;
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
        }
        .notes {
            margin: 10px 0;
            padding: 10px;
            background: var(--vscode-inputValidation-infoBackground);
            border-left: 3px solid var(--vscode-inputValidation-infoBorder);
        }
        .tradeoffs {
            margin: 10px 0;
            padding: 10px;
            background: var(--vscode-inputValidation-warningBackground);
            border-left: 3px solid var(--vscode-inputValidation-warningBorder);
        }
        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            cursor: pointer;
            border-radius: 3px;
            font-size: 0.9em;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
    </style>
</head>
<body>
    <h1>Alternative Implementations for <code>${args.instruction}</code></h1>
`;

            instructionInfo.alternatives.forEach((alt, idx) => {
                html += `
    <div class="alternative">
        <h3>${idx + 1}. ${alt.description}</h3>
        <div class="stats">
            <span class="stat">Latency: ${alt.latency} cycles</span>
            <span class="stat">Instructions: ${alt.instructions}</span>
            <span class="stat">Size: ${alt.sizeBytes} bytes</span>
        </div>
        <pre><code>${escapeHtml(alt.code)}</code></pre>
        ${alt.notes && alt.notes.length > 0 ? `
        <div class="notes">
            <strong>Notes:</strong>
            <ul>
                ${alt.notes.map(note => `<li>${escapeHtml(note)}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        ${alt.tradeoffs ? `
        <div class="tradeoffs">
            <strong>Tradeoffs:</strong> ${escapeHtml(alt.tradeoffs)}
        </div>
        ` : ''}
        <button onclick="copyCode${idx}()">Copy Code</button>
    </div>
    <script>
        function copyCode${idx}() {
            const vscode = acquireVsCodeApi();
            vscode.postMessage({ command: 'copy', code: ${JSON.stringify(alt.code)} });
        }
    </script>
`;
            });

            html += `
    <script>
        const vscode = acquireVsCodeApi();
    </script>
</body>
</html>`;

            panel.webview.html = html;

            // Handle messages from webview
            panel.webview.onDidReceiveMessage(
                message => {
                    if (message.command === 'copy') {
                        vscode.env.clipboard.writeText(message.code);
                        vscode.window.showInformationMessage('Code copied to clipboard');
                    }
                },
                undefined,
                context.subscriptions
            );
        })
    );

    /* const completionProvider = vscode.languages.registerCompletionItemProvider(
        'gas-asm',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
                const linePrefix = document.lineAt(position).text.substring(0, position.character);
                const items: vscode.CompletionItem[] = [];

                if (linePrefix.match(/\.\w*$/)) {
                    directiveDatabase.forEach((info, directive) => {
                        const item = new vscode.CompletionItem(directive, vscode.CompletionItemKind.Keyword);
                        item.detail = info.description;
                        const markdown = new vscode.MarkdownString();
                        markdown.appendMarkdown(`**${directive}**\n\n`);
                        markdown.appendMarkdown(`${info.description}\n\n`);
                        if (info.usage) {
                            markdown.appendCodeblock(info.usage, 'gas-asm');
                        }
                        item.documentation = markdown;
                        item.sortText = '1' + directive;
                        items.push(item);
                    });
                }
                // Register completions (starts with %)
                else if (linePrefix.match(/%\w*$/)) {
                    registerDatabase.forEach((info, register) => {
                        const item = new vscode.CompletionItem(register, vscode.CompletionItemKind.Variable);
                        item.detail = `${info.type} - ${info.size}-bit`;
                        const markdown = new vscode.MarkdownString();
                        markdown.appendMarkdown(`**${register}** (${info.size}-bit)\n\n`);
                        markdown.appendMarkdown(`${info.description}\n\n`);
                        markdown.appendMarkdown(`*Type:* ${info.type}`);
                        item.documentation = markdown;
                        item.sortText = '2' + register;
                        items.push(item);
                    });
                }
                // Instruction completions
                else {
                    instructionDatabase.forEach((info, instruction) => {
                        const item = new vscode.CompletionItem(instruction, vscode.CompletionItemKind.Function);
                        item.detail = info.category || 'Instruction';
                        const markdown = new vscode.MarkdownString();
                        markdown.appendMarkdown(`**${instruction}** - ${info.description}\n\n`);
                        markdown.appendCodeblock(`${instruction} ${info.operands}`, 'gas-asm');
                        if (info.category) {
                            markdown.appendMarkdown(`\n*Category:* ${info.category}`);
                        }
                        if (info.flags) {
                            markdown.appendMarkdown(`\n\n*Flags:* ${info.flags}`);
                        }
                        item.documentation = markdown;
                        item.sortText = '3' + instruction;
                        items.push(item);
                    });
                }

                return items;
            }
        },
        '.', '%'
    );
    */

    const hoverProvider = vscode.languages.registerHoverProvider('gas-asm', createHoverProvider());

    const signatureHelpProvider = vscode.languages.registerSignatureHelpProvider(
        'gas-asm',
        {
            provideSignatureHelp(document: vscode.TextDocument, position: vscode.Position): vscode.SignatureHelp | null {
                const line = document.lineAt(position).text;
                const beforeCursor = line.substring(0, position.character);

                // Find instruction at start of line (ignoring labels and whitespace)
                const match = beforeCursor.match(/^\s*(?:[a-zA-Z_][a-zA-Z0-9_.]*:)?\s*([a-zA-Z][a-zA-Z0-9]*)\b/);
                if (!match || !match[1]) {
                    return null;
                }

                const instruction = match[1];
                const instructionInfo = instructionDatabase.get(instruction);

                if (!instructionInfo) {
                    return null;
                }

                const signatureHelp = new vscode.SignatureHelp();
                const markdown = new vscode.MarkdownString();
                markdown.appendMarkdown(instructionInfo.description);
                if (instructionInfo.category) {
                    markdown.appendMarkdown(`\n\n*Category:* ${instructionInfo.category}`);
                }
                if (instructionInfo.flags) {
                    markdown.appendMarkdown(`\n*Flags:* ${instructionInfo.flags}`);
                }

                const signature = new vscode.SignatureInformation(
                    `${instruction} ${instructionInfo.operands}`,
                    markdown
                );

                // Count commas to determine active parameter
                const operandsPart = beforeCursor.substring(match[0].length);
                const commaCount = (operandsPart.match(/,/g) || []).length;

                signatureHelp.signatures = [signature];
                signatureHelp.activeSignature = 0;
                signatureHelp.activeParameter = commaCount;

                return signatureHelp;
            }
        },
        ' ', ','
    );

    const documentSymbolProvider = vscode.languages.registerDocumentSymbolProvider('gas-asm', {
        provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
            const symbols: vscode.DocumentSymbol[] = [];

            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                const labelMatch = line.text.match(/^\s*([a-zA-Z_\.][a-zA-Z0-9_\.]*):/);

                if (labelMatch && labelMatch[1]) {
                    const labelName = labelMatch[1];
                    const range = new vscode.Range(i, 0, i, line.text.length);
                    const selectionRange = new vscode.Range(
                        i,
                        labelMatch.index || 0,
                        i,
                        (labelMatch.index || 0) + labelName.length
                    );

                    const symbol = new vscode.DocumentSymbol(
                        labelName,
                        'Label',
                        vscode.SymbolKind.Function,
                        range,
                        selectionRange
                    );

                    symbols.push(symbol);
                }
            }

            return symbols;
        }
    });

    context.subscriptions.push(
        hoverProvider,
        signatureHelpProvider,
        documentSymbolProvider
    );
}

export function deactivate() { };