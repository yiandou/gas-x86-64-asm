import { InstructionInfo } from './types';

export const instructionDatabase: Map<string, InstructionInfo> = new Map([
    // ========== Data Transfer Instructions ==========
    ['mov', {
        description: 'Move data between registers or memory',
        operands: 'src, dest',
        category: 'Data Transfer',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['movb', {
        description: 'Move byte (8-bit)',
        operands: 'src, dest',
        category: 'Data Transfer',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 2, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' }
        }
    }],
    ['movw', {
        description: 'Move word (16-bit)',
        operands: 'src, dest',
        category: 'Data Transfer',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['movl', {
        description: 'Move long (32-bit)',
        operands: 'src, dest',
        category: 'Data Transfer',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['movq', {
        description: 'Move quadword (64-bit)',
        operands: 'src, dest',
        category: 'Data Transfer',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['movabs', {
        description: 'Move 64-bit immediate value',
        operands: 'imm64, reg64',
        category: 'Data Transfer',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 10, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 10, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 10, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 10, category: 'optimal' }
        }
    }],
    ['movsx', {
        description: 'Move with sign extension',
        operands: 'src, dest',
        category: 'Data Transfer',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p0123'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p0156'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['movsxd', {
        description: 'Move doubleword with sign extension',
        operands: 'src32, dest64',
        category: 'Data Transfer',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['movzx', {
        description: 'Move with zero extension',
        operands: 'src, dest',
        category: 'Data Transfer',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p0123'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p0156'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['lea', {
        description: 'Load effective address',
        operands: 'mem, reg',
        category: 'Data Transfer',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p15'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p12'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p15'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p15'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['leaq', {
        description: 'Load effective address (64-bit)',
        operands: 'mem, reg64',
        category: 'Data Transfer',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p15'], sizeBytes: 5, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p12'], sizeBytes: 5, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p15'], sizeBytes: 5, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p15'], sizeBytes: 5, category: 'optimal' }
        }
    }],
    ['push', {
        description: 'Push value onto stack',
        operands: 'src',
        category: 'Stack Operations',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p23', 'p4'], sizeBytes: 1, category: 'optimal' },
            'zen3': { latency: 3, throughput: 1, ports: ['p23', 'p7'], sizeBytes: 1, category: 'optimal' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p23', 'p4'], sizeBytes: 1, category: 'optimal' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p23', 'p4'], sizeBytes: 1, category: 'optimal' }
        }
    }],
    ['pushq', {
        description: 'Push quadword onto stack',
        operands: 'src',
        category: 'Stack Operations',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p23', 'p4'], sizeBytes: 1, category: 'optimal' },
            'zen3': { latency: 3, throughput: 1, ports: ['p23', 'p7'], sizeBytes: 1, category: 'optimal' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p23', 'p4'], sizeBytes: 1, category: 'optimal' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p23', 'p4'], sizeBytes: 1, category: 'optimal' }
        }
    }],
    ['pop', {
        description: 'Pop value from stack',
        operands: 'dest',
        category: 'Stack Operations',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p23'], sizeBytes: 1, category: 'optimal' },
            'zen3': { latency: 3, throughput: 1, ports: ['p23'], sizeBytes: 1, category: 'optimal' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p23'], sizeBytes: 1, category: 'optimal' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p23'], sizeBytes: 1, category: 'optimal' }
        }
    }],
    ['popq', {
        description: 'Pop quadword from stack',
        operands: 'dest',
        category: 'Stack Operations',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p23'], sizeBytes: 1, category: 'optimal' },
            'zen3': { latency: 3, throughput: 1, ports: ['p23'], sizeBytes: 1, category: 'optimal' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p23'], sizeBytes: 1, category: 'optimal' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p23'], sizeBytes: 1, category: 'optimal' }
        }
    }],
    ['xchg', {
        description: 'Exchange register/memory with register',
        operands: 'reg/mem, reg',
        category: 'Data Transfer',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p0123'], sizeBytes: 2, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p0156'], sizeBytes: 2, category: 'optimal' }
        }
    }],
    ['movzb', { description: 'Move byte with zero extension', operands: 'src8, dest', category: 'Data Transfer' }],
    ['movzw', { description: 'Move word with zero extension', operands: 'src16, dest', category: 'Data Transfer' }],
    ['bswap', { description: 'Byte swap (reverse byte order)', operands: 'reg32/64', category: 'Data Transfer' }],
    ['cmpxchg8b', { description: 'Compare and exchange 8 bytes', operands: 'mem64', category: 'Data Transfer', flags: 'ZF' }],
    ['cmpxchg16b', { description: 'Compare and exchange 16 bytes', operands: 'mem128', category: 'Data Transfer', flags: 'ZF' }],

    // ========== Arithmetic Instructions ==========
    ['add', {
        description: 'Add source to destination',
        operands: 'src, dest',
        category: 'Arithmetic',
        flags: 'OF,SF,ZF,AF,CF,PF',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['addq', {
        description: 'Add quadwords (64-bit)',
        operands: 'src64, dest64',
        category: 'Arithmetic',
        flags: 'OF,SF,ZF,AF,CF,PF',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['adc', {
        description: 'Add with carry',
        operands: 'src, dest',
        category: 'Arithmetic',
        flags: 'OF,SF,ZF,AF,CF,PF',
        performance: {
            'skylake': { latency: 1, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 1, ports: ['p03'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['sub', {
        description: 'Subtract source from destination',
        operands: 'src, dest',
        category: 'Arithmetic',
        flags: 'OF,SF,ZF,AF,CF,PF',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['subq', {
        description: 'Subtract quadwords',
        operands: 'src64, dest64',
        category: 'Arithmetic',
        flags: 'OF,SF,ZF,AF,CF,PF',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['sbb', {
        description: 'Subtract with borrow',
        operands: 'src, dest',
        category: 'Arithmetic',
        flags: 'OF,SF,ZF,AF,CF,PF',
        performance: {
            'skylake': { latency: 1, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 1, ports: ['p03'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['imul', {
        description: 'Signed multiply',
        operands: 'src [,dest] [,imm]',
        category: 'Arithmetic',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 3, throughput: 0.5, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 0.5, ports: ['p16'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 0.5, ports: ['p16'], sizeBytes: 4, category: 'moderate' }
        },
        alternatives: [
            {
                code: 'leaq (%rax,%rax,2), %rax  # For multiply by 3\n# Or combine shifts/adds for small constants',
                description: 'LEA-based multiplication for small constants',
                latency: 1,
                throughput: 0.5,
                sizeBytes: 5,
                instructions: 1,
                notes: ['3x faster', 'Better port distribution', 'Only for specific constants like 2,3,5,9'],
                tradeoffs: 'Limited to specific multiplication factors'
            }
        ]
    }],
    ['imulb', { description: 'Signed multiply bytes', operands: 'src8 [,dest8] [,imm8]', category: 'Arithmetic', flags: 'OF,CF' }],
    ['imulw', { description: 'Signed multiply words', operands: 'src16 [,dest16] [,imm16]', category: 'Arithmetic', flags: 'OF,CF' }],
    ['imull', { description: 'Signed multiply longs', operands: 'src32 [,dest32] [,imm32]', category: 'Arithmetic', flags: 'OF,CF' }],
    ['imulq', { description: 'Signed multiply quads', operands: 'src64 [,dest64] [,imm32]', category: 'Arithmetic', flags: 'OF,CF' }],
    ['mul', {
        description: 'Unsigned multiply',
        operands: 'src',
        category: 'Arithmetic',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 3, category: 'moderate' },
            'zen3': { latency: 3, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 0.5, ports: ['p16'], sizeBytes: 3, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 0.5, ports: ['p16'], sizeBytes: 3, category: 'moderate' }
        }
    }],
    ['mulb', { description: 'Unsigned multiply bytes', operands: 'src8', category: 'Arithmetic', flags: 'OF,CF' }],
    ['mulw', { description: 'Unsigned multiply words', operands: 'src16', category: 'Arithmetic', flags: 'OF,CF' }],
    ['mull', { description: 'Unsigned multiply longs', operands: 'src32', category: 'Arithmetic', flags: 'OF,CF' }],
    ['mulq', { description: 'Unsigned multiply quads', operands: 'src64', category: 'Arithmetic', flags: 'OF,CF' }],
    ['idiv', {
        description: 'Signed divide',
        operands: 'divisor',
        category: 'Arithmetic',
        performance: {
            'skylake': { latency: 57, throughput: 42, ports: ['p0'], sizeBytes: 3, category: 'very-slow' },
            'zen3': { latency: 41, throughput: 41, ports: ['p0'], sizeBytes: 3, category: 'very-slow' },
            'alderlake': { latency: 52, throughput: 42, ports: ['p0'], sizeBytes: 3, category: 'very-slow' },
            'raptorlake': { latency: 50, throughput: 40, ports: ['p0'], sizeBytes: 3, category: 'very-slow' }
        },
        alternatives: [
            {
                code: '# For constant divisors, use magic multiply:\nmovq $0x..., %rdx  # Magic constant\nimulq %rax\nsarq $shift, %rdx',
                description: 'Magic constant multiplication (for constant divisors)',
                latency: 5,
                throughput: 2,
                sizeBytes: 18,
                instructions: 3,
                notes: ['~10x faster than IDIV', 'Compiler generates this automatically', 'Only for compile-time constants'],
                tradeoffs: 'Requires knowing divisor at compile time'
            }
        ]
    }],
    ['div', {
        description: 'Unsigned divide',
        operands: 'divisor',
        category: 'Arithmetic',
        performance: {
            'skylake': { latency: 35, throughput: 35, ports: ['p0'], sizeBytes: 3, category: 'very-slow' },
            'zen3': { latency: 33, throughput: 33, ports: ['p0'], sizeBytes: 3, category: 'very-slow' },
            'alderlake': { latency: 36, throughput: 36, ports: ['p0'], sizeBytes: 3, category: 'very-slow' },
            'raptorlake': { latency: 35, throughput: 35, ports: ['p0'], sizeBytes: 3, category: 'very-slow' }
        },
        alternatives: [
            {
                code: '# For power-of-2 divisors:\nshrq $3, %rax  # Divide by 8',
                description: 'Shift right for power-of-2 divisors',
                latency: 1,
                throughput: 0.5,
                sizeBytes: 4,
                instructions: 1,
                notes: ['35x faster', 'Only works for powers of 2'],
                tradeoffs: 'Only applicable when divisor is 2^n'
            },
            {
                code: '# For constants, use magic multiply similar to IDIV',
                description: 'Magic constant multiplication',
                latency: 5,
                throughput: 2,
                sizeBytes: 18,
                instructions: 3,
                notes: ['~7x faster', 'Works for any constant'],
                tradeoffs: 'Requires compile-time constant'
            }
        ]
    }],
    ['divb', { description: 'Unsigned divide bytes', operands: 'divisor8', category: 'Arithmetic' }],
    ['divw', { description: 'Unsigned divide words', operands: 'divisor16', category: 'Arithmetic' }],
    ['divl', { description: 'Unsigned divide longs', operands: 'divisor32', category: 'Arithmetic' }],
    ['divq', { description: 'Unsigned divide quads', operands: 'divisor64', category: 'Arithmetic' }],
    ['inc', {
        description: 'Increment by 1',
        operands: 'dest',
        category: 'Arithmetic',
        flags: 'OF,SF,ZF,AF,PF',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 2, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' }
        }
    }],
    ['dec', {
        description: 'Decrement by 1',
        operands: 'dest',
        category: 'Arithmetic',
        flags: 'OF,SF,ZF,AF,PF',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 2, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' }
        }
    }],
    ['neg', {
        description: 'Two\'s complement negation',
        operands: 'dest',
        category: 'Arithmetic',
        flags: 'OF,SF,ZF,AF,CF,PF',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 2, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' }
        }
    }],
    ['cmp', {
        description: 'Compare operands',
        operands: 'src, dest',
        category: 'Arithmetic',
        flags: 'OF,SF,ZF,AF,CF,PF',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['cmpq', {
        description: 'Compare quadwords',
        operands: 'src64, dest64',
        category: 'Arithmetic',
        flags: 'OF,SF,ZF,AF,CF,PF',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['addb', { description: 'Add bytes', operands: 'src8, dest8', category: 'Arithmetic', flags: 'OF,SF,ZF,AF,CF,PF' }],
    ['addw', { description: 'Add words', operands: 'src16, dest16', category: 'Arithmetic', flags: 'OF,SF,ZF,AF,CF,PF' }],
    ['addl', { description: 'Add longs (32-bit)', operands: 'src32, dest32', category: 'Arithmetic', flags: 'OF,SF,ZF,AF,CF,PF' }],
    ['subw', { description: 'Subtract words', operands: 'src16, dest16', category: 'Arithmetic', flags: 'OF,SF,ZF,AF,CF,PF' }],
    ['subl', { description: 'Subtract longs', operands: 'src32, dest32', category: 'Arithmetic', flags: 'OF,SF,ZF,AF,CF,PF' }],
    ['sbb', { description: 'Subtract with borrow', operands: 'src, dest', category: 'Arithmetic', flags: 'OF,SF,ZF,AF,CF,PF' }],
    ['incb', { description: 'Increment byte', operands: 'dest8', category: 'Arithmetic', flags: 'OF,SF,ZF,AF,PF' }],
    ['incw', { description: 'Increment word', operands: 'dest16', category: 'Arithmetic', flags: 'OF,SF,ZF,AF,PF' }],
    ['incl', { description: 'Increment long', operands: 'dest32', category: 'Arithmetic', flags: 'OF,SF,ZF,AF,PF' }],
    ['incq', { description: 'Increment quadword', operands: 'dest64', category: 'Arithmetic', flags: 'OF,SF,ZF,AF,PF' }],
    ['cmpb', { description: 'Compare bytes', operands: 'src8, dest8', category: 'Arithmetic', flags: 'OF,SF,ZF,AF,CF,PF' }],
    ['cmpw', { description: 'Compare words', operands: 'src16, dest16', category: 'Arithmetic', flags: 'OF,SF,ZF,AF,CF,PF' }],
    ['cmpl', { description: 'Compare longs', operands: 'src32, dest32', category: 'Arithmetic', flags: 'OF,SF,ZF,AF,CF,PF' }],

    // ========== Logical Instructions ==========
    ['and', {
        description: 'Bitwise AND',
        operands: 'src, dest',
        category: 'Logic',
        flags: 'SF,ZF,PF (OF=CF=0)',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['andb', { description: 'Bitwise AND bytes', operands: 'src8, dest8', category: 'Logic', flags: 'SF,ZF,PF (OF=CF=0)' }],
    ['andw', { description: 'Bitwise AND words', operands: 'src16, dest16', category: 'Logic', flags: 'SF,ZF,PF (OF=CF=0)' }],
    ['andl', { description: 'Bitwise AND longs', operands: 'src32, dest32', category: 'Logic', flags: 'SF,ZF,PF (OF=CF=0)' }],
    ['andq', {
        description: 'Bitwise AND (64-bit)',
        operands: 'src64, dest64',
        category: 'Logic',
        flags: 'SF,ZF,PF (OF=CF=0)',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['or', {
        description: 'Bitwise OR',
        operands: 'src, dest',
        category: 'Logic',
        flags: 'SF,ZF,PF (OF=CF=0)',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['orb', { description: 'Bitwise OR bytes', operands: 'src8, dest8', category: 'Logic', flags: 'SF,ZF,PF (OF=CF=0)' }],
    ['orw', { description: 'Bitwise OR words', operands: 'src16, dest16', category: 'Logic', flags: 'SF,ZF,PF (OF=CF=0)' }],
    ['orl', { description: 'Bitwise OR longs', operands: 'src32, dest32', category: 'Logic', flags: 'SF,ZF,PF (OF=CF=0)' }],
    ['orq', {
        description: 'Bitwise OR (64-bit)',
        operands: 'src64, dest64',
        category: 'Logic',
        flags: 'SF,ZF,PF (OF=CF=0)',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['xor', {
        description: 'Bitwise XOR (special case: xor reg,reg zeros register)',
        operands: 'src, dest',
        category: 'Logic',
        flags: 'SF,ZF,PF (OF=CF=0)',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' }
        },
        alternatives: [
            {
                code: 'xorl %eax, %eax  # Zero 32-bit register (zeros upper 32 bits too)',
                description: 'XOR 32-bit register to zero (smaller encoding)',
                latency: 1,
                throughput: 0.25,
                sizeBytes: 2,
                instructions: 1,
                notes: ['1 byte smaller', 'Same performance', 'Zeros entire 64-bit register', 'Preferred idiom'],
                tradeoffs: 'None - always use this for zeroing registers'
            },
            {
                code: 'movq $0, %rax  # Move immediate zero',
                description: 'Move immediate zero (breaks dependency chains)',
                latency: 1,
                throughput: 0.25,
                sizeBytes: 7,
                instructions: 1,
                notes: ['4 bytes larger', 'Breaks dependency chain', 'Use when you need independent zero'],
                tradeoffs: '4 bytes larger but breaks dependency chains'
            },
            {
                code: 'subq %rax, %rax  # Subtract register from itself',
                description: 'Subtract register from itself',
                latency: 1,
                throughput: 0.25,
                sizeBytes: 3,
                instructions: 1,
                notes: ['Same size as XOR', 'Sets flags differently', 'Rarely used'],
                tradeoffs: 'No advantage over XOR, just different flag behavior'
            }
        ]
    }],
    ['xorq', {
        description: 'Bitwise XOR (64-bit)',
        operands: 'src64, dest64',
        category: 'Logic',
        flags: 'SF,ZF,PF (OF=CF=0)',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 4, category: 'optimal' }
        },
    }],
    ['not', {
        description: 'One\'s complement (bitwise NOT)',
        operands: 'dest',
        category: 'Logic',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 2, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' }
        }
    }],
    ['notb', {
        description: 'One\'s complement (bitwise NOT) byte',
        operands: 'dest8',
        category: 'Logic',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 2, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' }
        }
    }],
    ['notw', {
        description: 'One\'s complement (bitwise NOT) word',
        operands: 'dest16',
        category: 'Logic',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 2, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' }
        }
    }],
    ['notl', {
        description: 'One\'s complement (bitwise NOT) long',
        operands: 'dest32',
        category: 'Logic',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 2, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' }
        }
    }],
    ['notq', {
        description: 'One\'s complement (bitwise NOT) 64-bit',
        operands: 'dest64',
        category: 'Logic',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 2, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 2, category: 'optimal' }
        }
    }],
    ['test', {
        description: 'Logical compare (AND but don\'t store)',
        operands: 'src, dest',
        category: 'Logic',
        flags: 'SF,ZF,PF (OF=CF=0)',
        performance: {
            'skylake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.25, ports: ['p0156'], sizeBytes: 3, category: 'optimal' }
        }
    }],

    // ========== Shift and Rotate Instructions ==========
    ['shl', {
        description: 'Shift left (logical)',
        operands: 'count, dest',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        },
        alternatives: [
            {
                code: 'leaq (%rax,%rax,1), %rax  # Shift left by 1 (multiply by 2)',
                description: 'LEA for shift left by 1',
                latency: 1,
                throughput: 0.5,
                sizeBytes: 5,
                instructions: 1,
                notes: ['Same performance', 'Uses different ports (p15 vs p06)', 'Better for port pressure'],
                tradeoffs: '2 bytes larger but uses different execution port'
            },
            {
                code: 'addq %rax, %rax  # Shift left by 1 (multiply by 2)',
                description: 'ADD for shift left by 1',
                latency: 1,
                throughput: 0.25,
                sizeBytes: 3,
                instructions: 1,
                notes: ['Better throughput (0.25 vs 0.5)', 'Same size', 'Sets flags differently'],
                tradeoffs: 'Different flag behavior, but faster throughput'
            },
            {
                code: 'imulq $8, %rax  # Shift left by 3 (multiply by 8)',
                description: 'IMUL for larger constant shifts',
                latency: 3,
                throughput: 1,
                sizeBytes: 4,
                instructions: 1,
                notes: ['Single instruction', 'Works for any power of 2', 'Slower than shift'],
                tradeoffs: 'Slower but more flexible for large shifts'
            }
        ]
    }],
    ['shlb', {
        description: 'Shift left (logical) byte',
        operands: 'count, dest8',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['shlw', {
        description: 'Shift left (logical) word',
        operands: 'count, dest16',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['shll', {
        description: 'Shift left (logical) long (32-bit)',
        operands: 'count, dest32',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['shlq', {
        description: 'Shift left (logical) 64-bit',
        operands: 'count, dest64',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['shr', {
        description: 'Shift right (logical)',
        operands: 'count, dest',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['shrb', {
        description: 'Shift right (logical) byte',
        operands: 'count, dest8',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['shrw', {
        description: 'Shift right (logical) word',
        operands: 'count, dest16',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['shrl', {
        description: 'Shift right (logical) long (32-bit)',
        operands: 'count, dest32',
        category: 'Shift/Rotate',
        flags: 'OF,SF ,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['shrq', {
        description: 'Shift right (logical) 64-bit',
        operands: 'count, dest64',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['sal', {
        description: 'Shift arithmetic left (same as SHL)',
        operands: 'count, dest',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['salb', {
        description: 'Shift arithmetic left (byte)',
        operands: 'count, dest8',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['salw', {
        description: 'Shift arithmetic left (word)',
        operands: 'count, dest16',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['sall', {
        description: 'Shift arithmetic left (long/32-bit)',
        operands: 'count, dest32',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['salq', {
        description: 'Shift arithmetic left (64-bit)',
        operands: 'count, dest64',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['sar', {
        description: 'Shift arithmetic right (sign extension)',
        operands: 'count, dest',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['sarb', {
        description: 'Shift arithmetic right (byte)',
        operands: 'count, dest8',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['sarw', {
        description: 'Shift arithmetic right (word)',
        operands: 'count, dest16',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['sarl', {
        description: 'Shift arithmetic right (long/32-bit)',
        operands: 'count, dest32',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['sarq', {
        description: 'Shift arithmetic right (64-bit)',
        operands: 'count, dest64',
        category: 'Shift/Rotate',
        flags: 'OF,SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['rol', {
        description: 'Rotate left',
        operands: 'count, dest',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['rolb', {
        description: 'Rotate left byte',
        operands: 'count, dest8',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['rolw', {
        description: 'Rotate left word',
        operands: 'count, dest16',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['roll', {
        description: 'Rotate left long (32-bit)',
        operands: 'count, dest32',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['rolq', {
        description: 'Rotate left 64-bit',
        operands: 'count, dest64',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['ror', {
        description: 'Rotate right',
        operands: 'count, dest',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['rorb', {
        description: 'Rotate right byte',
        operands: 'count, dest8',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['rorw', {
        description: 'Rotate right word',
        operands: 'count, dest16',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['rorl', {
        description: 'Rotate right long (32-bit)',
        operands: 'count, dest32',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['rorq', {
        description: 'Rotate right 64-bit',
        operands: 'count, dest64',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['rcl', {
        description: 'Rotate through carry left',
        operands: 'count, dest',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'zen3': { latency: 3, throughput: 1, ports: ['p01'], sizeBytes: 3, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' }
        }
    }],
    ['rclb', {
        description: 'Rotate through carry left byte',
        operands: 'count, dest8',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'zen3': { latency: 3, throughput: 1, ports: ['p01'], sizeBytes: 3, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' }
        }
    }],
    ['rclw', {
        description: 'Rotate through carry left word',
        operands: 'count, dest16',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'zen3': { latency: 3, throughput: 1, ports: ['p01'], sizeBytes: 3, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' }
        }
    }],
    ['rcll', {
        description: 'Rotate through carry left long (32-bit)',
        operands: 'count, dest32',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'zen3': { latency: 3, throughput: 1, ports: ['p01'], sizeBytes: 3, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' }
        }
    }],
    ['rclq', {
        description: 'Rotate through carry left 64-bit',
        operands: 'count, dest64',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 3, throughput: 1, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 4, category: 'moderate' }
        }
    }],
    ['rcr', {
        description: 'Rotate through carry right',
        operands: 'count, dest',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'zen3': { latency: 3, throughput: 1, ports: ['p01'], sizeBytes: 3, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' }
        }
    }],
    ['rcrb', {
        description: 'Rotate through carry right byte',
        operands: 'count, dest8',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'zen3': { latency: 3, throughput: 1, ports: ['p01'], sizeBytes: 3, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' }
        }
    }],
    ['rcrw', {
        description: 'Rotate through carry right word',
        operands: 'count, dest16',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'zen3': { latency: 3, throughput: 1, ports: ['p01'], sizeBytes: 3, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' }
        }
    }],
    ['rcrl', {
        description: 'Rotate through carry right long (32-bit)',
        operands: 'count, dest32',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'zen3': { latency: 3, throughput: 1, ports: ['p01'], sizeBytes: 3, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 3, category: 'moderate' }
        }
    }],
    ['rcrq', {
        description: 'Rotate through carry right 64-bit',
        operands: 'count, dest64',
        category: 'Shift/Rotate',
        flags: 'OF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 3, throughput: 1, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p06'], sizeBytes: 4, category: 'moderate' }
        }
    }],
    ['shld', {
        description: 'Double precision shift left',
        operands: 'count, src, dest',
        category: 'Shift/Rotate',
        flags: 'SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 2, ports: ['p1', 'p6'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 3, throughput: 2, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' }
        }
    }],
    ['shldb', {
        description: 'Double precision shift left byte',
        operands: 'count, src8, dest8',
        category: 'Shift/Rotate',
        flags: 'SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 2, ports: ['p1', 'p6'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 3, throughput: 2, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' }
        }
    }],
    ['shldw', {
        description: 'Double precision shift left word',
        operands: 'count, src16, dest16',
        category: 'Shift/Rotate',
        flags: 'SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 2, ports: ['p1', 'p6'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 3, throughput: 2, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' }
        }
    }],
    ['shldl', {
        description: 'Double precision shift left long (32-bit)',
        operands: 'count, src32, dest32',
        category: 'Shift/Rotate',
        flags: 'SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 2, ports: ['p1', 'p6'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 3, throughput: 2, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' }
        }
    }],
    ['shldq', {
        description: 'Double precision shift left 64-bit',
        operands: 'count, src64, dest64',
        category: 'Shift/Rotate',
        flags: 'SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 2, ports: ['p1', 'p6'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 3, throughput: 2, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' }
        }
    }],
    ['shrd', {
        description: 'Double precision shift right',
        operands: 'count, src, dest',
        category: 'Shift/Rotate',
        flags: 'SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 2, ports: ['p1', 'p6'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 3, throughput: 2, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' }
        }
    }],
    ['shrdb', {
        description: 'Double precision shift right byte',
        operands: 'count, src8, dest8',
        category: 'Shift/Rotate',
        flags: 'SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 2, ports: ['p1', 'p6'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 3, throughput: 2, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' }
        }
    }],
    ['shrdw', {
        description: 'Double precision shift right word',
        operands: 'count, src16, dest16',
        category: 'Shift/Rotate',
        flags: 'SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 2, ports: ['p1', 'p6'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 3, throughput: 2, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' }
        }
    }],
    ['shrdl', {
        description: 'Double precision shift right long (32-bit)',
        operands: 'count, src32, dest32',
        category: 'Shift/Rotate',
        flags: 'SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 2, ports: ['p1', 'p6'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 3, throughput: 2, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' }
        }
    }],
    ['shrdq', {
        description: 'Double precision shift right 64-bit',
        operands: 'count, src64, dest64',
        category: 'Shift/Rotate',
        flags: 'SF,ZF,PF,CF',
        performance: {
            'skylake': { latency: 3, throughput: 2, ports: ['p1', 'p6'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 3, throughput: 2, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 2, ports: ['p16'], sizeBytes: 4, category: 'moderate' }
        }
    }],

    // ========== Control Flow Instructions ==========
    ['jmp', {
        description: 'Unconditional jump',
        operands: 'target',
        category: 'Control Flow',
        performance: {
            'skylake': { latency: 0, throughput: 0.5, ports: ['p6'], sizeBytes: 2, category: 'optimal' },
            'zen3': { latency: 0, throughput: 0.5, ports: ['branch'], sizeBytes: 2, category: 'optimal' },
            'alderlake': { latency: 0, throughput: 0.5, ports: ['p6'], sizeBytes: 2, category: 'optimal' },
            'raptorlake': { latency: 0, throughput: 0.5, ports: ['p6'], sizeBytes: 2, category: 'optimal' }
        }
    }],
    ['je', {
        description: 'Jump if equal (ZF=1)',
        operands: 'target',
        category: 'Control Flow',
        flags: 'Tests ZF',
        performance: {
            'skylake': { latency: 0, throughput: 0.5, ports: ['p6'], sizeBytes: 2, category: 'optimal' },
            'zen3': { latency: 0, throughput: 0.5, ports: ['branch'], sizeBytes: 2, category: 'optimal' },
            'alderlake': { latency: 0, throughput: 0.5, ports: ['p6'], sizeBytes: 2, category: 'optimal' },
            'raptorlake': { latency: 0, throughput: 0.5, ports: ['p6'], sizeBytes: 2, category: 'optimal' }
        }
    }],
    ['jne', {
        description: 'Jump if not equal (ZF=0)',
        operands: 'target',
        category: 'Control Flow',
        flags: 'Tests ZF',
        performance: {
            'skylake': { latency: 0, throughput: 0.5, ports: ['p6'], sizeBytes: 2, category: 'optimal' },
            'zen3': { latency: 0, throughput: 0.5, ports: ['branch'], sizeBytes: 2, category: 'optimal' },
            'alderlake': { latency: 0, throughput: 0.5, ports: ['p6'], sizeBytes: 2, category: 'optimal' },
            'raptorlake': { latency: 0, throughput: 0.5, ports: ['p6'], sizeBytes: 2, category: 'optimal' }
        }
    }],
    ['call', {
        description: 'Call procedure',
        operands: 'target',
        category: 'Control Flow',
        performance: {
            'skylake': { latency: 2, throughput: 2, ports: ['p23', 'p4', 'p6'], sizeBytes: 5, category: 'optimal' },
            'zen3': { latency: 2, throughput: 2, ports: ['branch', 'p23', 'p7'], sizeBytes: 5, category: 'optimal' },
            'alderlake': { latency: 2, throughput: 2, ports: ['p23', 'p4', 'p6'], sizeBytes: 5, category: 'optimal' },
            'raptorlake': { latency: 2, throughput: 2, ports: ['p23', 'p4', 'p6'], sizeBytes: 5, category: 'optimal' }
        }
    }],
    ['ret', {
        description: 'Return from procedure',
        operands: '',
        category: 'Control Flow',
        performance: {
            'skylake': { latency: 2, throughput: 1, ports: ['p23', 'p6'], sizeBytes: 1, category: 'optimal' },
            'zen3': { latency: 2, throughput: 1, ports: ['branch', 'p23'], sizeBytes: 1, category: 'optimal' },
            'alderlake': { latency: 2, throughput: 1, ports: ['p23', 'p6'], sizeBytes: 1, category: 'optimal' },
            'raptorlake': { latency: 2, throughput: 1, ports: ['p23', 'p6'], sizeBytes: 1, category: 'optimal' }
        }
    }],
    ['callq', { description: 'Call procedure (64-bit)', operands: 'target', category: 'Control Flow' }],
    ['retq', { description: 'Return from procedure (64-bit)', operands: '[pop_count]', category: 'Control Flow' }],
    ['jz', { description: 'Jump if zero (ZF=1)', operands: 'target', category: 'Control Flow', flags: 'Tests ZF' }],
    ['jnz', { description: 'Jump if not zero (ZF=0)', operands: 'target', category: 'Control Flow', flags: 'Tests ZF' }],
    ['jg', { description: 'Jump if greater (signed: ZF=0 and SF=OF)', operands: 'target', category: 'Control Flow', flags: 'Tests ZF,SF,OF' }],
    ['jge', { description: 'Jump if greater or equal (signed: SF=OF)', operands: 'target', category: 'Control Flow', flags: 'Tests SF,OF' }],
    ['jl', { description: 'Jump if less (signed: SF≠OF)', operands: 'target', category: 'Control Flow', flags: 'Tests SF,OF' }],
    ['jle', { description: 'Jump if less or equal (signed: ZF=1 or SF≠OF)', operands: 'target', category: 'Control Flow', flags: 'Tests ZF,SF,OF' }],
    ['ja', { description: 'Jump if above (unsigned: CF=0 and ZF=0)', operands: 'target', category: 'Control Flow', flags: 'Tests CF,ZF' }],
    ['jae', { description: 'Jump if above or equal (unsigned: CF=0)', operands: 'target', category: 'Control Flow', flags: 'Tests CF' }],
    ['jb', { description: 'Jump if below (unsigned: CF=1)', operands: 'target', category: 'Control Flow', flags: 'Tests CF' }],
    ['jbe', { description: 'Jump if below or equal (unsigned: CF=1 or ZF=1)', operands: 'target', category: 'Control Flow', flags: 'Tests CF,ZF' }],
    ['jc', { description: 'Jump if carry (CF=1)', operands: 'target', category: 'Control Flow', flags: 'Tests CF' }],
    ['jnc', { description: 'Jump if not carry (CF=0)', operands: 'target', category: 'Control Flow', flags: 'Tests CF' }],
    ['jo', { description: 'Jump if overflow (OF=1)', operands: 'target', category: 'Control Flow', flags: 'Tests OF' }],
    ['jno', { description: 'Jump if not overflow (OF=0)', operands: 'target', category: 'Control Flow', flags: 'Tests OF' }],
    ['js', { description: 'Jump if sign (SF=1)', operands: 'target', category: 'Control Flow', flags: 'Tests SF' }],
    ['jns', { description: 'Jump if not sign (SF=0)', operands: 'target', category: 'Control Flow', flags: 'Tests SF' }],
    ['jp', { description: 'Jump if parity (PF=1)', operands: 'target', category: 'Control Flow', flags: 'Tests PF' }],
    ['jpe', { description: 'Jump if parity even (PF=1)', operands: 'target', category: 'Control Flow', flags: 'Tests PF' }],
    ['jnp', { description: 'Jump if not parity (PF=0)', operands: 'target', category: 'Control Flow', flags: 'Tests PF' }],
    ['jpo', { description: 'Jump if parity odd (PF=0)', operands: 'target', category: 'Control Flow', flags: 'Tests PF' }],
    ['jcxz', { description: 'Jump if CX is zero', operands: 'target', category: 'Control Flow' }],
    ['jecxz', { description: 'Jump if ECX is zero', operands: 'target', category: 'Control Flow' }],
    ['jrcxz', { description: 'Jump if RCX is zero', operands: 'target', category: 'Control Flow' }],
    ['loop', { description: 'Decrement RCX and jump if RCX≠0', operands: 'target', category: 'Control Flow' }],
    ['loope', { description: 'Decrement RCX and jump if RCX≠0 and ZF=1', operands: 'target', category: 'Control Flow' }],
    ['loopne', { description: 'Decrement RCX and jump if RCX≠0 and ZF=0', operands: 'target', category: 'Control Flow' }],

    // ========== Bit Manipulation ==========
    ['bt', {
        description: 'Bit test (copy bit to CF)',
        operands: 'bit_index, bit_base',
        category: 'Bit Manipulation',
        flags: 'CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['bts', {
        description: 'Bit test and set',
        operands: 'bit_index, bit_base',
        category: 'Bit Manipulation',
        flags: 'CF',
        performance: {
            'skylake': { latency: 1, throughput: 1, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 1, ports: ['p0123'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 1, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 1, ports: ['p06'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['btr', {
        description: 'Bit test and reset',
        operands: 'bit_index, bit_base',
        category: 'Bit Manipulation',
        flags: 'CF',
        performance: {
            'skylake': { latency: 1, throughput: 1, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 1, ports: ['p0123'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 1, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 1, ports: ['p06'], sizeBytes: 4, category: 'optimal' }
        }
    }],
    ['bsf', {
        description: 'Bit scan forward (find first set bit)',
        operands: 'src, dest',
        category: 'Bit Manipulation',
        flags: 'ZF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 4, throughput: 2, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 4, category: 'moderate' }
        },
        alternatives: [
            {
                code: 'tzcnt %rax, %rbx  # Count trailing zeros (BMI1)',
                description: 'TZCNT instruction (BMI1)',
                latency: 3,
                throughput: 1,
                sizeBytes: 5,
                instructions: 1,
                notes: ['Requires BMI1', 'Defined result for zero input', 'Better for modern CPUs'],
                tradeoffs: 'Requires BMI1 support (Intel Haswell+, AMD Piledriver+)'
            }
        ]
    }],
    ['bsr', {
        description: 'Bit scan reverse (find last set bit)',
        operands: 'src, dest',
        category: 'Bit Manipulation',
        flags: 'ZF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 4, category: 'moderate' },
            'zen3': { latency: 4, throughput: 2, ports: ['p01'], sizeBytes: 4, category: 'moderate' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 4, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 4, category: 'moderate' }
        },
        alternatives: [
            {
                code: 'lzcnt %rax, %rbx  # Count leading zeros (ABM/LZCNT)',
                description: 'LZCNT instruction (ABM)',
                latency: 3,
                throughput: 1,
                sizeBytes: 5,
                instructions: 1,
                notes: ['Requires LZCNT/ABM', 'Defined result for zero input', 'Better for modern CPUs'],
                tradeoffs: 'Requires LZCNT support (Intel Haswell+, AMD K10+)'
            }
        ]
    }],
    ['lzcnt', {
        description: 'Count leading zero bits',
        operands: 'src, dest',
        category: 'Bit Manipulation',
        flags: 'CF,ZF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 5, category: 'moderate' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 5, category: 'optimal' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 5, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 5, category: 'moderate' }
        }
    }],
    ['tzcnt', {
        description: 'Count trailing zero bits',
        operands: 'src, dest',
        category: 'Bit Manipulation',
        flags: 'CF,ZF',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 5, category: 'moderate' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 5, category: 'optimal' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 5, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 5, category: 'moderate' }
        }
    }],
    ['popcnt', {
        description: 'Count number of bits set to 1',
        operands: 'src, dest',
        category: 'Bit Manipulation',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 5, category: 'moderate' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 5, category: 'optimal' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 5, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 5, category: 'moderate' }
        }
    }],
    ['btc', { description: 'Bit test and complement', operands: 'bit_index, bit_base', category: 'Bit Manipulation', flags: 'CF' }],

    // ========== BMI/BMI2 Instructions ==========
    ['andn', {
        description: 'Logical AND NOT (BMI1: dest = ~src1 & src2)',
        operands: 'src1, src2, dest',
        category: 'BMI',
        flags: 'SF,ZF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 5, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 5, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 5, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 5, category: 'optimal' }
        }
    }],
    ['bextr', {
        description: 'Bit field extract (BMI1)',
        operands: 'start_len, src, dest',
        category: 'BMI',
        flags: 'ZF',
        performance: {
            'skylake': { latency: 2, throughput: 2, ports: ['p06'], sizeBytes: 6, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 6, category: 'optimal' },
            'alderlake': { latency: 2, throughput: 2, ports: ['p06'], sizeBytes: 6, category: 'optimal' },
            'raptorlake': { latency: 2, throughput: 2, ports: ['p06'], sizeBytes: 6, category: 'optimal' }
        }
    }],
    ['blsi', {
        description: 'Extract lowest set bit (BMI1)',
        operands: 'src, dest',
        category: 'BMI',
        flags: 'SF,ZF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 5, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 5, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 5, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 5, category: 'optimal' }
        }
    }],
    ['blsmsk', {
        description: 'Get mask up to lowest set bit (BMI1)',
        operands: 'src, dest',
        category: 'BMI',
        flags: 'SF,ZF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 5, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 5, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 5, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 5, category: 'optimal' }
        }
    }],
    ['blsr', {
        description: 'Reset lowest set bit (BMI1)',
        operands: 'src, dest',
        category: 'BMI',
        flags: 'SF,ZF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 5, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.25, ports: ['p0123'], sizeBytes: 5, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 5, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 5, category: 'optimal' }
        }
    }],
    ['bzhi', {
        description: 'Zero high bits starting from index (BMI2)',
        operands: 'index, src, dest',
        category: 'BMI2',
        flags: 'SF,ZF,CF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 6, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p01'], sizeBytes: 6, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 6, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 6, category: 'optimal' }
        }
    }],
    ['pdep', {
        description: 'Parallel bits deposit (BMI2)',
        operands: 'mask, src, dest',
        category: 'BMI2',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 6, category: 'moderate' },
            'zen3': { latency: 18, throughput: 18, ports: ['p0'], sizeBytes: 6, category: 'very-slow' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 6, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 6, category: 'moderate' }
        }
    }],
    ['pext', {
        description: 'Parallel bits extract (BMI2)',
        operands: 'mask, src, dest',
        category: 'BMI2',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 6, category: 'moderate' },
            'zen3': { latency: 18, throughput: 18, ports: ['p0'], sizeBytes: 6, category: 'very-slow' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 6, category: 'moderate' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p1'], sizeBytes: 6, category: 'moderate' }
        }
    }],

    // ========== Conditional Move and SetCC ==========
    ['cmove', {
        description: 'Conditional move if equal (ZF=1)',
        operands: 'src, dest',
        category: 'Conditional Move',
        flags: 'Tests ZF',
        performance: {
            'skylake': { latency: 2, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p0123'], sizeBytes: 4, category: 'optimal' },
            'alderlake': { latency: 2, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' },
            'raptorlake': { latency: 2, throughput: 0.5, ports: ['p06'], sizeBytes: 4, category: 'optimal' }
        },
        alternatives: [
            {
                code: '# Branch-based alternative:\nje .equal\nmovq %rbx, %rax  # else case\njmp .done\n.equal:\nmovq %rcx, %rax  # if case\n.done:',
                description: 'Branch-based conditional move',
                latency: 1,
                throughput: 0.5,
                sizeBytes: 15,
                instructions: 3,
                notes: ['Faster if predictable', 'Worse if unpredictable (branch misprediction penalty ~15-20 cycles)', 'Use for rarely-taken paths'],
                tradeoffs: 'Fast when predicted, ~20 cycles penalty on misprediction'
            },
            {
                code: '# Branchless with arithmetic (for boolean conditions):\n# Assuming ZF is set from cmp:\nsete %al\nmovzbq %al, %rax\nimulq %rcx, %rax  # multiply by "if" value\nmovq %rbx, %rdx\nxorl %eax, %eax\nsete %al\nmovzbq %al, %rax\nimulq %rdx, %rax  # add "else" value',
                description: 'Arithmetic branchless conditional',
                latency: 12,
                throughput: 5,
                sizeBytes: 28,
                instructions: 7,
                notes: ['Always predictable latency', 'Good for crypto/security', 'Avoids timing attacks'],
                tradeoffs: 'Much slower but constant-time'
            },
            {
                code: '# Using SETCC + mask:\nsete %al\nmovzbq %al, %rdx\ndecq %rdx  # Create mask: 0 -> -1, 1 -> 0\nandq %rdx, %rax  # Apply mask\nnotq %rdx\nandq %rdx, %rbx\norq %rbx, %rax',
                description: 'SETCC + bitwise mask approach',
                latency: 7,
                throughput: 3,
                sizeBytes: 24,
                instructions: 7,
                notes: ['No branches', 'Constant time', 'Better for unpredictable conditions'],
                tradeoffs: 'More instructions but no branch misprediction'
            }
        ]
    }],
    ['cmovne', { description: 'Conditional move if not equal (ZF=0)', operands: 'src, dest', category: 'Conditional Move', flags: 'Tests ZF' }],
    ['cmovg', { description: 'Conditional move if greater (signed)', operands: 'src, dest', category: 'Conditional Move', flags: 'Tests ZF,SF,OF' }],
    ['cmovge', { description: 'Conditional move if greater or equal (signed)', operands: 'src, dest', category: 'Conditional Move', flags: 'Tests SF,OF' }],
    ['cmovl', { description: 'Conditional move if less (signed)', operands: 'src, dest', category: 'Conditional Move', flags: 'Tests SF,OF' }],
    ['cmovle', { description: 'Conditional move if less or equal (signed)', operands: 'src, dest', category: 'Conditional Move', flags: 'Tests ZF,SF,OF' }],
    ['cmova', { description: 'Conditional move if above (unsigned)', operands: 'src, dest', category: 'Conditional Move', flags: 'Tests CF,ZF' }],
    ['cmovae', { description: 'Conditional move if above or equal (unsigned)', operands: 'src, dest', category: 'Conditional Move', flags: 'Tests CF' }],
    ['cmovb', { description: 'Conditional move if below (unsigned)', operands: 'src, dest', category: 'Conditional Move', flags: 'Tests CF' }],
    ['cmovbe', { description: 'Conditional move if below or equal (unsigned)', operands: 'src, dest', category: 'Conditional Move', flags: 'Tests CF,ZF' }],
    ['sete', {
        description: 'Set byte if equal (ZF=1)',
        operands: 'dest8',
        category: 'Set Byte',
        flags: 'Tests ZF',
        performance: {
            'skylake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 1, throughput: 0.5, ports: ['p0123'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 1, throughput: 0.5, ports: ['p06'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['setne', { description: 'Set byte if not equal (ZF=0)', operands: 'dest8', category: 'Set Byte', flags: 'Tests ZF' }],
    ['setg', { description: 'Set byte if greater (signed)', operands: 'dest8', category: 'Set Byte', flags: 'Tests ZF,SF,OF' }],
    ['setge', { description: 'Set byte if greater or equal (signed)', operands: 'dest8', category: 'Set Byte', flags: 'Tests SF,OF' }],
    ['setl', { description: 'Set byte if less (signed)', operands: 'dest8', category: 'Set Byte', flags: 'Tests SF,OF' }],
    ['setle', { description: 'Set byte if less or equal (signed)', operands: 'dest8', category: 'Set Byte', flags: 'Tests ZF,SF,OF' }],
    ['seta', { description: 'Set byte if above (unsigned)', operands: 'dest8', category: 'Set Byte', flags: 'Tests CF,ZF' }],
    ['setae', { description: 'Set byte if above or equal (unsigned)', operands: 'dest8', category: 'Set Byte', flags: 'Tests CF' }],
    ['setb', { description: 'Set byte if below (unsigned)', operands: 'dest8', category: 'Set Byte', flags: 'Tests CF' }],
    ['setbe', { description: 'Set byte if below or equal (unsigned)', operands: 'dest8', category: 'Set Byte', flags: 'Tests CF,ZF' }],

    // ========== String Operations ==========
    ['movsb', {
        description: 'Move byte string (RSI→RDI)',
        operands: '',
        category: 'String Operations',
        performance: {
            'skylake': { latency: 5, throughput: 2, ports: ['p23', 'p4', 'p0156'], sizeBytes: 1, category: 'moderate' },
            'zen3': { latency: 6, throughput: 3, ports: ['p23', 'p7', 'p0123'], sizeBytes: 1, category: 'moderate' },
            'alderlake': { latency: 5, throughput: 2, ports: ['p23', 'p4', 'p0156'], sizeBytes: 1, category: 'moderate' },
            'raptorlake': { latency: 5, throughput: 2, ports: ['p23', 'p4', 'p0156'], sizeBytes: 1, category: 'moderate' }
        },
        alternatives: [
            {
                code: '# For small fixed-size copies:\nmovq (%rsi), %rax\nmovq %rax, (%rdi)\naddq $8, %rsi\naddq $8, %rdi',
                description: 'Unrolled register moves for small copies',
                latency: 6,
                throughput: 2,
                sizeBytes: 20,
                instructions: 4,
                notes: ['Better for small known sizes', 'No startup overhead', 'Can use wider moves (SIMD)'],
                tradeoffs: 'Only efficient for small, known-size copies'
            },
            {
                code: '# For large copies:\nmovdqu (%rsi), %xmm0\nmovdqu %xmm0, (%rdi)\naddq $16, %rsi\naddq $16, %rdi',
                description: 'SIMD-based memory copy',
                latency: 7,
                throughput: 1,
                sizeBytes: 24,
                instructions: 4,
                notes: ['2x throughput for large copies', 'Can use YMM/ZMM for even better performance'],
                tradeoffs: 'Requires alignment awareness for best performance'
            }
        ]
    }],
    ['rep', {
        description: 'Repeat string operation while RCX≠0',
        operands: 'string_op',
        category: 'String Operations',
        performance: {
            'skylake': { latency: 0, throughput: 0, ports: ['prefix'], sizeBytes: 1, category: 'optimal' },
            'zen3': { latency: 0, throughput: 0, ports: ['prefix'], sizeBytes: 1, category: 'optimal' },
            'alderlake': { latency: 0, throughput: 0, ports: ['prefix'], sizeBytes: 1, category: 'optimal' },
            'raptorlake': { latency: 0, throughput: 0, ports: ['prefix'], sizeBytes: 1, category: 'optimal' }
        }
    }],
    ['movs', { description: 'Move string (RSI→RDI)', operands: '', category: 'String Operations' }],
    ['movsw', { description: 'Move word string', operands: '', category: 'String Operations' }],
    ['movsl', { description: 'Move long string', operands: '', category: 'String Operations' }],
    ['movsq', { description: 'Move quadword string', operands: '', category: 'String Operations' }],
    ['cmps', { description: 'Compare string', operands: '', category: 'String Operations', flags: 'OF,SF,ZF,AF,CF,PF' }],
    ['scas', { description: 'Scan string (compare AL/AX/EAX/RAX with [RDI])', operands: '', category: 'String Operations', flags: 'OF,SF,ZF,AF,CF,PF' }],
    ['lods', { description: 'Load string (load from [RSI] to AL/AX/EAX/RAX)', operands: '', category: 'String Operations' }],
    ['stos', { description: 'Store string (store AL/AX/EAX/RAX to [RDI])', operands: '', category: 'String Operations' }],
    ['repe', { description: 'Repeat while equal (RCX≠0 and ZF=1)', operands: 'string_instruction', category: 'String Operations' }],
    ['repz', { description: 'Repeat while zero (RCX≠0 and ZF=1)', operands: 'string_instruction', category: 'String Operations' }],
    ['repne', { description: 'Repeat while not equal (RCX≠0 and ZF=0)', operands: 'string_instruction', category: 'String Operations' }],
    ['repnz', { description: 'Repeat while not zero (RCX≠0 and ZF=0)', operands: 'string_instruction', category: 'String Operations' }],

    // Flag Operations
    ['stc', { description: 'Set carry flag (CF=1)', operands: '', category: 'Flag Operations', flags: 'CF=1' }],
    ['clc', { description: 'Clear carry flag (CF=0)', operands: '', category: 'Flag Operations', flags: 'CF=0' }],
    ['cmc', { description: 'Complement carry flag (CF = ~CF)', operands: '', category: 'Flag Operations', flags: 'CF' }],
    ['std', { description: 'Set direction flag (DF=1, string ops decrement)', operands: '', category: 'Flag Operations', flags: 'DF=1' }],
    ['cld', { description: 'Clear direction flag (DF=0, string ops increment)', operands: '', category: 'Flag Operations', flags: 'DF=0' }],
    ['sti', { description: 'Set interrupt flag (IF=1, enable interrupts)', operands: '', category: 'Flag Operations', flags: 'IF=1' }],
    ['cli', { description: 'Clear interrupt flag (IF=0, disable interrupts)', operands: '', category: 'Flag Operations', flags: 'IF=0' }],
    ['lahf', { description: 'Load status flags into AH', operands: '', category: 'Flag Operations' }],
    ['sahf', { description: 'Store AH into flags', operands: '', category: 'Flag Operations', flags: 'SF,ZF,AF,PF,CF' }],
    ['pushfq', { description: 'Push RFLAGS onto stack', operands: '', category: 'Flag Operations' }],
    ['popfq', { description: 'Pop RFLAGS from stack', operands: '', category: 'Flag Operations', flags: 'All' }],

    // ========== Misc ==========
    ['nop', {
        description: 'No operation',
        operands: '',
        category: 'Miscellaneous',
        performance: {
            'skylake': { latency: 0, throughput: 0.25, ports: ['p0156'], sizeBytes: 1, category: 'optimal' },
            'zen3': { latency: 0, throughput: 0.25, ports: ['p0123'], sizeBytes: 1, category: 'optimal' },
            'alderlake': { latency: 0, throughput: 0.25, ports: ['p0156'], sizeBytes: 1, category: 'optimal' },
            'raptorlake': { latency: 0, throughput: 0.25, ports: ['p0156'], sizeBytes: 1, category: 'optimal' }
        }
    }],
    ['pause', {
        description: 'Spin loop hint (improves performance in spin-wait)',
        operands: '',
        category: 'Miscellaneous',
        performance: {
            'skylake': { latency: 140, throughput: 140, ports: ['special'], sizeBytes: 2, category: 'very-slow' },
            'zen3': { latency: 65, throughput: 65, ports: ['special'], sizeBytes: 2, category: 'very-slow' },
            'alderlake': { latency: 140, throughput: 140, ports: ['special'], sizeBytes: 2, category: 'very-slow' },
            'raptorlake': { latency: 140, throughput: 140, ports: ['special'], sizeBytes: 2, category: 'very-slow' }
        }
    }],
    ['cpuid', {
        description: 'CPU identification',
        operands: '',
        category: 'System',
        performance: {
            'skylake': { latency: 100, throughput: 100, ports: ['special'], sizeBytes: 2, category: 'very-slow' },
            'zen3': { latency: 100, throughput: 100, ports: ['special'], sizeBytes: 2, category: 'very-slow' },
            'alderlake': { latency: 100, throughput: 100, ports: ['special'], sizeBytes: 2, category: 'very-slow' },
            'raptorlake': { latency: 100, throughput: 100, ports: ['special'], sizeBytes: 2, category: 'very-slow' }
        }
    }],
    ['rdtsc', {
        description: 'Read time-stamp counter',
        operands: '',
        category: 'System',
        performance: {
            'skylake': { latency: 25, throughput: 25, ports: ['special'], sizeBytes: 2, category: 'slow' },
            'zen3': { latency: 20, throughput: 20, ports: ['special'], sizeBytes: 2, category: 'slow' },
            'alderlake': { latency: 25, throughput: 25, ports: ['special'], sizeBytes: 2, category: 'slow' },
            'raptorlake': { latency: 25, throughput: 25, ports: ['special'], sizeBytes: 2, category: 'slow' }
        }
    }],
    ['syscall', {
        description: 'Fast system call (64-bit)',
        operands: '',
        category: 'System',
        performance: {
            'skylake': { latency: 150, throughput: 150, ports: ['special'], sizeBytes: 2, category: 'very-slow' },
            'zen3': { latency: 150, throughput: 150, ports: ['special'], sizeBytes: 2, category: 'very-slow' },
            'alderlake': { latency: 150, throughput: 150, ports: ['special'], sizeBytes: 2, category: 'very-slow' },
            'raptorlake': { latency: 150, throughput: 150, ports: ['special'], sizeBytes: 2, category: 'very-slow' }
        }
    }],
    ['leave', {
        description: 'Destroy stack frame (movq %rbp, %rsp; popq %rbp)',
        operands: '',
        category: 'Stack Operations',
        performance: {
            'skylake': { latency: 3, throughput: 1, ports: ['p0156', 'p23'], sizeBytes: 1, category: 'optimal' },
            'zen3': { latency: 3, throughput: 1, ports: ['p0123', 'p23'], sizeBytes: 1, category: 'optimal' },
            'alderlake': { latency: 3, throughput: 1, ports: ['p0156', 'p23'], sizeBytes: 1, category: 'optimal' },
            'raptorlake': { latency: 3, throughput: 1, ports: ['p0156', 'p23'], sizeBytes: 1, category: 'optimal' }
        }
    }],
    ['hlt', { description: 'Halt processor until interrupt', operands: '', category: 'System' }],
    ['rdtscp', { description: 'Read time-stamp counter and processor ID', operands: '', category: 'System' }],
    ['sysret', { description: 'Return from fast system call', operands: '', category: 'System' }],
    ['enter', { description: 'Create stack frame for procedure', operands: 'size, nesting_level', category: 'Stack Operations' }],
    ['int', { description: 'Software interrupt', operands: 'vector', category: 'System' }],
    ['int3', { description: 'Breakpoint interrupt (INT 3)', operands: '', category: 'System' }],
    ['lock', { description: 'Assert LOCK# signal prefix (for atomic operations)', operands: '', category: 'Prefix' }],
    ['clflush', { description: 'Flush cache line containing specified memory address', operands: 'mem', category: 'Cache Control' }],
    ['prefetcht0', { description: 'Prefetch data to all cache levels', operands: 'mem', category: 'Cache Control' }],
    ['prefetcht1', { description: 'Prefetch data to L2 cache and higher', operands: 'mem', category: 'Cache Control' }],
    ['prefetcht2', { description: 'Prefetch data to L3 cache and higher', operands: 'mem', category: 'Cache Control' }],
    ['prefetchnta', { description: 'Prefetch data with non-temporal hint', operands: 'mem', category: 'Cache Control' }],

    // ========== Memory Ordering and Fences ==========
    ['lfence', {
        description: 'Load fence (serializes loads)',
        operands: '',
        category: 'Memory Ordering',
        performance: {
            'skylake': { latency: 0, throughput: 0, ports: ['special'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 0, throughput: 0, ports: ['special'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 0, throughput: 0, ports: ['special'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 0, throughput: 0, ports: ['special'], sizeBytes: 3, category: 'optimal' }
        }
    }],
    ['mfence', {
        description: 'Memory fence (serializes all memory ops)',
        operands: '',
        category: 'Memory Ordering',
        performance: {
            'skylake': { latency: 33, throughput: 33, ports: ['special'], sizeBytes: 3, category: 'slow' },
            'zen3': { latency: 20, throughput: 20, ports: ['special'], sizeBytes: 3, category: 'slow' },
            'alderlake': { latency: 33, throughput: 33, ports: ['special'], sizeBytes: 3, category: 'slow' },
            'raptorlake': { latency: 33, throughput: 33, ports: ['special'], sizeBytes: 3, category: 'slow' }
        }
    }],
    ['sfence', {
        description: 'Store fence (serializes stores)',
        operands: '',
        category: 'Memory Ordering',
        performance: {
            'skylake': { latency: 0, throughput: 0, ports: ['special'], sizeBytes: 3, category: 'optimal' },
            'zen3': { latency: 0, throughput: 0, ports: ['special'], sizeBytes: 3, category: 'optimal' },
            'alderlake': { latency: 0, throughput: 0, ports: ['special'], sizeBytes: 3, category: 'optimal' },
            'raptorlake': { latency: 0, throughput: 0, ports: ['special'], sizeBytes: 3, category: 'optimal' }
        }
    }],

    // ========== Atomic and Lock Operations ==========
    ['xadd', {
        description: 'Exchange and add (atomic)',
        operands: 'reg, reg/mem',
        category: 'Atomic',
        flags: 'OF,SF,ZF,AF,CF,PF',
        performance: {
            'skylake': { latency: 5, throughput: 1, ports: ['p0156', 'p23', 'p4'], sizeBytes: 3, category: 'moderate' },
            'zen3': { latency: 5, throughput: 1, ports: ['p0123', 'p23', 'p7'], sizeBytes: 3, category: 'moderate' },
            'alderlake': { latency: 5, throughput: 1, ports: ['p0156', 'p23', 'p4'], sizeBytes: 3, category: 'moderate' },
            'raptorlake': { latency: 5, throughput: 1, ports: ['p0156', 'p23', 'p4'], sizeBytes: 3, category: 'moderate' }
        }
    }],
    ['cmpxchg', {
        description: 'Compare and exchange (atomic)',
        operands: 'reg, reg/mem',
        category: 'Atomic',
        flags: 'ZF',
        performance: {
            'skylake': { latency: 5, throughput: 1, ports: ['p0156', 'p23', 'p4'], sizeBytes: 3, category: 'moderate' },
            'zen3': { latency: 5, throughput: 1, ports: ['p0123', 'p23', 'p7'], sizeBytes: 3, category: 'moderate' },
            'alderlake': { latency: 5, throughput: 1, ports: ['p0156', 'p23', 'p4'], sizeBytes: 3, category: 'moderate' },
            'raptorlake': { latency: 5, throughput: 1, ports: ['p0156', 'p23', 'p4'], sizeBytes: 3, category: 'moderate' }
        }
    }],

    // FPU Instructions (x87)
    ['fadd', { description: 'FPU add', operands: '[src,] [dest]', category: 'FPU' }],
    ['faddp', { description: 'FPU add and pop stack', operands: '[dest]', category: 'FPU' }],
    ['fsub', { description: 'FPU subtract', operands: '[src,] [dest]', category: 'FPU' }],
    ['fsubp', { description: 'FPU subtract and pop', operands: '[dest]', category: 'FPU' }],
    ['fmul', { description: 'FPU multiply', operands: '[src,] [dest]', category: 'FPU' }],
    ['fmulp', { description: 'FPU multiply and pop', operands: '[dest]', category: 'FPU' }],
    ['fdiv', { description: 'FPU divide', operands: '[src,] [dest]', category: 'FPU' }],
    ['fdivp', { description: 'FPU divide and pop', operands: '[dest]', category: 'FPU' }],
    ['fsqrt', { description: 'FPU square root of ST(0)', operands: '', category: 'FPU' }],
    ['fabs', { description: 'FPU absolute value of ST(0)', operands: '', category: 'FPU' }],
    ['fchs', { description: 'FPU change sign of ST(0)', operands: '', category: 'FPU' }],
    ['fld', { description: 'FPU load floating point value onto stack', operands: 'src', category: 'FPU' }],
    ['fld1', { description: 'FPU push +1.0 onto stack', operands: '', category: 'FPU' }],
    ['fldz', { description: 'FPU push +0.0 onto stack', operands: '', category: 'FPU' }],
    ['fldpi', { description: 'FPU push π onto stack', operands: '', category: 'FPU' }],
    ['fst', { description: 'FPU store ST(0) to memory or register', operands: 'dest', category: 'FPU' }],
    ['fstp', { description: 'FPU store ST(0) and pop', operands: 'dest', category: 'FPU' }],
    ['fxch', { description: 'FPU exchange ST(0) with ST(i)', operands: '[st(i)]', category: 'FPU' }],
    ['fcom', { description: 'FPU compare ST(0) with source', operands: '[src]', category: 'FPU' }],
    ['fcomp', { description: 'FPU compare ST(0) and pop', operands: '[src]', category: 'FPU' }],
    ['fcompp', { description: 'FPU compare ST(0) with ST(1) and pop twice', operands: '', category: 'FPU' }],
    ['fsin', { description: 'FPU sine of ST(0)', operands: '', category: 'FPU' }],
    ['fcos', { description: 'FPU cosine of ST(0)', operands: '', category: 'FPU' }],
    ['fsincos', { description: 'FPU compute sine and cosine of ST(0)', operands: '', category: 'FPU' }],

    // SSE/SSE2 Instructions
    ['movaps', { description: 'Move aligned packed single-precision (128-bit)', operands: 'src, dest', category: 'SSE' }],
    ['movups', { description: 'Move unaligned packed single-precision', operands: 'src, dest', category: 'SSE' }],
    ['movss', { description: 'Move scalar single-precision float', operands: 'src, dest', category: 'SSE' }],
    ['movsd', { description: 'Move scalar double-precision float', operands: 'src, dest', category: 'SSE2' }],
    ['movapd', { description: 'Move aligned packed double-precision', operands: 'src, dest', category: 'SSE2' }],
    ['movupd', { description: 'Move unaligned packed double-precision', operands: 'src, dest', category: 'SSE2' }],
    ['addps', { description: 'Add packed single-precision floats', operands: 'src, dest', category: 'SSE' }],
    ['addss', { description: 'Add scalar single-precision float', operands: 'src, dest', category: 'SSE' }],
    ['addpd', { description: 'Add packed double-precision floats', operands: 'src, dest', category: 'SSE2' }],
    ['addsd', { description: 'Add scalar double-precision float', operands: 'src, dest', category: 'SSE2' }],
    ['subps', { description: 'Subtract packed single-precision floats', operands: 'src, dest', category: 'SSE' }],
    ['subpd', { description: 'Subtract packed double-precision floats', operands: 'src, dest', category: 'SSE2' }],
    ['mulps', { description: 'Multiply packed single-precision floats', operands: 'src, dest', category: 'SSE' }],
    ['mulpd', { description: 'Multiply packed double-precision floats', operands: 'src, dest', category: 'SSE2' }],
    ['divps', { description: 'Divide packed single-precision floats', operands: 'src, dest', category: 'SSE' }],
    ['divpd', { description: 'Divide packed double-precision floats', operands: 'src, dest', category: 'SSE2' }],
    ['sqrtps', { description: 'Square root of packed single-precision floats', operands: 'src, dest', category: 'SSE' }],
    ['sqrtpd', { description: 'Square root of packed double-precision floats', operands: 'src, dest', category: 'SSE2' }],
    ['maxps', { description: 'Maximum of packed single-precision floats', operands: 'src, dest', category: 'SSE' }],
    ['maxpd', { description: 'Maximum of packed double-precision floats', operands: 'src, dest', category: 'SSE2' }],
    ['minps', { description: 'Minimum of packed single-precision floats', operands: 'src, dest', category: 'SSE' }],
    ['minpd', { description: 'Minimum of packed double-precision floats', operands: 'src, dest', category: 'SSE2' }],
    ['andps', { description: 'Bitwise AND of packed single-precision floats', operands: 'src, dest', category: 'SSE' }],
    ['andpd', { description: 'Bitwise AND of packed double-precision floats', operands: 'src, dest', category: 'SSE2' }],
    ['orps', { description: 'Bitwise OR of packed single-precision floats', operands: 'src, dest', category: 'SSE' }],
    ['orpd', { description: 'Bitwise OR of packed double-precision floats', operands: 'src, dest', category: 'SSE2' }],
    ['xorps', { description: 'Bitwise XOR of packed single-precision floats', operands: 'src, dest', category: 'SSE' }],
    ['xorpd', { description: 'Bitwise XOR of packed double-precision floats', operands: 'src, dest', category: 'SSE2' }],
    ['movdqa', { description: 'Move aligned double quadword (128-bit integer)', operands: 'src, dest', category: 'SSE2' }],
    ['movdqu', { description: 'Move unaligned double quadword', operands: 'src, dest', category: 'SSE2' }],
    ['paddb', { description: 'Add packed bytes', operands: 'src, dest', category: 'SSE2' }],
    ['paddw', { description: 'Add packed words', operands: 'src, dest', category: 'SSE2' }],
    ['paddd', { description: 'Add packed doublewords', operands: 'src, dest', category: 'SSE2' }],
    ['paddq', { description: 'Add packed quadwords', operands: 'src, dest', category: 'SSE2' }],
    ['psubb', { description: 'Subtract packed bytes', operands: 'src, dest', category: 'SSE2' }],
    ['psubw', { description: 'Subtract packed words', operands: 'src, dest', category: 'SSE2' }],
    ['psubd', { description: 'Subtract packed doublewords', operands: 'src, dest', category: 'SSE2' }],
    ['psubq', { description: 'Subtract packed quadwords', operands: 'src, dest', category: 'SSE2' }],
    ['pmullw', { description: 'Multiply packed signed words (low result)', operands: 'src, dest', category: 'SSE2' }],
    ['pmuludq', { description: 'Multiply packed unsigned doublewords', operands: 'src, dest', category: 'SSE2' }],
    ['pand', { description: 'Bitwise AND of packed integers', operands: 'src, dest', category: 'SSE2' }],
    ['pandn', { description: 'Bitwise AND NOT of packed integers', operands: 'src, dest', category: 'SSE2' }],
    ['por', { description: 'Bitwise OR of packed integers', operands: 'src, dest', category: 'SSE2' }],
    ['pxor', { description: 'Bitwise XOR of packed integers', operands: 'src, dest', category: 'SSE2' }],
    ['psllw', { description: 'Shift packed words left logical', operands: 'count, dest', category: 'SSE2' }],
    ['pslld', { description: 'Shift packed doublewords left logical', operands: 'count, dest', category: 'SSE2' }],
    ['psllq', { description: 'Shift packed quadwords left logical', operands: 'count, dest', category: 'SSE2' }],
    ['psrlw', { description: 'Shift packed words right logical', operands: 'count, dest', category: 'SSE2' }],
    ['psrld', { description: 'Shift packed doublewords right logical', operands: 'count, dest', category: 'SSE2' }],
    ['psrlq', { description: 'Shift packed quadwords right logical', operands: 'count, dest', category: 'SSE2' }],
    ['psraw', { description: 'Shift packed words right arithmetic', operands: 'count, dest', category: 'SSE2' }],
    ['psrad', { description: 'Shift packed doublewords right arithmetic', operands: 'count, dest', category: 'SSE2' }],
    ['pcmpeqb', { description: 'Compare packed bytes for equality', operands: 'src, dest', category: 'SSE2' }],
    ['pcmpeqw', { description: 'Compare packed words for equality', operands: 'src, dest', category: 'SSE2' }],
    ['pcmpeqd', { description: 'Compare packed doublewords for equality', operands: 'src, dest', category: 'SSE2' }],

    // AVX Instructions
    ['vaddps', { description: 'AVX add packed single-precision floats', operands: 'src1, src2, dest', category: 'AVX' }],
    ['vaddpd', { description: 'AVX add packed double-precision floats', operands: 'src1, src2, dest', category: 'AVX' }],
    ['vsubps', { description: 'AVX subtract packed single-precision floats', operands: 'src1, src2, dest', category: 'AVX' }],
    ['vsubpd', { description: 'AVX subtract packed double-precision floats', operands: 'src1, src2, dest', category: 'AVX' }],
    ['vmulps', { description: 'AVX multiply packed single-precision floats', operands: 'src1, src2, dest', category: 'AVX' }],
    ['vmulpd', { description: 'AVX multiply packed double-precision floats', operands: 'src1, src2, dest', category: 'AVX' }],
    ['vdivps', { description: 'AVX divide packed single-precision floats', operands: 'src1, src2, dest', category: 'AVX' }],
    ['vdivpd', { description: 'AVX divide packed double-precision floats', operands: 'src1, src2, dest', category: 'AVX' }],
    ['vmovaps', { description: 'AVX move aligned packed single-precision', operands: 'src, dest', category: 'AVX' }],
    ['vmovapd', { description: 'AVX move aligned packed double-precision', operands: 'src, dest', category: 'AVX' }],
    ['vmovdqa', { description: 'AVX move aligned double quadword', operands: 'src, dest', category: 'AVX' }],
    ['vmovdqu', { description: 'AVX move unaligned double quadword', operands: 'src, dest', category: 'AVX' }],
    ['vxorps', { description: 'AVX bitwise XOR of packed single-precision', operands: 'src1, src2, dest', category: 'AVX' }],
    ['vxorpd', { description: 'AVX bitwise XOR of packed double-precision', operands: 'src1, src2, dest', category: 'AVX' }],
    ['vzeroall', { description: 'Zero all YMM registers', operands: '', category: 'AVX' }],
    ['vzeroupper', { description: 'Zero upper 128 bits of all YMM registers', operands: '', category: 'AVX' }],

    // System Instructions
    ['lgdt', { description: 'Load global descriptor table register', operands: 'mem', category: 'System' }],
    ['sgdt', { description: 'Store global descriptor table register', operands: 'mem', category: 'System' }],
    ['lidt', { description: 'Load interrupt descriptor table register', operands: 'mem', category: 'System' }],
    ['sidt', { description: 'Store interrupt descriptor table register', operands: 'mem', category: 'System' }],
    ['swapgs', { description: 'Swap GS base with KernelGSBase MSR', operands: '', category: 'System' }],
    ['rdrand', { description: 'Read random number from hardware RNG', operands: 'dest', category: 'Random' }],
    ['rdseed', { description: 'Read random seed from hardware RNG', operands: 'dest', category: 'Random' }],
]);