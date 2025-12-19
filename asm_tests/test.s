# Example GAS x86-64 AT&T syntax assembly file
# This demonstrates the syntax highlighting and IntelliSense features

    .file   "example.s"
    .text
    .globl  main
    .type   main, @function

# Function: main
# Description: Entry point that demonstrates various x86-64 instructions
# Arguments: None
# Returns: Integer exit code in %rax
main:

    
    .cfi_startproc
    
    # Function prologue - set up stack frame
    pushq   %rbp                    # Save old base pointer
    .cfi_def_cfa_offset 16
    .cfi_offset 6, -16
    movq    %rsp, %rbp              # Set base pointer to current stack
    .cfi_def_cfa_register 6
    subq    $64, %rsp               # Allocate 64 bytes of stack space
    
    # Initialize local variables
    movq    $0, -8(%rbp)            # counter = 0
    movq    $100, -16(%rbp)         # limit = 100
    movq    $0, -24(%rbp)           # sum = 0
    
    # Example 1: Basic arithmetic
    movl    $42, %eax               # Load immediate value
    movl    $17, %ebx               # Load another value
    addl    %ebx, %eax              # eax = eax + ebx
    subl    $10, %eax               # eax = eax - 10
    imull   $2, %eax                # eax = eax * 2
    
    # Example 2: Bitwise operations
    movq    $0xFF00FF00, %rcx       # Load bit pattern
    movq    $0x00FF00FF, %rdx       # Load another pattern
    andq    %rdx, %rcx              # Bitwise AND
    orq     $0x0000FFFF, %rcx       # Bitwise OR
    xorq    %rdx, %rdx              # Clear register (xor with itself)
    notq    %rcx                    # Bitwise NOT
    
    # Example 3: Shifts and rotates
    movq    $0x0123456789ABCDEF, %r8
    shlq    $4, %r8                 # Shift left by 4 bits
    shrq    $2, %r8                 # Shift right by 2 bits
    sarq    $1, %r8                 # Arithmetic shift right
    rolq    $8, %r8                 # Rotate left by 8 bits
    
    # Example 4: Conditional operations
    cmpq    $50, -8(%rbp)           # Compare counter with 50
    jge     .L_skip                 # Jump if greater or equal
    incq    -8(%rbp)                # Increment counter
    
.L_skip:
    # Example 5: Loop structure
    movq    $0, %r9                 # Loop counter
    
.L_loop:
    cmpq    $10, %r9                # Check if counter < 10
    jge     .L_end_loop             # Exit loop if counter >= 10
    
    addq    %r9, -24(%rbp)          # sum += counter
    incq    %r9                     # counter++
    jmp     .L_loop                 # Continue loop
    
.L_end_loop:
    # Example 6: Bit manipulation (BMI instructions)
    movq    $0xF0F0F0F0, %r10
    lzcntq  %r10, %r11              # Count leading zeros
    tzcntq  %r10, %r12              # Count trailing zeros
    popcntq %r10, %r13              # Count set bits
    
    # Example 7: Conditional move
    movq    $100, %rax
    movq    $200, %rbx
    cmpq    %rax, %rbx
    cmovg   %rbx, %rax              # Move if greater (rax = max(rax, rbx))
    
    # Example 8: Byte swap
    movq    $0x0123456789ABCDEF, %r14
    bswapq  %r14                    # Reverse byte order
    
    # Example 9: Set byte on condition
    xorq    %r15, %r15              # Clear r15
    cmpq    $0, -24(%rbp)           # Check if sum is zero
    setz    %r15b                   # Set low byte if zero
    
    # Example 10: Bit test operations
    movq    $0x8000000000000000, %rax
    btq     $63, %rax               # Test bit 63
    jc      .L_bit_set              # Jump if bit was set
    
.L_bit_set:
    btsq    $15, %rax               # Set bit 15
    btrq    $31, %rax               # Clear bit 31
    btcq    $47, %rax               # Toggle bit 47
    
    # Example 11: FPU operations
    fldl    float_val(%rip)         # Load double from memory
    fld1                            # Load 1.0 onto FPU stack
    faddp                           # Add and pop
    fstpl   -32(%rbp)               # Store result and pop
    
    # Example 12: SSE operations
    movsd   float_val(%rip), %xmm0  # Load scalar double into XMM0
    movsd   float_val2(%rip), %xmm1 # Load another value
    addsd   %xmm1, %xmm0            # Add scalar doubles
    mulsd   %xmm0, %xmm0            # Square the result
    sqrtsd  %xmm0, %xmm0            # Take square root
    movsd   %xmm0, -40(%rbp)        # Store result
    
    # Example 13: Packed SSE operations
    movaps  vector1(%rip), %xmm2    # Load 4 floats
    movaps  vector2(%rip), %xmm3    # Load 4 more floats
    addps   %xmm3, %xmm2            # Add all 4 pairs
    mulps   %xmm2, %xmm2            # Square all 4 values
    movaps  %xmm2, -56(%rbp)        # Store results
    
    # Example 14: String operations
    leaq    string1(%rip), %rsi     # Source string
    leaq    -64(%rbp), %rdi         # Destination
    movq    $16, %rcx               # Count
    rep movsb                       # Copy string bytes
    
    # Example 15: Compare and exchange (atomic)
    movq    $42, %rax               # Expected value
    movq    $100, %rbx              # New value
    lock cmpxchgq %rbx, -8(%rbp)    # Atomic compare and exchange
    
    # Example 16: Load effective address
    leaq    8(%rbp,%r9,8), %rax     # Load address: rbp + r9*8 + 8
    leaq    array(%rip), %rbx       # Load RIP-relative address
    
    # Set return value
    movq    -24(%rbp), %rax         # Return sum as exit code
    
    # Function epilogue - clean up and return
    addq    $64, %rsp               # Deallocate stack space
    popq    %rbp                    # Restore base pointer
    .cfi_def_cfa 7, 8
    retq                            # Return to caller
    .cfi_endproc
    .size   main, .-main

test_enhanced:
    # Memory tracking
    movq $100, %rax
    movq %rax, (%rbp)      # Store to memory
    movq (%rbp), %rbx      # Load from memory - shows value!
    
    # Stack tracking
    pushq $42              # Push immediate
    pushq %rax             # Push register
    popq %rcx              # Hover: %rcx = %rax = 100
    popq %rdx              # Hover: %rdx = 42
    
    # Flag tracking
    cmpq $50, %rax         # Hover shows flag conditions
    je equal               # Hover shows when branch is taken
    
    # Memory with offset
    movq $200, 16(%rsp)    # Store at stack offset
    movq 16(%rsp), %rsi    # Load it back

# Helper function: add_numbers
# Adds two 64-bit integers
# Arguments: %rdi = first number, %rsi = second number
# Returns: %rax = sum
    .globl  add_numbers
    .type   add_numbers, @function
add_numbers:
    # Uses %rdi and %rsi (parameters detected!)
    movq %rdi, %rax
    addq %rsi, %rax        # Return in %rax (detected!)
    ret                    # Returns: %rax

multiply:
    # Bad practice example
    movq %rdi, %rbx        # ⚠ Clobbers %rbx without saving!
    imulq %rsi, %rbx
    movq %rbx, %rax
    ret

# Helper function: multiply_and_divide
# Multiplies two numbers then divides by a third
# Arguments: %rdi = a, %rsi = b, %rdx = c
# Returns: %rax = (a * b) / c
    .globl  multiply_and_divide
    .type   multiply_and_divide, @function
multiply_and_divide:
    .cfi_startproc
    pushq   %rbx                    # Save callee-saved register
    .cfi_def_cfa_offset 16
    .cfi_offset 3, -16

    movq    %rdi, %rax              # Move a to rax
    imul   %rsi                    # Multiply by b (result in rdx:rax)
    movq    %rdx, %rbx              # Save high part
    divq    %rcx                    # Divide by c (quotient in rax)
    
    popq    %rbx                    # Restore rbx
    .cfi_def_cfa_offset 8
    retq
    
    .cfi_endproc
    .size   multiply_and_divide, .-multiply_and_divide

# Read-only data section
    .section    .rodata
    .align 8
float_val:
    .double 3.14159265358979323846  # Pi constant

    .align 8
float_val2:
    .double 2.71828182845904523536  # e constant

    .align 16
vector1:
    .float 1.0, 2.0, 3.0, 4.0       # Four single-precision floats

    .align 16
vector2:
    .float 5.0, 6.0, 7.0, 8.0       # Four more floats

string1:
    .asciz "Hello, Assembly!"         # Null-terminated string

message:
    .ascii "GAS x86-64 AT&T syntax\n"  # String without null terminator

# Initialized data section
    .data
    .align 8
counter:
    .quad 0                         # 64-bit counter

    .align 4
flags:
    .long 0                         # 32-bit flags

    .align 8
array:
    .quad 1, 2, 3, 4, 5, 6, 7, 8    # Array of 8 quad words

lookup_table:
    .byte 0, 1, 4, 9, 16, 25, 36, 49, 64, 81  # Squares

# Uninitialized data section (BSS)
    .bss
    .align 16
buffer:
    .space 256                      # 256-byte buffer

    .align 8
temp_storage:
    .space 64                       # 64-byte temporary storage

# Macro definitions
    .macro push_all
    pushq   %rax
    pushq   %rbx
    pushq   %rcx
    pushq   %rdx
    pushq   %rsi
    pushq   %rdi
    pushq   %r8
    pushq   %r9
    pushq   %r10
    pushq   %r11
    .endm

    .macro pop_all
    popq    %r11
    popq    %r10
    popq    %r9
    popq    %r8
    popq    %rdi
    popq    %rsi
    popq    %rdx
    popq    %rcx
    popq    %rbx
    popq    %rax
    .endm

# Example using macros
    .text
    .globl save_and_call
    .type save_and_call, @function
save_and_call:
    .cfi_startproc
    
    push_all                        # Save all registers using macro
    
    # Do some work here
    call    some_function
    
    pop_all                         # Restore all registers using macro
    
    retq
    .cfi_endproc
    .size save_and_call, .-save_and_call

# Placeholder function
some_function:
    .cfi_startproc
    retq
    .cfi_endproc

# Symbol visibility and metadata
    .ident  "GAS x86-64 Example"
    .section    .note.GNU-stack,"",@progbits