.text
    .globl main
main:
    pushq %rbp
    movq %rsp, %rbp
    
    movq $10, %rdi         # First parameter
    movq $20, %rsi         # Second parameter
    call add_numbers       # Hover here to see function info!
    call multiply
    
    movq %rax, %rbx        # Use return value
    
    leave
    ret

add_numbers:
    # Uses %rdi and %rsi (parameters detected!)
    movq %rdi, %rax
    addq %rsi, %rax        # Return in %rax (detected!)
    ret                    # Returns: %rax

multiply:
    # Bad practice example
    movq %rdi, %rbx        # Clobbers %rbx without saving!
    imulq %rsi, %rbx
    movq %rbx, %rax
    ret