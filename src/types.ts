import * as vscode from 'vscode';

export interface InstructionInfo {
    description: string;
    operands: string;
    category?: string;
    flags?: string;
    performance?: { [cpuArch: string]: PerformanceInfo };
    alternatives?: Alternative[];
};

export interface PerformanceInfo {
    latency: number;
    throughput: number;
    ports: string[];
    sizeBytes: number;
    category: 'optimal' | 'moderate' | 'slow' | 'very-slow';
};

export interface Alternative {
    code: string;
    description: string;
    latency: number;
    throughput: number;
    sizeBytes: number;
    instructions: number;
    notes?: string[];
    tradeoffs?: string;
};

export interface RegisterInfo {
    description: string;
    size: number;
    type: string;
};

export interface DirectiveInfo {
    description: string;
    usage?: string;
};

export type RegisterValue =
    | { type: 'immediate', value: number }
    | { type: 'symbolic', expr: string }
    | { type: 'unknown' }
    | { type: 'register', reg: string }
    | { type: 'memory', addr: RegisterValue }
    | { type: 'binary', op: string, left: RegisterValue, right: RegisterValue };

export interface RegisterState {
    [register: string]: RegisterValue;
}

export interface MemoryState {
    [address: string]: RegisterValue;
}

export interface StackState {
    items: RegisterValue[];
    offset: number; // Offset from initial %rsp
    frameBytes: number; // Bytes reserved by initial subq $n, %rsp (0 if none)
}

export interface FlagState {
    ZF?: string;
    CF?: string;
    SF?: string; // Sign flag
    OF?: string; // Overflow flag
    AF?: string; // Aux carry flag
    PF?: string; // Parity flag
}

export interface FullState {
    registers: RegisterState;
    memory: MemoryState;
    stack: StackState;
    flags: FlagState;
    fpuStack: FPUStackState;
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
};

export interface DeadCodeRange {
    range: vscode.Range;
    reason: string;
};

export interface FPUStackState {
    stack: RegisterValue[]; // ST(0) index 0, ST(7) index 7
    top: number; // Top pointer/index 0-7
    statusWord: {
        C0?: string;
        C1?: string;
        C2?: string;
        C3?: string;
        stackFault?: boolean;
    };
}