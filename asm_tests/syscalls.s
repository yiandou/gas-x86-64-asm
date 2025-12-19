.section .text
.globl _start
_start:
# sys_open
movq $2, %rax
leaq filename(%rip), %rdi
movq $0, %rsi           # O_RDONLY
movq $0644, %rdx        # mode
syscall                 # Shows: open (2) with all params

# sys_mmap
movq $9, %rax
xorq %rdi, %rdi         # addr = NULL (let kernel choose)
movq $4096, %rsi        # length = 4KB
movq $3, %rdx           # prot = PROT_READ|PROT_WRITE
movq $34, %r10          # flags = MAP_PRIVATE|MAP_ANONYMOUS
movq $-1, %r8           # fd = -1
xorq %r9, %r9           # offset = 0
syscall                 # Shows: mmap (9) with 6 parameters!

# sys_exit
movq $60, %rax
movq $0, %rdi           # Exit status
syscall                 # Shows: exit (60) - terminate process
