"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const instr_1 = require("./instr");
const register_1 = require("./register");
const directive_1 = require("./directive");
function escapeHtml(text) {
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
function getRegisterCategory(reg) {
    if (reg.match(/^%(r(ax|bx|cx|dx|si|di|bp|sp|ip|8|9|1[0-5])|e(ax|bx|cx|dx|si|di|bp|sp)|[abcd][xhl]|[sd]il|[sb]pl|(ax|bx|cx|dx|si|di|bp|sp))$/)) {
        return 'gpr';
    }
    if (reg.match(/^%(xmm|ymm|zmm)\d+$/)) {
        return 'simd';
    }
    if (reg.match(/^%st(\(\d+\))?$/)) {
        return 'fpu';
    }
    return 'other';
}
function normalizeRegister(reg) {
    const category = getRegisterCategory(reg);
    if (category !== 'gpr') {
        return reg;
    }
    const regMap = {
        // 32-bit to 64-bit
        '%eax': '%rax', '%ebx': '%rbx', '%ecx': '%rcx', '%edx': '%rdx',
        '%esi': '%rsi', '%edi': '%rdi', '%ebp': '%rbp', '%esp': '%rsp',
        // 16-bit to 64-bit
        '%ax': '%rax', '%bx': '%rbx', '%cx': '%rcx', '%dx': '%rdx',
        '%si': '%rsi', '%di': '%rdi', '%bp': '%rbp', '%sp': '%rsp',
        // 8-bit to 64-bit
        '%al': '%rax', '%ah': '%rax', '%bl': '%rbx', '%bh': '%rbx',
        '%cl': '%rcx', '%ch': '%rcx', '%dl': '%rdx', '%dh': '%rdx',
        '%sil': '%rsi', '%dil': '%rdi', '%bpl': '%rbp', '%spl': '%rsp',
    };
    return regMap[reg] || reg;
}
function parseOperand(operand) {
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
function formatValue(value, depth = 0) {
    if (depth > 5)
        return '...'; // Prevent excessive recursion
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
function getMemoryKey(addr) {
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
function formatFlags(flags) {
    const parts = [];
    if (flags.ZF)
        parts.push(`ZF=${flags.ZF}`);
    if (flags.CF)
        parts.push(`CF=${flags.CF}`);
    if (flags.SF)
        parts.push(`SF=${flags.SF}`);
    if (flags.OF)
        parts.push(`OF=${flags.OF}`);
    return parts.join(', ');
}
function formatStack(stack) {
    if (stack.items.length === 0) {
        return [];
    }
    const lines = [];
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
function analyzeFunctionInterface(document, functionName) {
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
    const info = {
        name: functionName,
        startLine,
        endLine,
        parametersUsed: [],
        returnRegisters: [],
        registersClobbered: [],
        callsOthers: []
    };
    const registersRead = new Set();
    const registersWritten = new Set();
    // Track what's written in the last few instructions before each ret
    const returnRegisterCandidates = new Set();
    // First pass: find all ret instructions and analyze what's set before them
    const retLines = [];
    for (let i = startLine + 1; i <= endLine; i++) {
        const line = document.lineAt(i).text.trim();
        if (line.match(/^ret[qlfn]?\s*$/)) {
            retLines.push(i);
        }
    }
    // For each ret, look back up to 10 instructions to find what's being prepared
    retLines.forEach(retLine => {
        const lookbackStart = Math.max(startLine + 1, retLine - 10);
        const registersSetBeforeThisRet = new Set();
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
            if (!instrMatch)
                continue;
            const instrName = instrMatch[1].toLowerCase();
            const operands = instrMatch[2].split(',').map(s => s.trim());
            // Track destination register for instructions that write to return registers
            let writesToReturnReg = false;
            if (instrName.startsWith('mov') && operands.length === 2) {
                const destOp = operands[1];
                const destRegs = destOp.matchAll(/%([a-z0-9]+)/g);
                for (const match of destRegs) {
                    const reg = normalizeRegister(`%${match[1]}`);
                    if (RETURN_REGISTERS.includes(reg)) {
                        registersSetBeforeThisRet.add(reg);
                        writesToReturnReg = true;
                    }
                }
            }
            else if (instrName.startsWith('lea') ||
                instrName.match(/^(add|sub|and|or|xor|imul|mul|idiv|div|shl|shr|sar|sal|inc|dec|neg|not)$/)) {
                // These instructions modify their destination (last operand)
                const destOp = operands[operands.length - 1];
                const destRegs = destOp.matchAll(/%([a-z0-9]+)/g);
                for (const match of destRegs) {
                    const reg = normalizeRegister(`%${match[1]}`);
                    if (RETURN_REGISTERS.includes(reg)) {
                        registersSetBeforeThisRet.add(reg);
                        writesToReturnReg = true;
                    }
                }
            }
            else if (instrName.match(/^pop$/)) {
                // Pop writes to register
                if (operands.length === 1) {
                    const destRegs = operands[0].matchAll(/%([a-z0-9]+)/g);
                    for (const match of destRegs) {
                        const reg = normalizeRegister(`%${match[1]}`);
                        if (RETURN_REGISTERS.includes(reg)) {
                            registersSetBeforeThisRet.add(reg);
                            writesToReturnReg = true;
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
        if (!instrMatch)
            continue;
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
        }
        else if (instr.startsWith('lea') && operands.length === 2) {
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
        }
        else if (instr.match(/^(add|sub|and|or|xor|imul|shl|shr|sar|sal|adc|sbb)/)) {
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
        }
        else if (instr.match(/^(cmp|test)/)) {
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
        }
        else if (instr.match(/^(inc|dec|neg|not)/)) {
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
        }
        else if (instr.match(/^push/)) {
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
        }
        else if (instr.match(/^pop/)) {
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
    info.registersClobbered = Array.from(registersWritten).filter(reg => !info.returnRegisters.includes(reg) && reg !== '%rsp' && reg !== '%rbp');
    return info;
}
function detectDeadCode(document) {
    const deadCodeRanges = [];
    let inDeadCode = false;
    let deadCodeReason = '';
    let firstDeadInstructionLine = -1;
    let lastDeadInstructionLine = -1;
    function isInstruction(trimmed) {
        if (trimmed.length === 0)
            return false;
        if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*'))
            return false;
        if (trimmed.startsWith('.'))
            return false;
        if (trimmed.match(/^[a-zA-Z_][a-zA-Z0-9_]*:\s*($|#|\/\/)/))
            return false;
        // Has to look like an instruction (starts with letters)
        return trimmed.match(/^\s*[a-zA-Z]/) !== null;
    }
    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i).text;
        const trimmed = line.trim();
        if (trimmed.length === 0 || trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
            continue;
        }
        // Labels end dead code regions
        const labelMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*|\.L[a-zA-Z0-9_]+):\s*($|#|\/\/)/);
        if (labelMatch) {
            // Label found - code after this label is reachable
            if (inDeadCode && firstDeadInstructionLine !== -1 && lastDeadInstructionLine !== -1) {
                // End the dead code region before this label
                deadCodeRanges.push({
                    range: new vscode.Range(firstDeadInstructionLine, 0, lastDeadInstructionLine, document.lineAt(lastDeadInstructionLine).text.length),
                    reason: deadCodeReason
                });
            }
            inDeadCode = false;
            firstDeadInstructionLine = -1;
            lastDeadInstructionLine = -1;
            continue;
        }
        // Check for directives - they also end dead code regions
        if (trimmed.startsWith('.')) {
            if (inDeadCode && firstDeadInstructionLine !== -1 && lastDeadInstructionLine !== -1) {
                // End the dead code region at the last actual instruction
                deadCodeRanges.push({
                    range: new vscode.Range(firstDeadInstructionLine, 0, lastDeadInstructionLine, document.lineAt(lastDeadInstructionLine).text.length),
                    reason: deadCodeReason
                });
                inDeadCode = false;
                firstDeadInstructionLine = -1;
                lastDeadInstructionLine = -1;
            }
            continue;
        }
        const isInstr = isInstruction(trimmed);
        const unconditionalJump = trimmed.match(/^\s*(jmp|jmpq|ret|retq|retf|retn)\b/);
        if (unconditionalJump && isInstr && !inDeadCode) {
            // Start tracking dead code after this instruction
            const instruction = unconditionalJump[1];
            inDeadCode = true;
            firstDeadInstructionLine = -1; // Will be set when we find first dead instruction
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
        const syscallMatch = trimmed.match(/^\s*syscall\b/);
        if (syscallMatch && isInstr && i > 0 && !inDeadCode) {
            let isExitSyscall = false;
            // Look back at least 5 lines to find syscall num
            for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
                const prevLine = document.lineAt(j).text.trim();
                // $60 (exit) or $231 (exit_group)
                if (prevLine.match(/mov[q]?\s+\$(?:60|231)\s*,\s*%rax/)) {
                    isExitSyscall = true;
                    break;
                }
                // Stop looking hit a label or instruction that mods rax
                if (prevLine.match(/^[a-zA-Z_\.][a-zA-Z0-9_\.]*:\s*$/) ||
                    (prevLine.match(/^\s*[a-zA-Z]/) && prevLine.includes('%rax') && !prevLine.match(/cmp|test/))) {
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
    if (inDeadCode && firstDeadInstructionLine !== -1 && lastDeadInstructionLine !== -1) {
        deadCodeRanges.push({
            range: new vscode.Range(firstDeadInstructionLine, 0, lastDeadInstructionLine, document.lineAt(lastDeadInstructionLine).text.length),
            reason: deadCodeReason
        });
    }
    return deadCodeRanges;
}
class RegisterTreeItem extends vscode.TreeItem {
    constructor(label, collapsibleState, itemType, registerName, value) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.itemType = itemType;
        this.registerName = registerName;
        this.value = value;
        if (itemType === 'category') {
            this.contextValue = 'category';
        }
        else if (itemType === 'register') {
            this.contextValue = 'register';
            this.tooltip = `${registerName}: ${formatValue(value)}`;
        }
        else if (itemType === 'instruction') {
            this.contextValue = 'instruction';
            this.iconPath = new vscode.ThemeIcon('debug-stackframe');
        }
        else if (itemType === 'stack-header') {
            this.iconPath = new vscode.ThemeIcon('chevron-right');
        }
    }
}
class RegisterStateProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.stateBefore = null;
        this.stateAfter = null;
        this.currentDocument = null;
        this.currentLine = -1;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    updateState(document, line) {
        this.currentDocument = document;
        this.currentLine = line;
        this.stateBefore = line > 0 ? analyzeRegisters(document, line - 1) : {
            registers: {},
            memory: {},
            stack: { items: [], offset: 0 },
            flags: {}
        };
        this.stateAfter = analyzeRegisters(document, line);
        this.refresh();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this.stateAfter || !this.currentDocument) {
            return Promise.resolve([]);
        }
        if (!element) {
            const categories = [];
            const currentLine = this.currentDocument.lineAt(this.currentLine);
            const trimmed = currentLine.text.trim();
            if (trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.startsWith('//') && !trimmed.startsWith('.')) {
                const instrMatch = trimmed.match(/^\s*([a-zA-Z][a-zA-Z0-9]*)/);
                if (instrMatch) {
                    categories.push(new RegisterTreeItem(`Line ${this.currentLine + 1}: ${trimmed.substring(0, 50)}${trimmed.length > 50 ? '...' : ''}`, vscode.TreeItemCollapsibleState.None, 'instruction'));
                }
            }
            const changes = this.calculateChanges();
            const gprRegs = this.getRegistersForCategory('gpr');
            if (gprRegs.length > 0) {
                const changedCount = gprRegs.filter(([reg]) => changes.registers.some(c => c.name === reg)).length;
                const label = changedCount > 0
                    ? `General Purpose Registers (${changedCount} changed)`
                    : 'General Purpose Registers';
                categories.push(new RegisterTreeItem(label, vscode.TreeItemCollapsibleState.Expanded, 'category'));
            }
            // SIMD Registers
            const simdRegs = this.getRegistersForCategory('simd');
            if (simdRegs.length > 0) {
                const changedCount = simdRegs.filter(([reg]) => changes.registers.some(c => c.name === reg)).length;
                const label = changedCount > 0
                    ? `SIMD Registers (${changedCount} changed)`
                    : 'SIMD Registers';
                categories.push(new RegisterTreeItem(label, vscode.TreeItemCollapsibleState.Collapsed, 'category'));
            }
            // FPU Registers
            const fpuRegs = this.getRegistersForCategory('fpu');
            if (fpuRegs.length > 0) {
                const changedCount = fpuRegs.filter(([reg]) => changes.registers.some(c => c.name === reg)).length;
                const label = changedCount > 0
                    ? `FPU Registers (${changedCount} changed)`
                    : 'FPU Registers';
                categories.push(new RegisterTreeItem(label, vscode.TreeItemCollapsibleState.Collapsed, 'category'));
            }
            // Other Registers
            const otherRegs = this.getRegistersForCategory('other');
            if (otherRegs.length > 0) {
                const changedCount = otherRegs.filter(([reg]) => changes.registers.some(c => c.name === reg)).length;
                const label = changedCount > 0
                    ? `Other Registers (${changedCount} changed)`
                    : 'Other Registers';
                categories.push(new RegisterTreeItem(label, vscode.TreeItemCollapsibleState.Collapsed, 'category'));
            }
            // Flags
            if (Object.keys(this.stateAfter.flags).length > 0) {
                const changedCount = changes.flags.length;
                const label = changedCount > 0
                    ? `Flags (${changedCount} changed)`
                    : 'Flags';
                categories.push(new RegisterTreeItem(label, vscode.TreeItemCollapsibleState.Expanded, 'category'));
            }
            // Stack
            if (this.stateAfter.stack.items.length > 0 || this.stateBefore.stack.items.length > 0) {
                const beforeCount = this.stateBefore.stack.items.length;
                const afterCount = this.stateAfter.stack.items.length;
                const label = beforeCount !== afterCount
                    ? `Stack (${beforeCount} => ${afterCount} items)`
                    : `Stack (${afterCount} items)`;
                categories.push(new RegisterTreeItem(label, vscode.TreeItemCollapsibleState.Expanded, 'category'));
            }
            // Memory
            const memoryCount = Object.keys(this.stateAfter.memory).length;
            const beforeMemoryCount = Object.keys(this.stateBefore.memory).length;
            if (memoryCount > 0 || beforeMemoryCount > 0) {
                const changedCount = changes.memory.length;
                const label = changedCount > 0
                    ? `Memory (${changedCount} changed)`
                    : `Memory (${memoryCount} locations)`;
                categories.push(new RegisterTreeItem(label, vscode.TreeItemCollapsibleState.Collapsed, 'category'));
            }
            return Promise.resolve(categories);
        }
        else {
            const items = [];
            const changes = this.calculateChanges();
            if (element.itemType === 'instruction') {
                return Promise.resolve([]);
            }
            if (element.label?.startsWith('General Purpose Registers')) {
                const gprRegs = this.getRegistersForCategory('gpr');
                for (const [reg, afterValue] of gprRegs) {
                    items.push(this.createRegisterItem(reg, afterValue, changes.registers));
                }
            }
            else if (element.label?.startsWith('SIMD Registers')) {
                const simdRegs = this.getRegistersForCategory('simd');
                for (const [reg, afterValue] of simdRegs) {
                    items.push(this.createRegisterItem(reg, afterValue, changes.registers));
                }
            }
            else if (element.label?.startsWith('FPU Registers')) {
                const fpuRegs = this.getRegistersForCategory('fpu');
                for (const [reg, afterValue] of fpuRegs) {
                    items.push(this.createRegisterItem(reg, afterValue, changes.registers));
                }
            }
            else if (element.label?.startsWith('Other Registers')) {
                const otherRegs = this.getRegistersForCategory('other');
                for (const [reg, afterValue] of otherRegs) {
                    items.push(this.createRegisterItem(reg, afterValue, changes.registers));
                }
            }
            else if (element.label?.startsWith('Flags')) {
                for (const [flag, afterCondition] of Object.entries(this.stateAfter.flags)) {
                    const beforeCondition = this.stateBefore.flags[flag];
                    const changed = beforeCondition !== afterCondition;
                    let label;
                    if (changed && beforeCondition) {
                        label = `${flag}: ${beforeCondition} => ${afterCondition}`;
                    }
                    else if (changed) {
                        label = `${flag}: undefined => ${afterCondition}`;
                    }
                    else {
                        label = `${flag}: ${afterCondition}`;
                    }
                    const item = new RegisterTreeItem(label, vscode.TreeItemCollapsibleState.None, 'flag');
                    item.iconPath = changed
                        ? new vscode.ThemeIcon('symbol-boolean', new vscode.ThemeColor('charts.yellow'))
                        : new vscode.ThemeIcon('symbol-boolean');
                    items.push(item);
                }
            }
            else if (element.label?.startsWith('Stack')) {
                // Show stack with before/after if it changed
                const beforeStack = this.stateBefore.stack;
                const afterStack = this.stateAfter.stack;
                if (beforeStack.items.length !== afterStack.items.length) {
                    // Stack size changed - show both
                    items.push(new RegisterTreeItem('Before:', vscode.TreeItemCollapsibleState.None, 'stack-header'));
                    for (let i = beforeStack.items.length - 1; i >= 0; i--) {
                        const offset = beforeStack.offset - (beforeStack.items.length - 1 - i) * 8;
                        const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
                        const value = formatValue(beforeStack.items[i]);
                        const label = i === beforeStack.items.length - 1
                            ? `  %rsp${offsetStr}: ${value} ← top`
                            : `  %rsp${offsetStr}: ${value}`;
                        const item = new RegisterTreeItem(label, vscode.TreeItemCollapsibleState.None, 'stack');
                        item.iconPath = new vscode.ThemeIcon('symbol-array');
                        items.push(item);
                    }
                    items.push(new RegisterTreeItem('After:', vscode.TreeItemCollapsibleState.None, 'stack-header'));
                    for (let i = afterStack.items.length - 1; i >= 0; i--) {
                        const offset = afterStack.offset - (afterStack.items.length - 1 - i) * 8;
                        const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
                        const value = formatValue(afterStack.items[i]);
                        const label = i === afterStack.items.length - 1
                            ? `  %rsp${offsetStr}: ${value} ← top`
                            : `  %rsp${offsetStr}: ${value}`;
                        const item = new RegisterTreeItem(label, vscode.TreeItemCollapsibleState.None, 'stack');
                        item.iconPath = new vscode.ThemeIcon('symbol-array', new vscode.ThemeColor('charts.yellow'));
                        items.push(item);
                    }
                }
                else {
                    // Show current stack
                    for (let i = afterStack.items.length - 1; i >= 0; i--) {
                        const offset = afterStack.offset - (afterStack.items.length - 1 - i) * 8;
                        const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
                        const value = formatValue(afterStack.items[i]);
                        const label = i === afterStack.items.length - 1
                            ? `%rsp${offsetStr}: ${value} ← top`
                            : `%rsp${offsetStr}: ${value}`;
                        const item = new RegisterTreeItem(label, vscode.TreeItemCollapsibleState.None, 'stack');
                        item.iconPath = new vscode.ThemeIcon('symbol-array');
                        items.push(item);
                    }
                }
            }
            else if (element.label?.startsWith('Memory')) {
                for (const change of changes.memory) {
                    const label = change.before !== 'undefined' ? `*${change.name}: ${change.before} => ${change.after}` : `*${change.name}: ${change.after}`;
                    const item = new RegisterTreeItem(label, vscode.TreeItemCollapsibleState.None, 'memory');
                    item.iconPath = new vscode.ThemeIcon('symbol-variable', new vscode.ThemeColor('charts.yellow'));
                    items.push(item);
                }
                for (const [addr, value] of Object.entries(this.stateAfter.memory)) {
                    if (!changes.memory.some(c => c.name === addr)) {
                        const item = new RegisterTreeItem(`*${addr}: ${formatValue(value)}`, vscode.TreeItemCollapsibleState.None, 'memory');
                        item.iconPath = new vscode.ThemeIcon('symbol-variable');
                        items.push(item);
                    }
                }
            }
            return Promise.resolve(items);
        }
    }
    getRegistersForCategory(category) {
        return Object.entries(this.stateAfter.registers).filter(([reg, _]) => getRegisterCategory(reg) === category)
            .sort((a, b) => a[0].localeCompare(b[0]));
    }
    calculateChanges() {
        const registerChanges = [];
        const flagChanges = [];
        const memoryChanges = [];
        for (const [reg, afterVal] of Object.entries(this.stateAfter.registers)) {
            const beforeVal = this.stateBefore.registers[reg];
            const afterStr = formatValue(afterVal);
            const beforeStr = beforeVal ? formatValue(beforeVal) : 'undefined';
            if (!beforeVal || formatValue(beforeVal) !== afterStr) {
                registerChanges.push({ name: reg, before: beforeStr, after: afterStr });
            }
        }
        // Flag changes
        for (const [flag, afterCond] of Object.entries(this.stateAfter.flags)) {
            const beforeCond = this.stateBefore.flags[flag];
            if (beforeCond !== afterCond) {
                flagChanges.push({ name: flag, before: beforeCond || 'undefined', after: afterCond });
            }
        }
        // Memory changes
        for (const [addr, afterVal] of Object.entries(this.stateAfter.memory)) {
            const beforeVal = this.stateBefore.memory[addr];
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
    createRegisterItem(reg, afterValue, changes) {
        const change = changes.find(c => c.name === reg);
        let label;
        if (change) {
            // Show before => after
            label = `${reg}: ${change.before} => ${change.after}`;
        }
        else {
            // No change, show current value
            label = `${reg} = ${formatValue(afterValue)}`;
        }
        const item = new RegisterTreeItem(label, vscode.TreeItemCollapsibleState.None, 'register', reg, afterValue);
        // Set icon and color based on whether it changed
        if (change) {
            // Changed - yellow highlight
            item.iconPath = new vscode.ThemeIcon('symbol-number', new vscode.ThemeColor('charts.yellow'));
        }
        else if (afterValue.type === 'immediate') {
            item.iconPath = new vscode.ThemeIcon('symbol-number', new vscode.ThemeColor('charts.green'));
        }
        else if (afterValue.type === 'symbolic' || afterValue.type === 'binary') {
            item.iconPath = new vscode.ThemeIcon('symbol-operator', new vscode.ThemeColor('charts.blue'));
        }
        else if (afterValue.type === 'unknown') {
            item.iconPath = new vscode.ThemeIcon('question', new vscode.ThemeColor('charts.red'));
        }
        else {
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
function createHoverProvider() {
    return {
        provideHover(document, position) {
            const range = document.getWordRangeAtPosition(position, /[.%]?[a-zA-Z_][a-zA-Z0-9_().]*/);
            if (!range) {
                return null;
            }
            const word = document.getText(range);
            const line = document.lineAt(position).text;
            const trimmed = line.trim();
            // Skip if not an instruction line
            if (!trimmed.match(/^\s*[a-zA-Z]/)) {
                return null;
            }
            // Parse the instruction
            const instrMatch = trimmed.match(/^\s*([a-zA-Z][a-zA-Z0-9]*)\s+(.+?)(?:\s*#.*)?$/);
            if (!instrMatch) {
                return null;
            }
            const instruction = instrMatch[1].toLowerCase();
            // Get state before and after this instruction
            const stateBefore = analyzeRegisters(document, position.line - 1);
            const stateAfter = analyzeRegisters(document, position.line);
            // Find what changed
            const changes = [];
            // Check register changes
            for (const [reg, afterVal] of Object.entries(stateAfter.registers)) {
                const beforeVal = stateBefore.registers[reg];
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
                const beforeCond = stateBefore.flags[flag];
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
                const beforeVal = stateBefore.memory[addr];
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
            // If we found changes, show them
            if (changes.length > 0) {
                const markdown = new vscode.MarkdownString();
                markdown.appendMarkdown(`**${instruction}** - State Changes\n\n`);
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
                    markdown.appendMarkdown('```\n');
                }
                // Get instruction info from database
                const instructionInfo = instr_1.instructionDatabase.get(instruction);
                if (instructionInfo) {
                    markdown.appendMarkdown('\n---\n\n');
                    markdown.appendMarkdown(`*${instructionInfo.description}*`);
                }
                return new vscode.Hover(markdown);
            }
            return null;
        }
    };
}
function formatFunctionInfo(info) {
    const lines = [];
    lines.push(`**Function: \`${info.name}\`**\n`);
    if (info.parametersUsed.length > 0) {
        lines.push('**Parameters (detected):**');
        lines.push('```');
        info.parametersUsed.forEach((reg, i) => {
            lines.push(`  arg${i + 1}: ${reg}`);
        });
        lines.push('```\n');
    }
    else {
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
    }
    else {
        lines.push('**Returns:** void\n');
    }
    // Clobbers
    const callerSavedClobbered = info.registersClobbered.filter(r => CALLER_SAVED.includes(r));
    const calleeSavedClobbered = info.registersClobbered.filter(r => CALLEE_SAVED.includes(r));
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
function evaluateBinary(op, left, right) {
    if (left.type === 'immediate' && right.type === 'immediate') {
        let result;
        switch (op) {
            case '+':
                result = left.value + right.value;
                break;
            case '-':
                result = left.value - right.value;
                break;
            case '*':
                result = left.value * right.value;
                break;
            case '&':
                result = left.value & right.value;
                break;
            case '|':
                result = left.value | right.value;
                break;
            case '^':
                result = left.value ^ right.value;
                break;
            case '<<':
                result = left.value << right.value;
                break;
            case '>>':
                result = left.value >> right.value;
                break;
            default: return { type: 'binary', op, left, right };
        }
        return { type: 'immediate', value: result };
    }
    return { type: 'binary', op, left, right };
}
function analyzeRegisters(document, targetLine) {
    const state = {
        registers: {},
        memory: {},
        stack: { items: [], offset: 0 },
        flags: {}
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
        if (!instrMatch)
            continue;
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
        }
        else if (instr.match(/^pop[bwlq]?$/)) {
            // pop dest - loads from stack and increments %rsp
            if (operands.length === 1 && operands[0].startsWith('%')) {
                const destReg = normalizeRegister(operands[0]);
                if (state.stack.items.length > 0) {
                    state.registers[destReg] = state.stack.items.pop();
                    state.stack.offset += 8;
                }
                else {
                    state.registers[destReg] = { type: 'unknown' };
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
                const memMatch = dest.match(/^(-?\d+)?\((%[a-z0-9]+)\)$/);
                if (memMatch) {
                    const offset = memMatch[1] ? parseInt(memMatch[1]) : 0;
                    const baseReg = normalizeRegister(memMatch[2]);
                    const baseVal = state.registers[baseReg] || { type: 'symbolic', expr: baseReg };
                    let addr;
                    if (offset === 0) {
                        addr = baseVal;
                    }
                    else {
                        addr = evaluateBinary('+', baseVal, { type: 'immediate', value: offset });
                    }
                    const memKey = getMemoryKey(addr);
                    if (memKey) {
                        state.memory[memKey] = src;
                    }
                    continue; // Don't process as register move
                }
                // Memory load: mov (%reg), dest or mov offset(%reg), dest
                const srcMemMatch = operands[0].match(/^(-?\d+)?\((%[a-z0-9]+)\)$/);
                if (srcMemMatch && operands[1].startsWith('%')) {
                    const offset = srcMemMatch[1] ? parseInt(srcMemMatch[1]) : 0;
                    const baseReg = normalizeRegister(srcMemMatch[2]);
                    const baseVal = state.registers[baseReg] || { type: 'symbolic', expr: baseReg };
                    let addr;
                    if (offset === 0) {
                        addr = baseVal;
                    }
                    else {
                        addr = evaluateBinary('+', baseVal, { type: 'immediate', value: offset });
                    }
                    const destReg = normalizeRegister(operands[1]);
                    const memKey = getMemoryKey(addr);
                    if (memKey && state.memory[memKey]) {
                        state.registers[destReg] = state.memory[memKey];
                    }
                    else {
                        state.registers[destReg] = { type: 'memory', addr };
                    }
                    continue;
                }
                // Regular register move
                if (operands[1].startsWith('%')) {
                    const destReg = normalizeRegister(operands[1]);
                    state.registers[destReg] = src;
                }
            }
        }
        // Handle comparison and set flags
        else if (instr.match(/^cmp[bwlq]?$/)) {
            // cmp src, dest - computes dest - src and sets flags
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const dest = parseOperand(operands[1]);
                const destStr = formatValue(dest);
                const srcStr = formatValue(src);
                state.flags.ZF = `${destStr} == ${srcStr}`;
                state.flags.CF = `${destStr} < ${srcStr} (unsigned)`;
                state.flags.SF = `${destStr} < ${srcStr} (signed)`;
            }
        }
        else if (instr.match(/^test[bwlq]?$/)) {
            // test src, dest - computes dest & src and sets flags
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const dest = parseOperand(operands[1]);
                const destStr = formatValue(dest);
                const srcStr = formatValue(src);
                state.flags.ZF = `(${destStr} & ${srcStr}) == 0`;
                state.flags.SF = `(${destStr} & ${srcStr}) < 0`;
            }
        }
        // Handle SSE/AVX/FPU instructions (keeping existing logic)
        else if (instr.match(/^(movaps|movups|movapd|movupd|movss|movsd|movdqa|movdqu)$/)) {
            if (operands.length === 2 && operands[1].startsWith('%')) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                state.registers[destReg] = src;
            }
        }
        else if (instr.match(/^v(movaps|movups|movapd|movupd|movss|movsd|movdqa|movdqu)$/)) {
            if (operands.length === 2 && operands[1].startsWith('%')) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                state.registers[destReg] = src;
            }
        }
        else if (instr.match(/^(addps|addss|addpd|addsd|subps|subss|subpd|subsd|mulps|mulss|mulpd|mulsd|divps|divss|divpd|divsd)$/)) {
            if (operands.length === 2 && operands[1].startsWith('%')) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                const op = instr.includes('add') ? '+' : instr.includes('sub') ? '-' : instr.includes('mul') ? '*' : '/';
                state.registers[destReg] = { type: 'symbolic', expr: `${formatValue(currentVal)} ${op} ${formatValue(src)}` };
            }
        }
        else if (instr.match(/^v(addps|addss|addpd|addsd|subps|subss|subpd|subsd|mulps|mulss|mulpd|mulsd|divps|divss|divpd|divsd)$/)) {
            if (operands.length === 3 && operands[2].startsWith('%')) {
                const src1 = parseOperand(operands[0]);
                const src2 = parseOperand(operands[1]);
                const destReg = operands[2];
                const op = instr.includes('add') ? '+' : instr.includes('sub') ? '-' : instr.includes('mul') ? '*' : '/';
                state.registers[destReg] = { type: 'symbolic', expr: `${formatValue(src1)} ${op} ${formatValue(src2)}` };
            }
        }
        else if (instr.match(/^(xorps|xorpd|andps|andpd|orps|orpd)$/)) {
            if (operands.length === 2 && operands[1].startsWith('%')) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                if (instr.startsWith('xor') && src.type === 'register' && src.reg === destReg) {
                    state.registers[destReg] = { type: 'immediate', value: 0 };
                }
                else {
                    const currentVal = state.registers[destReg] || { type: 'unknown' };
                    const op = instr.includes('xor') ? '^' : instr.includes('and') ? '&' : '|';
                    state.registers[destReg] = { type: 'symbolic', expr: `${formatValue(currentVal)} ${op} ${formatValue(src)}` };
                }
            }
        }
        else if (instr.match(/^v(xorps|xorpd|andps|andpd|orps|orpd)$/)) {
            if (operands.length === 3 && operands[2].startsWith('%')) {
                const src1 = parseOperand(operands[0]);
                const src2 = parseOperand(operands[1]);
                const destReg = operands[2];
                if (instr.match(/^vxor/) && src1.type === 'register' && src2.type === 'register' &&
                    src1.reg === src2.reg && src1.reg === destReg) {
                    state.registers[destReg] = { type: 'immediate', value: 0 };
                }
                else {
                    const op = instr.includes('xor') ? '^' : instr.includes('and') ? '&' : '|';
                    state.registers[destReg] = { type: 'symbolic', expr: `${formatValue(src1)} ${op} ${formatValue(src2)}` };
                }
            }
        }
        else if (instr.match(/^(vzeroall|vzeroupper)$/)) {
            for (const reg in state.registers) {
                if (reg.match(/^%(ymm|zmm)\d+$/)) {
                    state.registers[reg] = { type: 'immediate', value: 0 };
                }
            }
        }
        else if (instr.match(/^(paddb|paddw|paddd|paddq|psubb|psubw|psubd|psubq)$/)) {
            if (operands.length === 2 && operands[1].startsWith('%')) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                const op = instr.startsWith('padd') ? '+' : '-';
                state.registers[destReg] = { type: 'symbolic', expr: `${formatValue(currentVal)} ${op} ${formatValue(src)}` };
            }
        }
        else if (instr.match(/^(pand|pandn|por|pxor)$/)) {
            if (operands.length === 2 && operands[1].startsWith('%')) {
                const src = parseOperand(operands[0]);
                const destReg = operands[1];
                if (instr === 'pxor' && src.type === 'register' && src.reg === destReg) {
                    state.registers[destReg] = { type: 'immediate', value: 0 };
                }
                else {
                    const currentVal = state.registers[destReg] || { type: 'unknown' };
                    const op = instr === 'pxor' ? '^' : instr === 'pand' ? '&' : '|';
                    state.registers[destReg] = { type: 'symbolic', expr: `${formatValue(currentVal)} ${op} ${formatValue(src)}` };
                }
            }
        }
        else if (instr.match(/^(fld|fild|fst|fstp|fist|fistp)$/)) {
            if (instr.startsWith('fld') || instr.startsWith('fild')) {
                state.registers['%st(0)'] = { type: 'symbolic', expr: `loaded from ${operands[0] || 'stack'}` };
            }
            else if (instr.match(/^f(i)?stp?$/)) {
                state.registers['%st(0)'] = { type: 'unknown' };
            }
        }
        else if (instr.match(/^(fadd|fsub|fmul|fdiv)p?$/)) {
            state.registers['%st(0)'] = { type: 'symbolic', expr: `FPU ${instr}` };
        }
        else if (instr.match(/^(fldz|fld1|fldpi)$/)) {
            const value = instr === 'fldz' ? '0.0' : instr === 'fld1' ? '1.0' : 'π';
            state.registers['%st(0)'] = { type: 'symbolic', expr: value };
        }
        else if (instr.startsWith('lea')) {
            // lea mem, dest - load effective address
            if (operands.length === 2) {
                const destReg = normalizeRegister(operands[1]);
                state.registers[destReg] = { type: 'symbolic', expr: `&${operands[0]}` };
            }
        }
        else if (instr.startsWith('add')) {
            // add src, dest - dest = dest + src
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                state.registers[destReg] = evaluateBinary('+', currentVal, src);
                // Set flags
                state.flags.ZF = `result == 0`;
                state.flags.SF = `result < 0`;
            }
        }
        else if (instr.startsWith('sub')) {
            // sub src, dest - dest = dest - src
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                state.registers[destReg] = evaluateBinary('-', currentVal, src);
                // Set flags
                state.flags.ZF = `result == 0`;
                state.flags.SF = `result < 0`;
            }
        }
        else if (instr.startsWith('imul') && operands.length === 2) {
            // imul src, dest - dest = dest * src
            const src = parseOperand(operands[0]);
            const destReg = normalizeRegister(operands[1]);
            const currentVal = state.registers[destReg] || { type: 'unknown' };
            state.registers[destReg] = evaluateBinary('*', currentVal, src);
        }
        else if (instr.startsWith('inc')) {
            // inc dest - dest = dest + 1
            if (operands.length === 1) {
                const destReg = normalizeRegister(operands[0]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                state.registers[destReg] = evaluateBinary('+', currentVal, { type: 'immediate', value: 1 });
            }
        }
        else if (instr.startsWith('dec')) {
            // dec dest - dest = dest - 1
            if (operands.length === 1) {
                const destReg = normalizeRegister(operands[0]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                state.registers[destReg] = evaluateBinary('-', currentVal, { type: 'immediate', value: 1 });
            }
        }
        else if (instr.startsWith('neg')) {
            // neg dest - dest = -dest
            if (operands.length === 1) {
                const destReg = normalizeRegister(operands[0]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                if (currentVal.type === 'immediate') {
                    state.registers[destReg] = { type: 'immediate', value: -currentVal.value };
                }
                else {
                    state.registers[destReg] = { type: 'symbolic', expr: `-${formatValue(currentVal)}` };
                }
            }
        }
        else if (instr.startsWith('and')) {
            // and src, dest - dest = dest & src
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                state.registers[destReg] = evaluateBinary('&', currentVal, src);
            }
        }
        else if (instr.startsWith('or')) {
            // or src, dest - dest = dest | src
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                state.registers[destReg] = evaluateBinary('|', currentVal, src);
            }
        }
        else if (instr.startsWith('xor')) {
            // xor src, dest - dest = dest ^ src
            // Special case: xor reg, reg = 0
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = normalizeRegister(operands[1]);
                if (src.type === 'register' && src.reg === destReg) {
                    state.registers[destReg] = { type: 'immediate', value: 0 };
                }
                else {
                    const currentVal = state.registers[destReg] || { type: 'unknown' };
                    state.registers[destReg] = evaluateBinary('^', currentVal, src);
                }
            }
        }
        else if (instr.startsWith('shl') || instr.startsWith('sal')) {
            // shl src, dest - dest = dest << src
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                state.registers[destReg] = evaluateBinary('<<', currentVal, src);
            }
        }
        else if (instr.startsWith('shr') || instr.startsWith('sar')) {
            // shr src, dest - dest = dest >> src
            if (operands.length === 2) {
                const src = parseOperand(operands[0]);
                const destReg = normalizeRegister(operands[1]);
                const currentVal = state.registers[destReg] || { type: 'unknown' };
                state.registers[destReg] = evaluateBinary('>>', currentVal, src);
            }
        }
        else if (instr === 'call' || instr === 'callq') {
            // Function calls clobber volatile registers (System V AMD64 ABI)
            // Volatile: rax, rcx, rdx, rsi, rdi, r8-r11
            const volatileRegs = ['%rax', '%rcx', '%rdx', '%rsi', '%rdi',
                '%r8', '%r9', '%r10', '%r11'];
            volatileRegs.forEach(reg => {
                state.registers[reg] = { type: 'unknown' };
            });
            // Clear flags after function call
            state.flags = {};
        }
        else if (instr.startsWith('j') || instr === 'loop' || instr === 'loope' || instr === 'loopne') {
            // Branches/loops - mark registers as unknown after branch
            // (We can't follow control flow, so be conservative)
            for (const reg in state.registers) {
                state.registers[reg] = { type: 'unknown' };
            }
            // Clear flags
            state.flags = {};
        }
        else {
            // Unknown instruction - mark destination register(s) as unknown
            // Most instructions modify their last operand in AT&T syntax
            if (operands.length > 0) {
                const lastOperand = operands[operands.length - 1];
                if (lastOperand.startsWith('%')) {
                    const destReg = normalizeRegister(lastOperand);
                    state.registers[destReg] = { type: 'unknown' };
                }
            }
        }
    }
    return state;
}
function activate(context) {
    const cpuStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    cpuStatusBarItem.command = 'gas-asm.selectTargetCpu';
    const deadCodeDiagnostics = vscode.languages.createDiagnosticCollection('gas-asm-deadcode');
    context.subscriptions.push(deadCodeDiagnostics);
    function updateDeadCodeDiagnostics(document) {
        if (document.languageId !== 'gas-asm') {
            return;
        }
        const diagnostics = [];
        const deadCodeRanges = detectDeadCode(document);
        for (const deadCode of deadCodeRanges) {
            const diagnostic = new vscode.Diagnostic(deadCode.range, deadCode.reason, vscode.DiagnosticSeverity.Warning);
            diagnostic.source = 'gas-asm';
            diagnostic.code = 'dead-code';
            diagnostics.push(diagnostic);
        }
        deadCodeDiagnostics.set(document.uri, diagnostics);
    }
    if (vscode.window.activeTextEditor) {
        updateDeadCodeDiagnostics(vscode.window.activeTextEditor.document);
    }
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.languageId === 'gas-asm') {
            updateDeadCodeDiagnostics(event.document);
        }
    }));
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateDeadCodeDiagnostics(editor.document);
        }
    }));
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(document => {
        updateDeadCodeDiagnostics(document);
    }));
    function updateCPUStatusBar() {
        const config = vscode.workspace.getConfiguration('gas-asm.performance');
        const cpu = config.get('targetCPU', 'skylake');
        cpuStatusBarItem.text = `Target CPU: ${cpu}`;
        cpuStatusBarItem.tooltip = 'Click to change target CPU';
        cpuStatusBarItem.show();
    }
    updateCPUStatusBar();
    vscode.commands.registerCommand('gas-asm.toggleDeadCodeDetection', async () => {
        const config = vscode.workspace.getConfiguration('gas-asm');
        const current = config.get('enableDeadCodeDetection', true);
        await config.update('enableDeadCodeDetection', !current, true);
        if (!current) {
            // Re-enable: run detection on active document
            if (vscode.window.activeTextEditor) {
                updateDeadCodeDiagnostics(vscode.window.activeTextEditor.document);
            }
            vscode.window.showInformationMessage('Dead code detection enabled');
        }
        else {
            // Disable: clear all diagnostics
            deadCodeDiagnostics.clear();
            vscode.window.showInformationMessage('Dead code detection disabled');
        }
    });
    const registerStateProvider = new RegisterStateProvider();
    const registerStateView = vscode.window.createTreeView('gas-asm.registerState', {
        treeDataProvider: registerStateProvider,
        showCollapseAll: true
    });
    context.subscriptions.push(registerStateView);
    let updateTimeout;
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(event => {
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
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
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
    }));
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.languageId === 'gas-asm') {
            const line = editor.selection.active.line;
            registerStateProvider.updateState(editor.document, line);
        }
    }));
    if (vscode.window.activeTextEditor?.document.languageId === 'gas-asm') {
        const editor = vscode.window.activeTextEditor;
        const line = editor.selection.active.line;
        registerStateProvider.updateState(editor.document, line);
    }
    context.subscriptions.push(cpuStatusBarItem, vscode.commands.registerCommand('gas-asm.selectTargetCpu', async () => {
        const cpus = ['skylake', 'haswell', 'icelake', 'zen2', 'zen3', 'm1', 'generic'];
        const selected = await vscode.window.showQuickPick(cpus, {
            placeHolder: 'Select target CPU microarchitecture'
        });
        if (selected) {
            await vscode.workspace.getConfiguration('gas-asm.performance').update('targetCPU', selected, true);
            updateCPUStatusBar();
            vscode.window.showInformationMessage(`Target CPU set to ${selected}`);
        }
    }), vscode.commands.registerCommand('gas-asm.copyCode', async (args) => {
        await vscode.env.clipboard.writeText(args.code);
        vscode.window.showInformationMessage('Code copied to clipboard');
    }), vscode.commands.registerCommand('gas-asm.showAlternatives', async (args) => {
        const instructionInfo = instr_1.instructionDatabase.get(args.instruction);
        if (!instructionInfo || !instructionInfo.alternatives) {
            vscode.window.showInformationMessage(`No alternatives available for ${args.instruction}`);
            return;
        }
        // Create webview panel for alternatives
        const panel = vscode.window.createWebviewPanel('gasAsmAlternatives', `Alternatives: ${args.instruction}`, vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
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
        panel.webview.onDidReceiveMessage(message => {
            if (message.command === 'copy') {
                vscode.env.clipboard.writeText(message.code);
                vscode.window.showInformationMessage('Code copied to clipboard');
            }
        }, undefined, context.subscriptions);
    }));
    const completionProvider = vscode.languages.registerCompletionItemProvider('gas-asm', {
        provideCompletionItems(document, position) {
            const linePrefix = document.lineAt(position).text.substring(0, position.character);
            const items = [];
            if (linePrefix.match(/\.\w*$/)) {
                directive_1.directiveDatabase.forEach((info, directive) => {
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
                register_1.registerDatabase.forEach((info, register) => {
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
                instr_1.instructionDatabase.forEach((info, instruction) => {
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
    }, '.', '%');
    const hoverProvider = vscode.languages.registerHoverProvider('gas-asm', createHoverProvider());
    const signatureHelpProvider = vscode.languages.registerSignatureHelpProvider('gas-asm', {
        provideSignatureHelp(document, position) {
            const line = document.lineAt(position).text;
            const beforeCursor = line.substring(0, position.character);
            // Find instruction at start of line (ignoring labels and whitespace)
            const match = beforeCursor.match(/^\s*(?:[a-zA-Z_][a-zA-Z0-9_.]*:)?\s*([a-zA-Z][a-zA-Z0-9]*)\b/);
            if (!match || !match[1]) {
                return null;
            }
            const instruction = match[1];
            const instructionInfo = instr_1.instructionDatabase.get(instruction);
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
            const signature = new vscode.SignatureInformation(`${instruction} ${instructionInfo.operands}`, markdown);
            // Count commas to determine active parameter
            const operandsPart = beforeCursor.substring(match[0].length);
            const commaCount = (operandsPart.match(/,/g) || []).length;
            signatureHelp.signatures = [signature];
            signatureHelp.activeSignature = 0;
            signatureHelp.activeParameter = commaCount;
            return signatureHelp;
        }
    }, ' ', ',');
    const documentSymbolProvider = vscode.languages.registerDocumentSymbolProvider('gas-asm', {
        provideDocumentSymbols(document) {
            const symbols = [];
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                const labelMatch = line.text.match(/^\s*([a-zA-Z_\.][a-zA-Z0-9_\.]*):/);
                if (labelMatch && labelMatch[1]) {
                    const labelName = labelMatch[1];
                    const range = new vscode.Range(i, 0, i, line.text.length);
                    const selectionRange = new vscode.Range(i, labelMatch.index || 0, i, (labelMatch.index || 0) + labelName.length);
                    const symbol = new vscode.DocumentSymbol(labelName, 'Label', vscode.SymbolKind.Function, range, selectionRange);
                    symbols.push(symbol);
                }
            }
            return symbols;
        }
    });
    context.subscriptions.push(completionProvider, hoverProvider, signatureHelpProvider, documentSymbolProvider);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
;
//# sourceMappingURL=extension.js.map