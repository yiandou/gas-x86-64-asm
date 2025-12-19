main:
    movq $60, %rax      # exit syscall
    syscall
    # This comment is fine
    .cfi_endproc         # This directive is fine
    .size main, .-main   # This directive is fine
    movq $1, %rax        # ← Only THIS gets marked as dead code
    addq $5, %rax        # ← And this
.section .rodata         # Not dead code (directive)
message:
    .ascii "Hello\n"     # Not dead code (directive)