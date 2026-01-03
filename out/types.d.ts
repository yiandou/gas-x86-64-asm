import * as vscode from 'vscode';
export interface InstructionInfo {
    description: string;
    operands: string;
    category?: string;
    flags?: string;
    performance?: {
        [cpuArch: string]: PerformanceInfo;
    };
    alternatives?: Alternative[];
}
export interface PerformanceInfo {
    latency: number;
    throughput: number;
    ports: string[];
    sizeBytes: number;
    category: 'optimal' | 'moderate' | 'slow' | 'very-slow';
}
export interface Alternative {
    code: string;
    description: string;
    latency: number;
    throughput: number;
    sizeBytes: number;
    instructions: number;
    notes?: string[];
    tradeoffs?: string;
}
export interface RegisterInfo {
    description: string;
    size: number;
    type: string;
}
export interface DirectiveInfo {
    description: string;
    usage?: string;
}
export type RegisterValue = {
    type: 'immediate';
    value: number;
} | {
    type: 'symbolic';
    expr: string;
} | {
    type: 'unknown';
} | {
    type: 'register';
    reg: string;
} | {
    type: 'memory';
    addr: RegisterValue;
} | {
    type: 'binary';
    op: string;
    left: RegisterValue;
    right: RegisterValue;
};
export interface RegisterState {
    [register: string]: RegisterValue;
}
export interface MemoryState {
    [address: string]: RegisterValue;
}
export interface StackState {
    items: RegisterValue[];
    offset: number;
}
export interface FlagState {
    ZF?: string;
    CF?: string;
    SF?: string;
    OF?: string;
    AF?: string;
    PF?: string;
}
export interface FullState {
    registers: RegisterState;
    memory: MemoryState;
    stack: StackState;
    flags: FlagState;
}
export interface FunctionInfo {
    name: string;
    startLine: number;
    endLine: number;
    parametersUsed: string[];
    returnRegisters: string[];
    registersClobbered: string[];
    callsOthers: string[];
}
export interface SyscallInfo {
    number: number;
    name: string;
    description: string;
    parameters: string[];
    returns: string;
    errors?: string;
}
export interface DeadCodeRange {
    range: vscode.Range;
    reason: string;
}
