import { SyscallInfo } from "./types";

export const LINUX_SYSCALLS: Map<number, SyscallInfo> = new Map([
    [0, {
        number: 0,
        name: 'read',
        description: 'Read from a file descriptor',
        parameters: ['%rdi: unsigned int fd', '%rsi: char *buf', '%rdx: size_t count'],
        returns: 'Number of bytes read, or -1 on error',
        errors: 'EBADF (bad fd), EFAULT (bad address), EINTR (interrupted), EIO (I/O error)'
    }],
    [1, {
        number: 1,
        name: 'write',
        description: 'Write to a file descriptor',
        parameters: ['%rdi: unsigned int fd', '%rsi: const char *buf', '%rdx: size_t count'],
        returns: 'Number of bytes written, or -1 on error',
        errors: 'EBADF (bad fd), EFAULT (bad address), ENOSPC (no space), EPIPE (broken pipe)'
    }],
    [2, {
        number: 2,
        name: 'open',
        description: 'Open a file',
        parameters: ['%rdi: const char *filename', '%rsi: int flags', '%rdx: umode_t mode'],
        returns: 'File descriptor, or -1 on error',
        errors: 'EACCES (permission denied), EEXIST (file exists), ENOENT (no such file), ENOMEM (out of memory)'
    }],
    [3, {
        number: 3,
        name: 'close',
        description: 'Close a file descriptor',
        parameters: ['%rdi: unsigned int fd'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF (bad fd), EINTR (interrupted), EIO (I/O error)'
    }],
    [4, {
        number: 4,
        name: 'stat',
        description: 'Get file status',
        parameters: ['%rdi: const char *filename', '%rsi: struct stat *statbuf'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES (permission denied), EFAULT (bad address), ENOENT (no such file)'
    }],
    [5, {
        number: 5,
        name: 'fstat',
        description: 'Get file status by file descriptor',
        parameters: ['%rdi: unsigned int fd', '%rsi: struct stat *statbuf'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF (bad fd), EFAULT (bad address), ENOMEM (out of memory)'
    }],
    [6, {
        number: 6,
        name: 'lstat',
        description: 'Get file status',
        parameters: ['%rdi: const char *filename', '%rsi: struct stat *statbuf'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES (permission denied), EFAULT (bad address), ENOENT (no such file)'
    }],
    [7, {
        number: 7,
        name: 'poll',
        description: 'Wait for some event on a file descriptor',
        parameters: ['%rdi: struct pollfd *fds', '%rsi: nfds_t nfds', '%rdx: int timeout'],
        returns: 'Number of fds with events, or -1 on error',
        errors: 'EFAULT (bad address), EINTR (interrupted), EINVAL (invalid argument)'
    }],
    [8, {
        number: 8,
        name: 'lseek',
        description: 'Reposition read/write file offset',
        parameters: ['%rdi: unsigned int fd', '%rsi: off_t offset', '%rdx: unsigned int whence'],
        returns: 'Resulting offset location as measured in bytes from the beginning of the file, or -1 on error',
        errors: 'EBADF: (bad fd), EINVAL (invalid argument), ENXIO, EOVERFLOW, ESPIPE (fd is pipe)'
    }],
    [9, {
        number: 9,
        name: 'mmap',
        description: 'Map files or devices into memory',
        parameters: ['%rdi: void *addr', '%rsi: size_t length', '%rdx: int prot', '%r10: int flags', '%r8: int fd', '%r9: off_t offset'],
        returns: 'Pointer to mapped area, or MAP_FAILED on error',
        errors: 'EACCES (permission denied), EAGAIN (locked), EBADF (bad fd), EINVAL (invalid argument), ENOMEM (no memory)'
    }],
    [10, {
        number: 10,
        name: 'mprotect',
        description: 'Set protection on a region of memory',
        parameters: ['%rdi: void *addr', '%rsi: size_t len', '%rdx: int prot'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES (permission denied), EINVAL (invalid argument), ENOMEM (out of memory)'
    }],
    [11, {
        number: 11,
        name: 'munmap',
        description: 'Unmap files or devices from memory',
        parameters: ['%rdi: void *addr', '%rsi: size_t length'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL (invalid argument)'
    }],
    [12, {
        number: 12,
        name: 'brk',
        description: 'Change data segment size',
        parameters: ['%rdi: void *addr'],
        returns: 'New program break, or current break on error',
        errors: 'ENOMEM (out of memory)'
    }],
    [13, {
        number: 13,
        name: 'rt_sigaction',
        description: 'Examine and change a signal action',
        parameters: ['%rdi: int sig', '%rsi: const struct sigaction *act', '%rdx: struct sigaction *oldact', '%r10: size_t sigsetsize'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT (bad address), EINVAL (invalid signal)'
    }],
    [14, {
        number: 14,
        name: 'rt_sigprocmask',
        description: 'Examine and change blocked signals',
        parameters: ['%rdi: int how', '%rsi: sigset_t *set', '%rdx: sigset_t *oldset', '%r10: size_t sigsetsize'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT (bad address), EINVAL (invalid argument)'
    }],
    [15, {
        number: 16,
        name: 'rt_sigreturn',
        description: 'Return from signal handler and cleanup stack frame',
        parameters: [],
        returns: 'Does not return',
    }],
    [16, {
        number: 16,
        name: 'ioctl',
        description: 'Control device',
        parameters: ['%rdi: unsigned int fd', '%rsi: unsigned int cmd', '%rdx: unsigned long arg'],
        returns: '0 or output parameter, or -1 on error',
        errors: 'EBADF, EFAULT, EINVAL, ENOTTY, ENOTTY',
    }],
    [17, {
        number: 17,
        name: 'pread64',
        description: 'Read from a file descriptor at a given offset',
        parameters: ['%rdi: unsigned int fd', '%rsi: char *buf, %rdx: size_t count', '%r10: off_t offset'],
        returns: 'Number of bytes read, or -1 on error',
    }],
    [18, {
        number: 18,
        name: 'pwrite64',
        description: 'Write to a file descriptor at a given offset',
        parameters: ['%rdi: unsigned int fd', '%rsi: const char *buf, %rdx: size_t count', '%r10: off_t offset'],
        returns: 'Number of bytes written, or -1 on error',
    }],
    [19, {
        number: 19,
        name: 'readv',
        description: 'Read data into multiple buffers',
        parameters: ['%rdi: unsigned int fd', '%rsi: const struct iovec *iov', '%rdx: unsigned long iovcnt'],
        returns: 'Number of bytes read, or -1 on error',
    }],
    [20, {
        number: 20,
        name: 'writev',
        description: 'Write data from multiple buffers',
        parameters: ['%rdi: unsigned int fd', '%rsi: const struct iovec *iov', '%rdx: unsigned long iovcnt'],
        returns: 'Number of bytes written, or -1 on error',
    }],
    [21, {
        number: 21,
        name: 'access',
        description: 'Check user\'s permissions for a file',
        parameters: ['%rdi: const char *filename', '%rsi: int mode'],
        returns: '0 on all permissions granted or mode is F_OK and file exists. -1 on error or at least one bit in mode is denied',
        errors: 'EACCES, EBADF, EFAULT, EINVAL, EIO, ELOOP, ENAMETOOLONG, ENOENT, ENOMEM, ENOTDIR, EPERM, EROFS, ETXTBSY'
    }],
    [22, {
        number: 22,
        name: 'pipe',
        description: 'Create a pipe',
        parameters: ['%rdi: int *pipefd'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT (bad address), EMFILE (too many files), ENFILE (file table overflow)'
    }],
    [23, {
        number: 23,
        name: 'select',
        description: 'Monitor file descriptors for readiness',
        parameters: ['%rdi: int nfds', '%rsi: fd_set *readfds', '%rdx: fd_set *writefds', '%r10: fd_set *exceptfds', '%r8: struct timeval *timeout'],
        returns: 'Number of file descriptors ready, may be 0 if timeout expired, or -1 on error',
        errors: 'EBADF, EINTR, EINVAL, ENOMEM'
    }],
    [24, {
        number: 24,
        name: 'sched_yield',
        description: 'Yield the processor',
        parameters: [],
        returns: '0 on success, or -1 on error',
    }],
    [25, {
        number: 25,
        name: 'mremap',
        description: 'Remap a virtual memory address',
        parameters: ['%rdi: void *old_address', '%rsi: size_t old_size', '%rdx: size_t new_size', '%r10: int flags', '%r8: void *new_address'],
        returns: 'Pointer to new address, or -1 on error',
        errors: 'EAGAIN, EFAULT, EINVAL, ENOMEM'
    }],
    [26, {
        number: 26,
        name: 'msync',
        description: 'Synchronize a file with a memory map',
        parameters: ['%rdi: void *addr', '%rsi: size_t length', '%rdx: int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EBUSY, EINVAL, ENOMEM'
    }],
    [27, {
        number: 27,
        name: 'mincore',
        description: 'Determine whether pages are resident in memory',
        parameters: ['%rdi: void *addr', '%rsi: size_t length', '%rdx: unsigned char *vec'],
        returns: '0 on success, or -1 on error',
        errors: 'EAGAIN, EFAULT, EINVAL, ENOMEM'
    }],
    [28, {
        number: 28,
        name: 'madvise',
        description: 'Give advice about use of memory',
        parameters: ['%rdi: void *addr', '%rsi: size_t length', '%rdx: int advice'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCESS, EAGAIN, EBADF, EBUSY, EFAULT, EINVAL, EIO, ENOMEM, EPERM, EHWPOISON'
    }],
    [29, {
        number: 29,
        name: 'shmget',
        description: 'Allocates a System V shared memory segment',
        parameters: ['%rdi: key_t key', '%rsi: size_t size', '%rdx: int shmflg'],
        returns: 'Shared memory identifier, or -1 on error',
        errors: 'EACCES, EEXIST, EINVAL, ENFILE, ENOENT, ENOMEM, ENOSPC, EPERM'
    }],
    [30, {
        number: 30,
        name: 'shmat',
        description: 'Attaches the System V shared memory segment identified by shmid to the address space of the calling process',
        parameters: ['%rdi: int shmid', '%rsi: const void *shmaddr', '%rdx: int shmflg'],
        returns: 'Address of the attached shared memory segment, or -1 on error',
        errors: 'EACCES, EIDRM, EINVAL, ENOMEM'
    }],
    [31, {
        number: 31,
        name: 'shmctl',
        description: 'Perform control operation specified by op on the System V shared memory segment identified by shmid',
        parameters: ['%rdi: int shmid', '%rsi: int op', '%rdx: struct shmid_ds *buf'],
        returns: 'Various information on success, 0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOMEM, EOVERFLOW, EPERM, EINVAL, EIDRM'
    }],
    [32, {
        number: 32,
        name: 'dup',
        description: 'Duplicate a file descriptor',
        parameters: ['%rdi: unsigned int fildes'],
        returns: 'New file descriptor, or -1 on error',
        errors: 'EBADF (bad fd), EMFILE (too many open files)'
    }],
    [33, {
        number: 33,
        name: 'dup2',
        description: 'Duplicate a file descriptor to a specific fd',
        parameters: ['%rdi: unsigned int oldfd', '%rsi: unsigned int newfd'],
        returns: 'New file descriptor, or -1 on error',
        errors: 'EBADF (bad fd), EBUSY (race condition), EINTR (interrupted), EMFILE (too many files)'
    }],
    [34, {
        number: 34,
        name: 'pause',
        description: 'Sleep and wait for signal',
        parameters: [],
        returns: '-1',
        errors: 'EINTR'
    }],
    [35, {
        number: 35,
        name: 'nanosleep',
        description: 'High-resolution sleep',
        parameters: ['%rdi: struct timespec *req', '%rsi: struct timespec *rem'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT (bad address), EINTR (interrupted), EINVAL (invalid time)'
    }],
    [36, {
        number: 36,
        name: 'getitimer',
        description: 'Get value of interval timer',
        parameters: ['%rdi: int which', '%rsi: struct itimerval *curr_value'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL (invalid which), EFAULT (bad address)'
    }],
    [37, {
        number: 37,
        name: 'alarm',
        description: 'Set an alarm clock for delivery of a signal',
        parameters: ['%rdi: unsigned int seconds'],
        returns: 'Remaining seconds until previous alarm, or 0 if none',
        errors: 'None defined (signal scheduling only)'
    }],
    [38, {
        number: 38,
        name: 'setitimer',
        description: 'Set value of interval timer',
        parameters: ['%rdi: int which', '%rsi: const struct itimerval *new_value', '%rdx: struct itimerval *old_value'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL (invalid which or value), EFAULT (bad address)'
    }],
    [39, {
        number: 39,
        name: 'getpid',
        description: 'Get process ID',
        parameters: [],
        returns: 'Process ID (always succeeds)',
    }],
    [40, {
        number: 40,
        name: 'sendfile',
        description: 'Transfer data between file descriptors',
        parameters: ['%rdi: int out_fd', '%rsi: int in_fd', '%rdx: off_t *offset', '%r10: size_t count'],
        returns: 'Number of bytes sent, or -1 on error',
        errors: 'EAGAIN, EBADF, EFAULT, EINVAL, EIO, ENOMEM, EOVERFLOW, ESPIPE'
    }],
    [41, {
        number: 41,
        name: 'socket',
        description: 'Create an endpoint for communication',
        parameters: ['%rdi: int domain', '%rsi: int type', '%rdx: int protocol'],
        returns: 'File descriptor, or -1 on error',
        errors: 'EACCES (permission denied), EINVAL (invalid argument), EMFILE (too many files), ENOMEM (no memory)'
    }],
    [42, {
        number: 42,
        name: 'connect',
        description: 'Connect a socket',
        parameters: ['%rdi: int sockfd', '%rsi: struct sockaddr *addr', '%rdx: socklen_t addrlen'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES (permission denied), EADDRINUSE (address in use), ECONNREFUSED (refused), ETIMEDOUT (timeout)'
    }],
    [43, {
        number: 43,
        name: 'accept',
        description: 'Accept a connection on a socket',
        parameters: ['%rdi: int sockfd', '%rsi: struct sockaddr *addr', '%rdx: socklen_t *addrlen'],
        returns: 'File descriptor, or -1 on error',
        errors: 'EAGAIN (would block), EBADF (bad fd), EINTR (interrupted), EINVAL (not listening)'
    }],
    [44, {
        number: 44,
        name: 'sendto',
        description: 'Send a message on a socket',
        parameters: ['%rdi: int sockfd', '%rsi: void *buf', '%rdx: size_t len', '%r10: int flags', '%r8: struct sockaddr *dest_addr', '%r9: socklen_t addrlen'],
        returns: 'Number of bytes sent, or -1 on error',
        errors: 'EACCES (broadcast not allowed), EAGAIN (would block), ECONNRESET (reset), EMSGSIZE (too large), ENOBUFS (no buffer space)'
    }],
    [45, {
        number: 45,
        name: 'recvfrom',
        description: 'Receive a message from a socket',
        parameters: [
            '%rdi: int sockfd',
            '%rsi: void *buf',
            '%rdx: size_t len',
            '%r10: int flags',
            '%r8: struct sockaddr *src_addr',
            '%r9: socklen_t *addrlen'
        ],
        returns: 'Number of bytes received, or -1 on error',
        errors: 'EAGAIN, EBADF, ECONNREFUSED, EFAULT, EINTR, EINVAL, ENOTSOCK, etc'
    }],
    [46, {
        number: 46,
        name: 'sendmsg',
        description: 'Send a message from a msghdr structure',
        parameters: [
            '%rdi: int sockfd',
            '%rsi: const struct msghdr *msg',
            '%rdx: int flags'
        ],
        returns: 'Number of bytes sent, or -1 on error',
        errors: 'EACCES, EAGAIN, EBADF, EDESTADDRREQ, EFAULT, EINTR, EMSGSIZE, ENOTSOCK, etc'
    }],
    [47, {
        number: 47,
        name: 'recvmsg',
        description: 'Receive a message into a msghdr structure',
        parameters: [
            '%rdi: int sockfd',
            '%rsi: struct msghdr *msg',
            '%rdx: int flags'
        ],
        returns: 'Number of bytes received, or -1 on error',
        errors: 'EAGAIN, EBADF, EFAULT, EINTR, EINVAL, ENOTSOCK, etc'
    }],
    [48, {
        number: 48,
        name: 'shutdown',
        description: 'Shut down part of a full-duplex connection',
        parameters: ['%rdi: int sockfd', '%rsi: int how'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EINVAL, ENOTCONN, ENOTSOCK'
    }],
    [49, {
        number: 49,
        name: 'bind',
        description: 'Bind a socket to an address',
        parameters: [
            '%rdi: int sockfd',
            '%rsi: const struct sockaddr *addr',
            '%rdx: socklen_t addrlen'
        ],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EADDRINUSE, EBADF, EFAULT, EINVAL, ENOTSOCK'
    }],
    [50, {
        number: 50,
        name: 'listen',
        description: 'Listen for incoming connections',
        parameters: ['%rdi: int sockfd', '%rsi: int backlog'],
        returns: '0 on success, or -1 on error',
        errors: 'EADDRINUSE, EBADF, EINVAL, ENOTSOCK, EOPNOTSUPP'
    }],
    [51, {
        number: 51,
        name: 'getsockname',
        description: 'Get local address of a socket',
        parameters: [
            '%rdi: int sockfd',
            '%rsi: struct sockaddr *addr',
            '%rdx: socklen_t *addrlen'
        ],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EFAULT, EINVAL, ENOTSOCK'
    }],
    [52, {
        number: 52,
        name: 'getpeername',
        description: 'Get remote address of a socket',
        parameters: [
            '%rdi: int sockfd',
            '%rsi: struct sockaddr *addr',
            '%rdx: socklen_t *addrlen'
        ],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EFAULT, ENOTCONN, ENOTSOCK'
    }],
    [53, {
        number: 53,
        name: 'socketpair',
        description: 'Create a pair of connected sockets',
        parameters: [
            '%rdi: int domain',
            '%rsi: int type',
            '%rdx: int protocol',
            '%r10: int sv[2]'
        ],
        returns: '0 on success, or -1 on error',
        errors: 'EAFNOSUPPORT, EMFILE, ENFILE, EOPNOTSUPP, EPROTONOSUPPORT'
    }],
    [54, {
        number: 54,
        name: 'setsockopt',
        description: 'Set options on a socket',
        parameters: [
            '%rdi: int sockfd',
            '%rsi: int level',
            '%rdx: int optname',
            '%r10: const void *optval',
            '%r8: socklen_t optlen'
        ],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EFAULT, EINVAL, ENOPROTOOPT, ENOTSOCK'
    }],
    [55, {
        number: 55,
        name: 'getsockopt',
        description: 'Get options on a socket',
        parameters: [
            '%rdi: int sockfd',
            '%rsi: int level',
            '%rdx: int optname',
            '%r10: void *optval',
            '%r8: socklen_t *optlen'
        ],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EFAULT, EINVAL, ENOPROTOOPT, ENOTSOCK'
    }],
    [56, {
        number: 56,
        name: 'clone',
        description: 'Create a new process/thread using clone flags',
        parameters: [
            '%rdi: unsigned long flags',
            '%rsi: void *child_stack',
            '%rdx: void *ptid',
            '%r10: void *ctid',
            '%r8: unsigned long newtls'
        ],
        returns: 'PID of child to parent, 0 to child, or -1 on error',
        errors: 'EINVAL, EFAULT, ENOMEM, EPERM, EAGAIN'
    }],
    [57, {
        number: 57,
        name: 'fork',
        description: 'Create a child process',
        parameters: [],
        returns: 'PID of child in parent, 0 in child, or -1 on error',
        errors: 'EAGAIN (resource limit), ENOMEM (no memory), ENOSYS (not supported)'
    }],
    [58, {
        number: 58,
        name: 'vfork',
        description: 'Create a child process and block parent',
        parameters: [],
        returns: 'PID of child in parent, 0 in child, -1 in parent on error',
        errors: 'EAGAIN, ENOMEM, ENOSYS, ERESTARTNOINTR'
    }],
    [59, {
        number: 59,
        name: 'execve',
        description: 'Execute a program',
        parameters: ['%rdi: const char *filename', '%rsi: const char *const argv[]', '%rdx: const char *const envp[]'],
        returns: 'Does not return on success, or -1 on error',
        errors: 'EACCES (permission denied), ENOENT (no such file), ENOMEM (no memory), ENOTDIR (not a directory)'
    }],
    [60, {
        number: 60,
        name: 'exit',
        description: 'Terminate the calling process',
        parameters: ['%rdi: int status'],
        returns: 'Does not return',
    }],
    [61, {
        number: 61,
        name: 'wait4',
        description: 'Wait for process to change state',
        parameters: ['%rdi: pid_t pid', '%rsi: int *wstatus', '%rdx: int options', '%r10: struct rusage *rusage'],
        returns: 'PID of terminated child, or -1 on error',
        errors: 'ECHILD (no child), EINTR (interrupted), EINVAL (invalid argument)'
    }],
    [62, {
        number: 62,
        name: 'kill',
        description: 'Send signal to a process',
        parameters: ['%rdi: pid_t pid', '%rsi: int sig'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL (invalid signal), EPERM (permission denied), ESRCH (no such process)'
    }],
    [63, {
        number: 63,
        name: 'uname',
        description: 'Get name and information about current kernel / system',
        parameters: ['%rdi: struct utsname *name'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT (bad address)'
    }],
    [64, {
        number: 64,
        name: 'semget',
        description: 'Get a System V semaphore set identifier',
        parameters: ['%rdi: key_t key', '%rsi: int nsems', '%rdx: int semflg'],
        returns: 'Semaphore set id, or -1 on error',
        errors: 'EINVAL, ENOMEM, ENOSPC, EEXIST, EINVAL, EPERM, etc'
    }],
    [65, {
        number: 65,
        name: 'semop',
        description: 'Perform operations on selected semaphores in a set',
        parameters: ['%rdi: int semid', '%rsi: struct sembuf *sops', '%rdx: unsigned nsops'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EIDRM, EINTR, E2BIG, EPERM, etc'
    }],
    [66, {
        number: 66,
        name: 'semctl',
        description: 'Control operations on a System V semaphore set',
        parameters: ['%rdi: int semid', '%rsi: int semnum', '%rdx: int cmd', '%r10: unsigned long arg'],
        returns: 'Depending on cmd: integer result or 0, or -1 on error',
        errors: 'EFAULT, EINVAL, EPERM, EIDRM, etc'
    }],
    [67, {
        number: 67,
        name: 'shmdt',
        description: 'Detach shared memory segment',
        parameters: ['%rdi: void *shmaddr'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT'
    }],
    [68, {
        number: 68,
        name: 'msgget',
        description: 'Get a System V message queue identifier',
        parameters: ['%rdi: key_t key', '%rsi: int msgflg'],
        returns: 'Message queue id, or -1 on error',
        errors: 'EINVAL, ENOMEM, ENOSPC, EEXIST, EPERM, etc'
    }],
    [69, {
        number: 69,
        name: 'msgsnd',
        description: 'Send a message to a System V message queue',
        parameters: ['%rdi: int msqid', '%rsi: const struct msgbuf *msgp', '%rdx: size_t msgsz', '%r10: int msgflg'],
        returns: '0 on success, or -1 on error',
        errors: 'EAGAIN, EFAULT, EINVAL, EIDRM, EPERM, ERANGE, etc'
    }],
    [70, {
        number: 70,
        name: 'msgrcv',
        description: 'Receive a message from a System V message queue',
        parameters: [
            '%rdi: int msqid',
            '%rsi: struct msgbuf *msgp',
            '%rdx: size_t msgsz',
            '%r10: long msgtyp',
            '%r8: int msgflg'
        ],
        returns: 'Number of bytes received, or -1 on error',
        errors: 'EAGAIN, EFAULT, EINVAL, EIDRM, ENOMSG, EPERM, etc'
    }],
    [71, {
        number: 71,
        name: 'msgctl',
        description: 'Control operations on a System V message queue',
        parameters: ['%rdi: int msqid', '%rsi: int cmd', '%rdx: struct msqid_ds *buf'],
        returns: '0 on success (or command-dependent), or -1 on error',
        errors: 'EFAULT, EINVAL, EPERM, EIDRM, etc'
    }],
    [72, {
        number: 72,
        name: 'fcntl',
        description: 'Perform operations on a file descriptor',
        parameters: ['%rdi: unsigned int fd', '%rsi: unsigned int cmd', '%rdx: unsigned long arg'],
        returns: 'Command-dependent (usually int), or -1 on error',
        errors: 'EBADF, EINVAL, EACCES, EDEADLK, etc'
    }],
    [73, {
        number: 73,
        name: 'flock',
        description: 'Apply or remove an advisory lock on an open file',
        parameters: ['%rdi: unsigned int fd', '%rsi: unsigned int cmd'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EWOULDBLOCK, EINVAL, etc'
    }],
    [74, {
        number: 74,
        name: 'fsync',
        description: 'Synchronize a file’s in-core state with storage device',
        parameters: ['%rdi: unsigned int fd'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EIO'
    }],
    [75, {
        number: 75,
        name: 'fdatasync',
        description: 'Synchronize a file\'s in-core data (but not necessarily metadata) with storage device',
        parameters: ['%rdi: unsigned int fd'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EIO'
    }],
    [76, {
        number: 76,
        name: 'truncate',
        description: 'Truncate a file to a specified length',
        parameters: ['%rdi: const char *path', '%rsi: long length'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EIO, EPERM, EROFS'
    }],
    [77, {
        number: 77,
        name: 'ftruncate',
        description: 'Truncate an open file (by descriptor) to a specified length',
        parameters: ['%rdi: unsigned int fd', '%rsi: off_t length'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EINVAL, EIO, EPERM, EROFS'
    }],
    [78, {
        number: 78,
        name: 'getdents',
        description: 'Get directory entries (old Linux “getdents”)',
        parameters: ['%rdi: unsigned int fd', '%rsi: struct linux_dirent *dirent', '%rdx: unsigned int count'],
        returns: 'Number of bytes read (entries), or -1 on error',
        errors: 'EBADF, EFAULT, EINVAL'
    }],
    [79, {
        number: 79,
        name: 'getcwd',
        description: 'Get current working directory',
        parameters: ['%rdi: char *buf', '%rsi: size_t size'],
        returns: 'Pointer to buf on success, or NULL on error',
        errors: 'EACCES (permission denied), EFAULT (bad address), EINVAL (invalid size), ENOENT (deleted), ERANGE (too small)'
    }],
    [80, {
        number: 80,
        name: 'chdir',
        description: 'Change working directory',
        parameters: ['%rdi: const char *path'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES (permission denied), EFAULT (bad address), ENOENT (no such file), ENOTDIR (not a directory)'
    }],
    [81, {
        number: 81,
        name: 'fchdir',
        description: 'Change working directory using file descriptor',
        parameters: ['%rdi: unsigned int fd'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, EIO, ELOOP, ENAMETOOLONG, ENOENT, ENOMEM, ENOTDIR, EBADF'
    }],
    [82, {
        number: 82,
        name: 'rename',
        description: 'Rename a file, moving it between directories if needed',
        parameters: ['%rdi: const char *oldpath', '%rsi: const char *newpath'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EBUSY, EFAULT, EINVAL, ENOENT, ENOTEMPTY, EPERM'
    }],
    [83, {
        number: 83,
        name: 'mkdir',
        description: 'Create a new directory',
        parameters: ['%rdi: const char *pathname', '%rsi: umode_t mode'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EEXIST, EFAULT, ENOENT, ENOSPC, EPERM'
    }],
    [84, {
        number: 84,
        name: 'rmdir',
        description: 'Remove a directory',
        parameters: ['%rdi: const char *pathname'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EBUSY, EFAULT, ENOENT, ENOTEMPTY, EPERM'
    }],
    [85, {
        number: 85,
        name: 'creat',
        description: 'Create a new file or rewrite an existing one',
        parameters: ['%rdi: const char *pathname', '%rsi: umode_t mode'],
        returns: 'File descriptor, or -1 on error',
        errors: 'EACCES, EEXIST, EFAULT, ENOENT, ENOSPC, EPERM'
    }],
    [86, {
        number: 86,
        name: 'link',
        description: 'Create a new link (hard link) to an existing file',
        parameters: ['%rdi: const char *oldpath', '%rsi: const char *newpath'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EEXIST, EFAULT, ENOENT, EPERM'
    }],
    [87, {
        number: 87,
        name: 'unlink',
        description: 'Remove a link to a file',
        parameters: ['%rdi: const char *pathname'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, EPERM'
    }],
    [88, {
        number: 88,
        name: 'symlink',
        description: 'Create a symbolic link to a file',
        parameters: ['%rdi: const char *target', '%rsi: const char *linkpath'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EEXIST, EFAULT, ENOENT, EPERM'
    }],
    [89, {
        number: 89,
        name: 'readlink',
        description: 'Place contents of symbolic link in buffer',
        parameters: ['%rdi: const char *path', '%rsi: char *buf', '%rdx: size_t bufsiz'],
        returns: 'Number of bytes placed in buf, or -1 on error',
        errors: 'EACCES, EFAULT, EINVAL, ENOENT, ENOMEM'
    }],
    [90, {
        number: 90,
        name: 'chmod',
        description: 'Change a file\'s mode bits (permissions)',
        parameters: ['%rdi: const char *path', '%rsi: umode_t mode'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, ENOSPC, EPERM'
    }],
    [91, {
        number: 91,
        name: 'fchmod',
        description: 'Change a file\'s mode bits (permissions) using file descriptor',
        parameters: ['%rdi: unsigned int fd', '%rsi: umode_t mode'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EACCES, EPERM'
    }],
    [92, {
        number: 92,
        name: 'chown',
        description: 'Change a file\'s owner and group',
        parameters: ['%rdi: const char *path', '%rsi: uid_t owner', '%rdx: gid_t group'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, EPERM'
    }],
    [93, {
        number: 93,
        name: 'fchown',
        description: 'Change a file\'s owner and group using file descriptor',
        parameters: ['%rdi: unsigned int fd', '%rsi: uid_t owner', '%rdx: gid_t group'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EACCES, EPERM'
    }],
    [94, {
        number: 94,
        name: 'lchown',
        description: 'Change a file\'s owner and group, not following symlinks',
        parameters: ['%rdi: const char *path', '%rsi: uid_t owner', '%rdx: gid_t group'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, EPERM'
    }],
    [95, {
        number: 95,
        name: 'umask',
        description: 'Set file mode creation mask',
        parameters: ['%rdi: mode_t mask'],
        returns: 'Value of previous mask'
    }],
    [96, {
        number: 96,
        name: 'gettimeofday',
        description: 'Get time of day',
        parameters: ['%rdi: struct timeval *tv', '%rsi: struct timezone *tz'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT (bad address), EINVAL (invalid timezone)'
    }],
    [97, {
        number: 97,
        name: 'getrlimit',
        description: 'Get resource limits',
        parameters: ['%rdi: int resource', '%rsi: struct rlimit *rlim'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL (invalid resource), EFAULT (bad address)'
    }],
    [98, {
        number: 98,
        name: 'getrusage',
        description: 'Get resource usage',
        parameters: ['%rdi: int who', '%rsi: struct rusage *usage'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL (invalid who), EFAULT (bad address)'
    }],
    [99, {
        number: 99,
        name: 'sysinfo',
        description: 'Get system information',
        parameters: ['%rdi: struct sysinfo *info'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT (bad address)'
    }],
    [100, {
        number: 100,
        name: 'times',
        description: 'Get process times',
        parameters: ['%rdi: struct tms *buf'],
        returns: 'Number of clock ticks since an arbitrary point, or -1 on error',
        errors: 'EFAULT (bad address)'
    }],
    [101, {
        number: 101,
        name: 'ptrace',
        description: 'Process trace',
        parameters: ['%rdi: enum __ptrace_request op, pid_t pid, void *addr, void *data'],
        returns: 'Requested data, therefore dependent on request, or -1 on error',
        errors: 'EBUSY, EFAULT, EINVAL, EIO, EPERM, ESRCH'
    }],
    [102, {
        number: 102,
        name: 'getuid',
        description: 'Get real user ID',
        parameters: [],
        returns: 'User ID (always succeeds)',
    }],
    [103, {
        number: 103,
        name: 'syslog',
        description: 'Read and/or clear kernel message ring buffer',
        parameters: ['%rdi: int type', '%rsi: char *bufp', '%rdx: int len'],
        returns: 'Varies by type, or -1 on error',
        errors: 'EINVAL (invalid type), EFAULT (bad address)'
    }],
    [104, {
        number: 104,
        name: 'getgid',
        description: 'Get real group ID',
        parameters: [],
        returns: 'Group ID (always succeeds)',
    }],
    [105, {
        number: 105,
        name: 'setuid',
        description: 'Set user identity',
        parameters: ['%rdi: uid_t uid'],
        returns: '0 on success, or -1 on error',
        errors: 'EAGAIN, EPERM, EINVAL'
    }],
    [106, {
        number: 106,
        name: 'setgid',
        description: 'Set group identity',
        parameters: ['%rdi: gid_t gid'],
        returns: '0 on success, or -1 on error',
        errors: 'EAGAIN, EPERM, EINVAL'
    }],
    [107, {
        number: 107,
        name: 'geteuid',
        description: 'Get effective user ID',
        parameters: [],
        returns: 'Effective user ID (always succeeds)',
    }],
    [108, {
        number: 108,
        name: 'getegid',
        description: 'Get effective group ID',
        parameters: [],
        returns: 'Effective group ID (always succeeds)',
    }],
    [109, {
        number: 109,
        name: 'setpgid',
        description: 'Set a process’s PGID',
        parameters: ['%rdi: pid_t pid', '%rsi: pid_t pgid'],
        returns: '0 on success, -1 on error',
        errors: 'EINVAL, EPERM, ESRCH'
    }],
    [110, {
        number: 110,
        name: 'getppid',
        description: 'Get parent process ID',
        parameters: [],
        returns: 'PPID',
        errors: ''
    }],
    [111, {
        number: 111,
        name: 'getpgrp',
        description: 'Get process group ID of calling process',
        parameters: [],
        returns: 'PGID',
        errors: ''
    }],
    [112, {
        number: 112,
        name: 'setsid',
        description: 'Create a session and set the process group ID',
        parameters: [],
        returns: 'SID on success, -1 on error',
        errors: 'EPERM'
    }],
    [113, {
        number: 113,
        name: 'setreuid',
        description: 'Set real and effective user IDs',
        parameters: ['%rdi: uid_t ruid', '%rsi: uid_t euid'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EINVAL'
    }],
    [114, {
        number: 114,
        name: 'setregid',
        description: 'Set real and effective group IDs',
        parameters: ['%rdi: gid_t rgid', '%rsi: gid_t egid'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EINVAL'
    }],
    [115, {
        number: 115,
        name: 'getgroups',
        description: 'Get supplementary group IDs',
        parameters: ['%rdi: int size', '%rsi: gid_t *list'],
        returns: 'Number of groups, -1 on error',
        errors: 'EINVAL, EFAULT'
    }],
    [116, {
        number: 116,
        name: 'setgroups',
        description: 'Set supplementary group IDs',
        parameters: ['%rdi: size_t size', '%rsi: const gid_t *list'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EFAULT'
    }],
    [117, {
        number: 117,
        name: 'setresuid',
        description: 'Set real, effective, and saved user ID',
        parameters: ['%rdi: uid_t ruid', '%rsi: uid_t euid', '%rdx: uid_t suid'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EINVAL'
    }],
    [118, {
        number: 118,
        name: 'getresuid',
        description: 'Get real, effective, and saved user ID',
        parameters: ['%rdi: uid_t *ruid', '%rsi: uid_t *euid', '%rdx: uid_t *suid'],
        returns: '0 on success, -1 on error',
        errors: 'EFAULT'
    }],
    [119, {
        number: 119,
        name: 'setresgid',
        description: 'Set real, effective, and saved group ID',
        parameters: ['%rdi: gid_t rgid', '%rsi: gid_t egid', '%rdx: gid_t sgid'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EINVAL'
    }],
    [120, {
        number: 120,
        name: 'getresgid',
        description: 'Get real, effective, and saved group ID',
        parameters: ['%rdi: gid_t *rgid', '%rsi: gid_t *egid', '%rdx: gid_t *sgid'],
        returns: '0 on success, -1 on error',
        errors: 'EFAULT'
    }],
    [121, {
        number: 121,
        name: 'getpgid',
        description: 'Get PGID of a process',
        parameters: ['%rdi: pid_t pid'],
        returns: 'PGID, or -1 on error',
        errors: 'ESRCH'
    }],
    [122, {
        number: 122,
        name: 'setfsuid',
        description: 'Set filesystem UID',
        parameters: ['%rdi: uid_t fsuid'],
        returns: 'Previous fsuid',
        errors: '—'
    }],
    [123, {
        number: 123,
        name: 'setfsgid',
        description: 'Set filesystem GID',
        parameters: ['%rdi: gid_t fsgid'],
        returns: 'Previous fsgid',
        errors: '—'
    }],
    [124, {
        number: 124,
        name: 'getsid',
        description: 'Get session ID of a process',
        parameters: ['%rdi: pid_t pid'],
        returns: 'SID, -1 on error',
        errors: 'ESRCH'
    }],
    [125, {
        number: 125,
        name: 'capget',
        description: 'Get capabilities',
        parameters: ['%rdi: cap_user_header_t *hdrp', '%rsi: cap_user_data_t *datap'],
        returns: '0 on success, -1 on error',
        errors: 'EFAULT, EINVAL'
    }],
    [126, {
        number: 126,
        name: 'capset',
        description: 'Set capabilities',
        parameters: ['%rdi: cap_user_header_t *hdrp', '%rsi: const cap_user_data_t *data'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EFAULT, EINVAL'
    }],
    [127, {
        number: 127,
        name: 'rt_sigpending',
        description: 'Examine pending signals (real-time)',
        parameters: ['%rdi: sigset_t *set', '%rsi: size_t size'],
        returns: '0 on success, -1 on error',
        errors: 'EFAULT'
    }],
    [128, {
        number: 128,
        name: 'rt_sigtimedwait',
        description: 'Wait for a signal with timeout',
        parameters: ['%rdi: const sigset_t *set', '%rsi: siginfo_t *info', '%rdx: const struct timespec *timeout', '%r10: size_t size'],
        returns: 'Signal number or -1 on error',
        errors: 'EFAULT, EINTR, EINVAL, EAGAIN'
    }],
    [129, {
        number: 129,
        name: 'rt_sigqueueinfo',
        description: 'Queue signal with info to a process',
        parameters: ['%rdi: pid_t pid', '%rsi: int sig', '%rdx: siginfo_t *info'],
        returns: '0 on success, -1 on error',
        errors: 'EFAULT, EPERM, EINVAL, ESRCH'
    }],
    [130, {
        number: 130,
        name: 'rt_sigsuspend',
        description: 'Replace mask and suspend process',
        parameters: ['%rdi: sigset_t *mask', '%rsi: size_t size'],
        returns: '-1 with EINTR when signal received',
        errors: 'EFAULT'
    }],
    [131, {
        number: 131,
        name: 'sigaltstack',
        description: 'Set/get alternate signal stack',
        parameters: ['%rdi: const stack_t *ss', '%rsi: stack_t *old_ss'],
        returns: '0 on success, -1 on error',
        errors: 'EFAULT, EPERM, ENOMEM'
    }],
    [132, {
        number: 132,
        name: 'utime',
        description: 'Set file access/modification times',
        parameters: ['%rdi: const char *filename', '%rsi: const struct utimbuf *times'],
        returns: '0 on success, -1 on error',
        errors: 'EACCES, EFAULT, EINVAL, ENOENT, EPERM'
    }],
    [133, {
        number: 133,
        name: 'mknod',
        description: 'Create a filesystem node',
        parameters: ['%rdi: const char *pathname', '%rsi: mode_t mode', '%rdx: dev_t dev'],
        returns: '0 on success, -1 on error',
        errors: 'EACCES, EEXIST, EFAULT, ENOENT, EPERM'
    }],
    [134, {
        number: 134,
        name: 'uselib',
        description: 'Load shared library (obsolete)',
        parameters: ['%rdi: const char *library'],
        returns: '0 on success, -1 on error',
        errors: 'ENOENT, ENOMEM'
    }],
    [135, {
        number: 135,
        name: 'personality',
        description: 'Set/get process execution domain',
        parameters: ['%rdi: unsigned long persona'],
        returns: 'Previous persona, or -1 on error',
        errors: 'EINVAL'
    }],
    [136, {
        number: 136,
        name: 'ustat',
        description: 'Get filesystem statistics (obsolete)',
        parameters: ['%rdi: dev_t dev', '%rsi: struct ustat *ubuf'],
        returns: '0 on success, -1 on error',
        errors: 'EFAULT, EINVAL'
    }],
    [137, {
        number: 137,
        name: 'statfs',
        description: 'Get filesystem statistics',
        parameters: ['%rdi: const char *path', '%rsi: struct statfs *buf'],
        returns: '0 on success, -1 on error',
        errors: 'EACCES, EFAULT, ENOENT'
    }],
    [138, {
        number: 138,
        name: 'fstatfs',
        description: 'Get filesystem statistics by fd',
        parameters: ['%rdi: int fd', '%rsi: struct statfs *buf'],
        returns: '0 on success, -1 on error',
        errors: 'EBADF, EFAULT'
    }],
    [139, {
        number: 139,
        name: 'sysfs',
        description: 'Access filesystem type information',
        parameters: ['%rdi: int option', '%rsi: unsigned long arg1', '%rdx: unsigned long arg2'],
        returns: 'Depends on option',
        errors: 'EINVAL'
    }],
    [140, {
        number: 140,
        name: 'getpriority',
        description: 'Get process priority',
        parameters: ['%rdi: int which', '%rsi: int who'],
        returns: 'Priority or -1 on error',
        errors: 'EINVAL, ESRCH'
    }],
    [141, {
        number: 141,
        name: 'setpriority',
        description: 'Set process priority',
        parameters: ['%rdi: int which', '%rsi: int who', '%rdx: int prio'],
        returns: '0 on success, -1 on error',
        errors: 'EINVAL, ESRCH, EPERM'
    }],
    [142, {
        number: 142,
        name: 'sched_setparam',
        description: 'Set scheduling parameters',
        parameters: ['%rdi: pid_t pid', '%rsi: const struct sched_param *param'],
        returns: '0 on success, -1 on error',
        errors: 'EINVAL, ESRCH, EPERM'
    }],
    [143, {
        number: 143,
        name: 'sched_getparam',
        description: 'Get scheduling parameters',
        parameters: ['%rdi: pid_t pid', '%rsi: struct sched_param *param'],
        returns: '0 on success, -1 on error',
        errors: 'EINVAL, ESRCH'
    }],
    [144, {
        number: 144,
        name: 'sched_setscheduler',
        description: 'Set process scheduler and params',
        parameters: ['%rdi: pid_t pid', '%rsi: int policy', '%rdx: const struct sched_param *param'],
        returns: '0 on success, -1 on error',
        errors: 'EINVAL, EPERM, ESRCH'
    }],
    [145, {
        number: 145,
        name: 'sched_getscheduler',
        description: 'Get scheduling policy',
        parameters: ['%rdi: pid_t pid'],
        returns: 'Policy or -1 on error',
        errors: 'EINVAL, ESRCH'
    }],
    [146, {
        number: 146,
        name: 'sched_get_priority_max',
        description: 'Max priority for a scheduler policy',
        parameters: ['%rdi: int policy'],
        returns: 'Priority or -1 on error',
        errors: 'EINVAL'
    }],
    [147, {
        number: 147,
        name: 'sched_get_priority_min',
        description: 'Min priority for a scheduler policy',
        parameters: ['%rdi: int policy'],
        returns: 'Priority or -1 on error',
        errors: 'EINVAL'
    }],
    [148, {
        number: 148,
        name: 'sched_rr_get_interval',
        description: 'Get RR scheduler quantum',
        parameters: ['%rdi: pid_t pid', '%rsi: struct timespec *tp'],
        returns: '0 on success, -1 on error',
        errors: 'EINVAL, ESRCH, EFAULT'
    }],
    [149, {
        number: 149,
        name: 'mlock',
        description: 'Lock memory segment',
        parameters: ['%rdi: const void *addr', '%rsi: size_t len'],
        returns: '0 on success, -1 on error',
        errors: 'ENOMEM, EPERM, EINVAL'
    }],
    [150, {
        number: 150,
        name: 'munlock',
        description: 'Unlock memory segment',
        parameters: ['%rdi: const void *addr', '%rsi: size_t len'],
        returns: '0 on success, -1 on error',
        errors: 'EINVAL'
    }],
    [151, {
        number: 151,
        name: 'mlockall',
        description: 'Lock all memory',
        parameters: ['%rdi: int flags'],
        returns: '0 on success, -1 on error',
        errors: 'ENOMEM, EPERM'
    }],
    [152, {
        number: 152,
        name: 'munlockall',
        description: 'Unlock all memory',
        parameters: [],
        returns: '0 on success, -1 on error',
        errors: ''
    }],
    [153, {
        number: 153,
        name: 'vhangup',
        description: 'Simulate terminal hangup',
        parameters: [],
        returns: '0 on success, -1 on error',
        errors: 'EPERM'
    }],
    [154, {
        number: 154,
        name: 'modify_ldt',
        description: 'Read/modify LDT',
        parameters: ['%rdi: int func', '%rsi: void *ptr', '%rdx: unsigned long bytecount'],
        returns: 'Depends on op',
        errors: 'EINVAL, EFAULT'
    }],
    [155, {
        number: 155,
        name: 'pivot_root',
        description: 'Change root filesystem',
        parameters: ['%rdi: const char *new_root', '%rsi: const char *put_old'],
        returns: '0 on success, -1 on error',
        errors: 'EINVAL, EBUSY, EPERM'
    }],
    [156, {
        number: 156,
        name: '_sysctl',
        description: 'System control interface (obsolete)',
        parameters: ['%rdi: struct __sysctl_args *args'],
        returns: '0 on success, -1 on error',
        errors: 'EFAULT, EPERM'
    }],
    [157, {
        number: 157,
        name: 'prctl',
        description: 'Process control operations',
        parameters: ['%rdi: int option', '%rsi: unsigned long arg2', '%rdx: unsigned long arg3', '%r10: unsigned long arg4', '%r8: unsigned long arg5'],
        returns: 'Depends on option',
        errors: 'EINVAL, EPERM'
    }],
    [158, {
        number: 158,
        name: 'arch_prctl',
        description: 'Set/get architecture-specific thread state',
        parameters: ['%rdi: int code', '%rsi: unsigned long addr'],
        returns: '0 on success, -1 on error',
        errors: 'EINVAL, EFAULT'
    }],
    [159, {
        number: 159,
        name: 'adjtimex',
        description: 'Adjust kernel time',
        parameters: ['%rdi: struct timex *buf'],
        returns: 'Status or -1 on error',
        errors: 'EFAULT, EINVAL'
    }],
    [160, {
        number: 160,
        name: 'setrlimit',
        description: 'Set resource limits',
        parameters: ['%rdi: int resource', '%rsi: const struct rlimit *rlim'],
        returns: '0 on success, -1 on error',
        errors: 'EINVAL, EPERM'
    }],
    [161, {
        number: 161,
        name: 'chroot',
        description: 'Change root directory',
        parameters: ['%rdi: const char *path'],
        returns: '0 on success, -1 on error',
        errors: 'EACCES, EFAULT, EPERM'
    }],
    [162, {
        number: 162,
        name: 'sync',
        description: 'Write all pending disk I/O to disk',
        parameters: [],
        returns: '',
        errors: ''
    }],
    [163, {
        number: 163,
        name: 'acct',
        description: 'Enable/disable process accounting',
        parameters: ['%rdi: const char *filename'],
        returns: '0 on success, -1 on error',
        errors: 'EACCES, EFAULT, EPERM'
    }],
    [164, {
        number: 164,
        name: 'settimeofday',
        description: 'Set system time',
        parameters: ['%rdi: const struct timeval *tv', '%rsi: const struct timezone *tz'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EFAULT, EINVAL'
    }],
    [165, {
        number: 165,
        name: 'mount',
        description: 'Mount filesystem',
        parameters: ['%rdi: const char *src', '%rsi: const char *target', '%rdx: const char *fstype', '%r10: unsigned long flags', '%r8: const void *data'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EINVAL, ENOENT'
    }],
    [166, {
        number: 166,
        name: 'umount2',
        description: 'Unmount filesystem',
        parameters: ['%rdi: const char *target', '%rsi: int flags'],
        returns: '0 on success, -1 on error',
        errors: 'EINVAL, EBUSY'
    }],
    [167, {
        number: 167,
        name: 'swapon',
        description: 'Enable swap device',
        parameters: ['%rdi: const char *path', '%rsi: int flags'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EINVAL'
    }],
    [168, {
        number: 168,
        name: 'swapoff',
        description: 'Disable swap device',
        parameters: ['%rdi: const char *path'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EINVAL'
    }],
    [169, {
        number: 169,
        name: 'reboot',
        description: 'Reboot or control system power state',
        parameters: ['%rdi: int magic1', '%rsi: int magic2', '%rdx: unsigned int cmd', '%r10: void *arg'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EINVAL'
    }],
    [170, {
        number: 170,
        name: 'sethostname',
        description: 'Set system hostname',
        parameters: ['%rdi: const char *name', '%rsi: size_t len'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EINVAL'
    }],
    [171, {
        number: 171,
        name: 'setdomainname',
        description: 'Set NIS domain name',
        parameters: ['%rdi: const char *name', '%rsi: size_t len'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EINVAL'
    }],
    [172, {
        number: 172,
        name: 'iopl',
        description: 'Change I/O privilege level',
        parameters: ['%rdi: int level'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EINVAL'
    }],
    [173, {
        number: 173,
        name: 'ioperm',
        description: 'Set port I/O permissions',
        parameters: ['%rdi: unsigned long from', '%rsi: unsigned long num', '%rdx: int turn_on'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EINVAL'
    }],
    [174, {
        number: 174,
        name: 'create_module',
        description: 'Create loadable module (obsolete)',
        parameters: ['%rdi: const char *name', '%rsi: size_t size'],
        returns: 'Address or -1 on error',
        errors: 'EPERM, ENOMEM'
    }],
    [175, {
        number: 175,
        name: 'init_module',
        description: 'Load kernel module',
        parameters: ['%rdi: void *module_image', '%rsi: unsigned long len', '%rdx: const char *param_values'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EINVAL'
    }],
    [176, {
        number: 176,
        name: 'delete_module',
        description: 'Unload kernel module',
        parameters: ['%rdi: const char *name', '%rsi: int flags'],
        returns: '0 on success, -1 on error',
        errors: 'EPERM, EBUSY'
    }],
    [177, {
        number: 177,
        name: 'get_kernel_syms',
        description: 'Get exported kernel symbols (obsolete)',
        parameters: ['%rdi: struct kernel_sym *table'],
        returns: 'Count or -1 on error',
        errors: 'EFAULT'
    }],
    [178, {
        number: 178,
        name: 'query_module',
        description: 'Query module information (obsolete)',
        parameters: ['%rdi: const char *name', '%rsi: int which', '%rdx: void *buf', '%r10: size_t bufsize', '%r8: size_t *ret'],
        returns: '0 on success, -1 on error',
        errors: 'EINVAL, ENOENT'
    }],
    [179, {
        number: 179,
        name: 'quotactl',
        description: 'Manage filesystem quotas',
        parameters: ['%rdi: int cmd', '%rsi: const char *special', '%rdx: int id', '%r10: void *addr'],
        returns: '0 on success, -1 on error',
        errors: 'EINVAL, EFAULT, ENOENT'
    }],
    [180, {
        number: 180,
        name: 'nfsservctl',
        description: 'Control NFS server (obsolete)',
        parameters: ['%rdi: int cmd', '%rsi: struct nfsctl_arg *arg', '%rdx: union nfsctl_res *res'],
        returns: '0 on success, -1 on error',
        errors: 'EINVAL'
    }],
    [181, {
        number: 181,
        name: 'getpmsg',
        description: 'Get STREAMS message (obsolete)',
        parameters: ['%rdi: int fd', '%rsi: struct strbuf *ctl', '%rdx: struct strbuf *dat', '%r10: int *bandp', '%r8: int *flagsp'],
        returns: 'Message length or -1 on error',
        errors: 'EFAULT, ENOSTR'
    }],
    [182, {
        number: 182,
        name: 'putpmsg',
        description: 'Put STREAMS message (obsolete)',
        parameters: ['%rdi: int fd', '%rsi: const struct strbuf *ctl', '%rdx: const struct strbuf *dat', '%r10: int band', '%r8: int flags'],
        returns: '0 on success, -1 on error',
        errors: 'EFAULT, ENOSTR'
    }],
    [183, {
        number: 183,
        name: 'afs_syscall',
        description: 'AFS system call (placeholder, unused)',
        parameters: [],
        returns: '-1 always',
        errors: 'ENOSYS'
    }],
    [184, {
        number: 184,
        name: 'tuxcall',
        description: 'Tux web server syscall (obsolete)',
        parameters: [],
        returns: '-1 on error',
        errors: 'ENOSYS'
    }],
    [185, {
        number: 185,
        name: 'security',
        description: 'Security framework syscall (obsolete)',
        parameters: [],
        returns: '-1 on error',
        errors: 'ENOSYS'
    }],
    [186, {
        number: 186,
        name: 'gettid',
        description: 'Get thread ID',
        parameters: [],
        returns: 'Thread ID (always succeeds)',
    }],
    [187, {
        number: 187,
        name: 'readahead',
        description: 'Perform file readahead: read file data into page cache without copying to user space',
        parameters: ['%rdi: int fd', '%rsi: loff_t offset', '%rdx: size_t count'],
        returns: 'Number of bytes read into cache (or 0), or -1 on error',
        errors: 'EBADF, EIO, EINVAL'
    }],
    [188, {
        number: 188,
        name: 'setxattr',
        description: 'Set extended attribute on a filesystem object (by path)',
        parameters: ['%rdi: const char *path', '%rsi: const char *name', '%rdx: const void *value', '%r10: size_t size', '%r8: int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, EINVAL, ENOENT, ENOTDIR, EPERM, ENOSPC, ENOTSUP'
    }],
    [189, {
        number: 189,
        name: 'lsetxattr',
        description: 'Set extended attribute on a filesystem object without following symlinks (by path)',
        parameters: ['%rdi: const char *path', '%rsi: const char *name', '%rdx: const void *value', '%r10: size_t size', '%r8: int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, EINVAL, ENOENT, EPERM, ENOSPC, ENOTSUP'
    }],
    [190, {
        number: 190,
        name: 'fsetxattr',
        description: 'Set extended attribute on an open file (by descriptor)',
        parameters: ['%rdi: int fd', '%rsi: const char *name', '%rdx: const void *value', '%r10: size_t size', '%r8: int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EACCES, EFAULT, EINVAL, EPERM, ENOSPC, ENOTSUP'
    }],
    [191, {
        number: 191,
        name: 'getxattr',
        description: 'Get extended attribute on a filesystem object (by path)',
        parameters: ['%rdi: const char *path', '%rsi: const char *name', '%rdx: void *value', '%r10: size_t size'],
        returns: 'Size of attribute on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, ERANGE, ENOTSUP'
    }],
    [192, {
        number: 192,
        name: 'lgetxattr',
        description: 'Get extended attribute on a filesystem object without following symlinks (by path)',
        parameters: ['%rdi: const char *path', '%rsi: const char *name', '%rdx: void *value', '%r10: size_t size'],
        returns: 'Size of attribute on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, ERANGE, ENOTSUP'
    }],
    [193, {
        number: 193,
        name: 'fgetxattr',
        description: 'Get extended attribute on an open file (by descriptor)',
        parameters: ['%rdi: int fd', '%rsi: const char *name', '%rdx: void *value', '%r10: size_t size'],
        returns: 'Size of attribute on success, or -1 on error',
        errors: 'EBADF, EACCES, EFAULT, ERANGE, ENOTSUP'
    }],
    [194, {
        number: 194,
        name: 'listxattr',
        description: 'List extended attribute names of a filesystem object (by path)',
        parameters: ['%rdi: const char *path', '%rsi: char *list', '%rdx: size_t size'],
        returns: 'Size of list on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, ERANGE'
    }],
    [195, {
        number: 195,
        name: 'llistxattr',
        description: 'List extended attribute names without following symlinks (by path)',
        parameters: ['%rdi: const char *path', '%rsi: char *list', '%rdx: size_t size'],
        returns: 'Size of list on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, ERANGE'
    }],
    [196, {
        number: 196,
        name: 'flistxattr',
        description: 'List extended attribute names on an open file (by descriptor)',
        parameters: ['%rdi: int fd', '%rsi: char *list', '%rdx: size_t size'],
        returns: 'Size of list on success, or -1 on error',
        errors: 'EBADF, EACCES, EFAULT, ERANGE'
    }],
    [197, {
        number: 197,
        name: 'removexattr',
        description: 'Remove extended attribute from a filesystem object (by path)',
        parameters: ['%rdi: const char *path', '%rsi: const char *name'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, ENOTSUP'
    }],
    [198, {
        number: 198,
        name: 'lremovexattr',
        description: 'Remove extended attribute without following symlinks (by path)',
        parameters: ['%rdi: const char *path', '%rsi: const char *name'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, ENOTSUP'
    }],
    [199, {
        number: 199,
        name: 'fremovexattr',
        description: 'Remove extended attribute from an open file (by descriptor)',
        parameters: ['%rdi: int fd', '%rsi: const char *name'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EACCES, EFAULT, ENOTSUP'
    }],
    [200, {
        number: 200,
        name: 'tkill',
        description: 'Send a signal to a thread (by TID)',
        parameters: ['%rdi: pid_t pid', '%rsi: int sig'],
        returns: '0 on success, or -1 on error',
        errors: 'ESRCH, EPERM, EINVAL'
    }],
    [201, {
        number: 201,
        name: 'time',
        description: 'Get the current time (seconds since the Epoch)',
        parameters: ['%rdi: __kernel_old_time_t *tloc'],
        returns: 'Time as time_t (or -1 on error), or 0 and store to *tloc on success',
        errors: 'EFAULT'
    }],
    [202, {
        number: 202,
        name: 'futex',
        description: 'Fast userspace locking — waiting or waking on a futex word',
        parameters: ['%rdi: u32 *uaddr', '%rsi: int op', '%rdx: u32 val', '%r10: const struct __kernel_timespec *timeout', '%r8: u32 *uaddr2', '%r9: u32 val3'],
        returns: '0 or positive on success, or -1 on error',
        errors: 'EFAULT, EINVAL, ETIMEDOUT, EWOULDBLOCK, EINTR'
    }],
    [203, {
        number: 203,
        name: 'sched_setaffinity',
        description: 'Set CPU affinity mask for a process/thread',
        parameters: ['%rdi: pid_t pid', '%rsi: unsigned int len', '%rdx: unsigned long *user_mask_ptr'],
        returns: '0 on success, or -1 on error',
        errors: 'ESRCH, EINVAL, EFAULT, EPERM'
    }],
    [204, {
        number: 204,
        name: 'sched_getaffinity',
        description: 'Get CPU affinity mask of a process/thread',
        parameters: ['%rdi: pid_t pid', '%rsi: unsigned int len', '%rdx: unsigned long *user_mask_ptr'],
        returns: 'Number of bytes used for mask, or -1 on error',
        errors: 'ESRCH, EINVAL, EFAULT'
    }],
    [205, {
        number: 205,
        name: 'set_thread_area',
        description: 'Set up thread-local storage area (TLS) for current thread',
        parameters: ['%rdi: struct user_desc *u_info'],  // user_desc struct depending on arch
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EPERM'
    }],
    [206, {
        number: 206,
        name: 'io_setup',
        description: 'Prepare an asynchronous I/O context',
        parameters: ['%rdi: unsigned int nr_events', '%rsi: aio_context_t *ctxp'],
        returns: '0 on success (ctxp initialized), or -1 on error',
        errors: 'EINVAL, EFAULT, ENOSYS, ENOMEM'
    }],
    [207, {
        number: 207,
        name: 'io_destroy',
        description: 'Destroy an AIO context',
        parameters: ['%rdi: aio_context_t ctx'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL'
    }],
    [208, {
        number: 208,
        name: 'io_getevents',
        description: 'Retrieve completed AIO events from an AIO context',
        parameters: ['%rdi: aio_context_t ctx', '%rsi: long min_nr', '%rdx: long max_nr', '%r10: struct io_event *events', '%r8: struct timespec *timeout'],
        returns: 'Number of events retrieved, or -1 on error',
        errors: 'EINVAL, EFAULT, EINTR'
    }],
    [209, {
        number: 209,
        name: 'io_submit',
        description: 'Submit one or more asynchronous I/O requests',
        parameters: ['%rdi: aio_context_t ctx', '%rsi: long nr', '%rdx: struct iocb **iocbpp'],
        returns: 'Number of requests successfully submitted, or -1 on error',
        errors: 'EINVAL, EBADF, EFAULT, ENOMEM'
    }],
    [210, {
        number: 210,
        name: 'io_cancel',
        description: 'Cancel asynchronous I/O request',
        parameters: ['%rdi: aio_context_t ctx', '%rsi: struct iocb *iocb', '%rdx: struct io_event *result'],
        returns: '0 on success (or -1 on error)',
        errors: 'EINVAL, EFAULT'
    }],
    [211, {
        number: 211,
        name: 'get_thread_area',
        description: 'Get thread-local storage area descriptor for current thread',
        parameters: ['%rdi: struct user_desc *u_info'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT, EINVAL'
    }],
    [212, {
        number: 212,
        name: 'lookup_dcookie',
        description: 'Lookup directory cookie and return mount id — used internally for exportfs, etc.',
        parameters: ['%rdi: u64 cookie', '%rsi: u64 *mount_id', '%rdx: unsigned long len'],
        returns: 'Number of bytes stored, or -1 on error',
        errors: 'EINVAL, ENOENT'
    }],
    [213, {
        number: 213,
        name: 'epoll_create',
        description: 'Create an epoll file descriptor',
        parameters: ['%rdi: int size'],  // 'size' is ignored on modern kernels but retained for compatibility
        returns: 'New epoll file descriptor, or -1 on error',
        errors: 'EMFILE, ENFILE, ENOMEM'
    }],
    [214, {
        number: 214,
        name: 'epoll_ctl_old',
        description: 'Old epoll_ctl (legacy interface — mostly unimplemented on modern kernels)',
        parameters: ['%rdi: int epfd', '%rsi: int op', '%rdx: int fd', '%r10: struct epoll_event *event'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EBADF, EFAULT'
    }],
    [215, {
        number: 215,
        name: 'epoll_wait_old',
        description: 'Old epoll_wait (legacy interface)',
        parameters: ['%rdi: int epfd', '%rsi: struct epoll_event *events', '%rdx: int maxevents', '%r10: int timeout'],
        returns: 'Number of events, or -1 on error',
        errors: 'EINVAL, EBADF, EFAULT'
    }],
    [216, {
        number: 216,
        name: 'remap_file_pages',
        description: 'Remap pages of a file mapping (used for partial unmapping/remapping) — legacy and seldom used',
        parameters: ['%rdi: void *addr', '%rsi: size_t size', '%rdx: int prot', '%r10: size_t pgoff', '%r8: unsigned long flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT'
    }],
    [217, {
        number: 217,
        name: 'getdents64',
        description: 'Get directory entries (new 64-bit Linux getdents64)',
        parameters: ['%rdi: unsigned int fd', '%rsi: struct linux_dirent64 *dirent', '%rdx: unsigned int count'],
        returns: 'Number of bytes read (entries), or -1 on error',
        errors: 'EBADF, EFAULT, EINVAL'
    }],
    [218, {
        number: 218,
        name: 'set_tid_address',
        description: 'Set address for thread ID (used by threading libraries on exit)',
        parameters: ['%rdi: int *tidptr'],
        returns: 'TID of current thread, or -1 on error',
        errors: 'EFAULT'
    }],
    [219, {
        number: 219,
        name: 'restart_syscall',
        description: 'Indirect syscall used internally to restart interrupted system calls',
        parameters: [],
        returns: 'Never returns to user code (used by kernel) or error',
        errors: ''
    }],
    [220, {
        number: 220,
        name: 'semtimedop',
        description: 'Semaphore operations with timeout (System V semaphores)',
        parameters: ['%rdi: int semid', '%rsi: struct sembuf *sops', '%rdx: unsigned nsops', '%r10: const struct __kernel_timespec *timeout'],
        returns: '0 on success, or -1 on error',
        errors: 'EIDRM, EFAULT, EINTR, EINVAL, EAGAIN, ETIMEDOUT'
    }],
    [221, {
        number: 221,
        name: 'fadvise64',
        description: 'Advise the kernel about intended file access pattern (posix_fadvise)',
        parameters: ['%rdi: int fd', '%rsi: loff_t offset', '%rdx: size_t len', '%r10: int advice'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EINVAL'
    }],
    [222, {
        number: 222,
        name: 'timer_create',
        description: 'Create a POSIX per-process timer',
        parameters: ['%rdi: clockid_t which_clock', '%rsi: struct sigevent *timer_event_spec', '%rdx: timer_t *timer_id'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT, ENOSYS'
    }],
    [223, {
        number: 223,
        name: 'timer_settime',
        description: 'Set the time until the next expiration of a POSIX timer',
        parameters: ['%rdi: timer_t timer_id', '%rsi: int flags', '%rdx: const struct itimerspec *new_setting', '%r10: struct itimerspec *old_setting'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT'
    }],
    [224, {
        number: 224,
        name: 'timer_gettime',
        description: 'Get the remaining time until expiration and interval for a POSIX timer',
        parameters: ['%rdi: timer_t timer_id', '%rsi: struct itimerspec *setting'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT'
    }],
    [225, {
        number: 225,
        name: 'timer_getoverrun',
        description: 'Get the overrun count for a POSIX timer',
        parameters: ['%rdi: timer_t timer_id'],
        returns: 'Number of overruns (>= 0), or -1 on error',
        errors: 'EINVAL'
    }],
    [226, {
        number: 226,
        name: 'timer_delete',
        description: 'Delete a POSIX timer',
        parameters: ['%rdi: timer_t timer_id'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL'
    }],
    [227, {
        number: 227,
        name: 'clock_settime',
        description: 'Set system clock time',
        parameters: ['%rdi: clockid_t which_clock', '%rsi: const struct __kernel_timespec *tp'],
        returns: '0 on success, or -1 on error',
        errors: 'EPERM, EFAULT, EINVAL'
    }],
    [228, {
        number: 228,
        name: 'clock_gettime',
        description: 'Get current time of specified clock',
        parameters: ['%rdi: clockid_t which_clock', '%rsi: struct __kernel_timespec *tp'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT'
    }],
    [229, {
        number: 229,
        name: 'clock_getres',
        description: 'Get resolution of specified clock',
        parameters: ['%rdi: clockid_t which_clock', '%rsi: struct __kernel_timespec *tp'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT'
    }],
    [230, {
        number: 230,
        name: 'clock_nanosleep',
        description: 'Sleep on a specified clock until a given time (or for a duration)',
        parameters: ['%rdi: clockid_t which_clock', '%rsi: int flags', '%rdx: const struct __kernel_timespec *rqtp', '%r10: struct __kernel_timespec *rmtp'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT, EINTR'
    }],
    [231, {
        number: 231,
        name: 'exit_group',
        description: 'Exit all threads in a process',
        parameters: ['%rdi: int status'],
        returns: 'Does not return',
    }],
    [232, {
        number: 232,
        name: 'epoll_wait',
        description: 'Wait for events on an epoll file descriptor',
        parameters: ['%rdi: int epfd', '%rsi: struct epoll_event *events', '%rdx: int maxevents', '%r10: int timeout'],
        returns: 'Number of ready events, or -1 on error',
        errors: 'EAGAIN, EBADF, EFAULT, EINTR, EINVAL'
    }],
    [233, {
        number: 233,
        name: 'epoll_ctl',
        description: 'Control interface for an epoll file descriptor (add, modify, delete fd from epoll set)',
        parameters: ['%rdi: int epfd', '%rsi: int op', '%rdx: int fd', '%r10: struct epoll_event *event'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EINVAL, EEXIST, ENOENT, ELOOP, EFAULT'
    }],
    [234, {
        number: 234,
        name: 'tgkill',
        description: 'Send a signal to a thread (given thread-group ID and thread ID)',
        parameters: ['%rdi: pid_t tgid', '%rsi: pid_t pid', '%rdx: int sig'],
        returns: '0 on success, or -1 on error',
        errors: 'ESRCH, EPERM, EINVAL'
    }],
    [235, {
        number: 235,
        name: 'utimes',
        description: 'Change file access and modification times (by filename)',
        parameters: ['%rdi: const char *filename', '%rsi: const struct __kernel_old_timeval *times'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, ELOOP, EINVAL'
    }],
    [236, {
        number: 236,
        name: 'vserver',
        description: '(unused/obsolete) vserver — virtualization interface (historical)',
        parameters: [],  // none (or kernel-internal)
        returns: '-1 (usually “not implemented” / ENOSYS)',
        errors: ''  // effectively always unavailable
    }],
    [237, {
        number: 237,
        name: 'mbind',
        description: 'Bind memory pages to a NUMA memory node mask (set memory policy for a range)',
        parameters: ['%rdi: unsigned long start', '%rsi: unsigned long len', '%rdx: unsigned long mode', '%r10: const unsigned long *nmask', '%r8: unsigned long maxnode', '%r9: unsigned flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT, ENOMEM, EPERM'
    }],
    [238, {
        number: 238,
        name: 'set_mempolicy',
        description: 'Set the NUMA memory policy for the calling process / thread',
        parameters: ['%rdi: int mode', '%rsi: const unsigned long *nmask', '%rdx: unsigned long maxnode'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT, EPERM'
    }],
    [239, {
        number: 239,
        name: 'get_mempolicy',
        description: 'Get the NUMA memory policy and (optionally) node mask for the calling process / thread',
        parameters: ['%rdi: int *policy', '%rsi: unsigned long *nmask', '%rdx: unsigned long maxnode', '%r10: unsigned long addr', '%r8: unsigned long flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT'
    }],
    [240, {
        number: 240,
        name: 'mq_open',
        description: 'Open (or create) a POSIX message queue',
        parameters: ['%rdi: const char *name', '%rsi: int oflag', '%rdx: mode_t mode', '%r10: struct mq_attr *attr'],
        returns: 'Message queue descriptor (non-negative) on success, or -1 on error',
        errors: 'EACCES, EEXIST, EINTR, EMFILE, ENOENT, ENAMETOOLONG, ENOSPC, ENOMEM'
    }],
    [241, {
        number: 241,
        name: 'mq_unlink',
        description: 'Remove a POSIX message queue name (unlink the queue)',
        parameters: ['%rdi: const char *name'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, ENOENT, EINVAL'
    }],
    [242, {
        number: 242,
        name: 'mq_timedsend',
        description: 'Send a message to a POSIX message queue, optionally waiting up to a timeout if queue is full',
        parameters: ['%rdi: mqd_t mqdes', '%rsi: const char *msg_ptr', '%rdx: size_t msg_len', '%r10: unsigned int msg_prio', '%r8: const struct __kernel_timespec *abs_timeout'],
        returns: '0 on success, or -1 on error',
        errors: 'EAGAIN, EINTR, EINVAL, EMFILE, ENOSPC, ETIMEDOUT, EFAULT'
    }],
    [243, {
        number: 243,
        name: 'mq_timedreceive',
        description: 'Receive a message from a POSIX message queue, optionally waiting up to a timeout if queue is empty',
        parameters: ['%rdi: mqd_t mqdes', '%rsi: char *msg_ptr', '%rdx: size_t msg_len', '%r10: unsigned int *msg_prio', '%r8: const struct __kernel_timespec *abs_timeout'],
        returns: 'Number of bytes received, or -1 on error',
        errors: 'EAGAIN, EINTR, EINVAL, EMFILE, ETIMEDOUT, EFAULT'
    }],
    [244, {
        number: 244,
        name: 'mq_notify',
        description: 'Request asynchronous notification for a POSIX message queue (when message arrives)',
        parameters: ['%rdi: mqd_t mqdes', '%rsi: const struct sigevent *notification'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT, ENOMEM'
    }],
    [245, {
        number: 245,
        name: 'mq_getsetattr',
        description: 'Get and/or set attributes of a POSIX message queue',
        parameters: ['%rdi: mqd_t mqdes', '%rsi: const struct mq_attr *newattr', '%rdx: struct mq_attr *oldattr'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EBADF, EFAULT'
    }],
    [246, {
        number: 246,
        name: 'kexec_load',
        description: 'Load a new kernel for later boot (kexec mechanism)',
        parameters: ['%rdi: unsigned long entry', '%rsi: unsigned long nr_segments', '%rdx: struct kexec_segment *segments', '%r10: unsigned long flags'],
        returns: '0 on success (on architectures with kexec), or -1 on error',
        errors: 'EINVAL, EFAULT, ENOMEM, EPERM'
    }],
    [247, {
        number: 247,
        name: 'waitid',
        description: 'Wait for state changes in a child process (or process group)',
        parameters: ['%rdi: int which', '%rsi: pid_t pid', '%rdx: struct siginfo *infop', '%r10: int options', '%r8: struct rusage *ru'],
        returns: '0 on success, or -1 on error',
        errors: 'ECHILD, EINTR, EINVAL'
    }],
    [248, {
        number: 248,
        name: 'add_key',
        description: 'Add a key to the kernel key-management facility',
        parameters: ['%rdi: const char *type', '%rsi: const char *description', '%rdx: const void *payload', '%r10: size_t plen', '%r8: key_serial_t dest_keyring'],
        returns: 'Serial number of new key on success, or -1 on error',
        errors: 'EACCES, EFAULT, EINVAL, ENOMEM, ENOSPC'
    }],
    [249, {
        number: 249,
        name: 'request_key',
        description: 'Request a key from the kernel key-management facility',
        parameters: ['%rdi: const char *type', '%rsi: const char *description', '%rdx: const char *callout_info', '%r10: key_serial_t dest_keyring'],
        returns: 'Serial number of retrieved key on success, or -1 on error',
        errors: 'EACCES, EFAULT, EINVAL, ENOMEM'
    }],
    [250, {
        number: 250,
        name: 'keyctl',
        description: 'Perform various operations on kernel keys (control interface)',
        parameters: ['%rdi: int cmd', '%rsi: unsigned long arg2', '%rdx: unsigned long arg3', '%r10: unsigned long arg4', '%r8: unsigned long arg5'],
        returns: 'Depends on command — usually 0 or key serial or pointer, or -1 on error',
        errors: 'EINVAL, EPERM, EFAULT'
    }],
    [251, {
        number: 251,
        name: 'ioprio_set',
        description: 'Set I/O scheduling priority/class of a process or process group',
        parameters: ['%rdi: int which', '%rsi: int who', '%rdx: int ioprio'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT, ESRCH, EPERM'
    }],
    [252, {
        number: 252,
        name: 'ioprio_get',
        description: 'Get I/O scheduling priority/class of a process or process group',
        parameters: ['%rdi: int which', '%rsi: int who'],
        returns: 'Current ioprio on success, or -1 on error',
        errors: 'EINVAL, ESRCH'
    }],
    [253, {
        number: 253,
        name: 'inotify_init',
        description: 'Create an inotify instance to monitor filesystem events',
        parameters: [],
        returns: 'A file descriptor for the new inotify instance, or -1 on error',
        errors: 'EMFILE, ENFILE, ENOMEM'
    }],
    [254, {
        number: 254,
        name: 'inotify_add_watch',
        description: 'Add a filesystem watch to an inotify instance',
        parameters: ['%rdi: int fd', '%rsi: const char *pathname', '%rdx: uint32_t mask'],
        returns: 'Watch descriptor (>=0) on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, ENOMEM'
    }],
    [255, {
        number: 255,
        name: 'inotify_rm_watch',
        description: 'Remove a filesystem watch from an inotify instance',
        parameters: ['%rdi: int fd', '%rsi: __s32 wd'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EBADF'
    }],
    [256, {
        number: 256,
        name: 'migrate_pages',
        description: 'Migrate memory pages of a process to new set of NUMA nodes',
        parameters: ['%rdi: pid_t pid', '%rsi: unsigned long maxnode', '%rdx: const unsigned long *from', '%r10: const unsigned long *to'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, ENOMEM, EPERM'
    }],
    [257, {
        number: 257,
        name: 'openat',
        description: 'Open a file relative to a directory fd',
        parameters: ['%rdi: int dirfd', '%rsi: const char *pathname', '%rdx: int flags', '%r10: umode_t mode'],
        returns: 'File descriptor, or -1 on error',
        errors: 'EACCES (permission denied), EEXIST (file exists), ENOENT (no such file), ENOMEM (out of memory)'
    }],
    [262, {
        number: 262,
        name: 'newfstatat',
        description: 'Get file status relative to directory fd',
        parameters: ['%rdi: int dirfd', '%rsi: const char *pathname', '%rdx: struct stat *statbuf', '%r10: int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES (permission denied), EBADF (bad dirfd), EFAULT (bad address), ENOENT (no such file)'
    }],
    [263, {
        number: 263,
        name: 'unlinkat',
        description: 'Remove a file (or link) relative to a directory file descriptor',
        parameters: ['%rdi: int dfd', '%rsi: const char *pathname', '%rdx: int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, ENOTDIR, EPERM'
    }],
    [264, {
        number: 264,
        name: 'renameat',
        description: 'Rename (or move) a file relative to directory fds',
        parameters: ['%rdi: int olddfd', '%rsi: const char *oldname', '%rdx: int newdfd', '%r10: const char *newname'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, EINVAL, EPERM, ENOTEMPTY'
    }],
    [265, {
        number: 265,
        name: 'linkat',
        description: 'Create a hard link relative to directory file descriptors',
        parameters: ['%rdi: int olddfd', '%rsi: const char *oldname', '%rdx: int newdfd', '%r10: const char *newname', '%r8: int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, EPERM, EEXIST, EXDEV'
    }],
    [266, {
        number: 266,
        name: 'symlinkat',
        description: 'Create a symbolic link relative to a directory file descriptor',
        parameters: ['%rdi: const char *oldname', '%rsi: int newdfd', '%rdx: const char *newname'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOTDIR, ENAMETOOLONG, EEXIST'
    }],
    [267, {
        number: 267,
        name: 'readlinkat',
        description: 'Read the value of a symbolic link relative to a directory fd',
        parameters: ['%rdi: int dfd', '%rsi: const char *pathname', '%rdx: char *buf', '%r10: int bufsiz'],
        returns: 'Number of bytes placed in buf on success (not null-terminated), or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, EINVAL, ERANGE'
    }],
    [268, {
        number: 268,
        name: 'fchmodat',
        description: 'Change permissions of a filesystem object relative to directory fd',
        parameters: ['%rdi: int dfd', '%rsi: const char *filename', '%rdx: mode_t mode'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, EPERM'
    }],
    [269, {
        number: 269,
        name: 'faccessat',
        description: 'Check user permissions of a filesystem object relative to directory fd',
        parameters: ['%rdi: int dfd', '%rsi: const char *filename', '%rdx: int mode'],
        returns: '0 on success (permissions ok), or -1 on error',
        errors: 'EACCES, EFAULT'
    }],
    [270, {
        number: 270,
        name: 'pselect6',
        description: 'Monitor multiple file descriptors, with signal-mask and timeout support',
        parameters: ['%rdi: int n', '%rsi: fd_set *inp', '%rdx: fd_set *outp', '%r10: fd_set *exp', '%r8: struct __kernel_timespec *tsp', '%r9: void *sigmask'],
        returns: 'Number of ready descriptors, or -1 on error',
        errors: 'EFAULT, EINTR, EINVAL'
    }],
    [271, {
        number: 271,
        name: 'ppoll',
        description: 'Poll file descriptors, with signal-mask and timeout support',
        parameters: ['%rdi: struct pollfd *ufds', '%rsi: unsigned int nfds', '%rdx: struct __kernel_timespec *tsp', '%r10: const sigset_t *sigmask', '%r8: size_t sigsetsize'],
        returns: 'Number of ready descriptors, or -1 on error',
        errors: 'EFAULT, EINTR, EINVAL'
    }],
    [272, {
        number: 272,
        name: 'unshare',
        description: 'Disassociate parts of process execution context (namespaces, etc.)',
        parameters: ['%rdi: unsigned long unshare_flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EPERM'
    }],
    [273, {
        number: 273,
        name: 'set_robust_list',
        description: 'Set thread’s robust futex list (for robust futexes)',
        parameters: ['%rdi: struct robust_list_head *head', '%rsi: size_t len'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT, EINVAL'
    }],
    [274, {
        number: 274,
        name: 'get_robust_list',
        description: 'Get the robust futex list head for a thread',
        parameters: ['%rdi: int pid', '%rsi: struct robust_list_head **head_ptr', '%rdx: size_t *len_ptr'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT, EINVAL'
    }],
    [275, {
        number: 275,
        name: 'splice',
        description: 'Splice data between two file descriptors (zero-copy pipe splice)',
        parameters: ['%rdi: int fd_in', '%rsi: loff_t *off_in', '%rdx: int fd_out', '%r10: loff_t *off_out', '%r8: size_t len', '%r9: unsigned int flags'],
        returns: 'Number of bytes spliced, or -1 on error',
        errors: 'EINVAL, EBADF, EFAULT, EPIPE, ENOSPC'
    }],
    [276, {
        number: 276,
        name: 'tee',
        description: 'Duplicate pipe data without consuming it (splice syscall feature)',
        parameters: ['%rdi: int fdin', '%rsi: int fdout', '%rdx: size_t len', '%r10: unsigned int flags'],
        returns: 'Number of bytes duplicated, or -1 on error',
        errors: 'EINVAL, EBADF, EFAULT'
    }],
    [277, {
        number: 277,
        name: 'sync_file_range',
        description: 'Flush parts or all of a file’s data (from cache) to storage',
        parameters: ['%rdi: int fd', '%rsi: loff_t offset', '%rdx: loff_t nbytes', '%r10: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EIO, EBADF'
    }],
    [278, {
        number: 278,
        name: 'vmsplice',
        description: 'Splice user memory into a pipe (map memory as pipe pages)',
        parameters: ['%rdi: int fd', '%rsi: const struct iovec *iov', '%rdx: unsigned long nr_segs', '%r10: unsigned int flags'],
        returns: 'Number of bytes spliced, or -1 on error',
        errors: 'EINVAL, EBADF, EFAULT'
    }],
    [279, {
        number: 279,
        name: 'move_pages',
        description: 'Move memory pages of a process to different NUMA nodes',
        parameters: ['%rdi: pid_t pid', '%rsi: unsigned long nr_pages', '%rdx: const void **pages', '%r10: const int *nodes', '%r8: int *status', '%r9: int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EPERM'
    }],
    [280, {
        number: 280,
        name: 'utimensat',
        description: 'Change file timestamps with nanosecond precision, relative to a directory fd',
        parameters: ['%rdi: int dfd', '%rsi: const char *filename', '%rdx: struct timespec *utimes', '%r10: int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT'
    }],
    [281, {
        number: 281,
        name: 'epoll_pwait',
        description: 'Wait for I/O events on epoll fd, with optional signal mask / sigset support',
        parameters: ['%rdi: int epfd', '%rsi: struct epoll_event *events', '%rdx: int maxevents', '%r10: int timeout', '%r8: const sigset_t *sigmask', '%r9: size_t sigsetsize'],
        returns: 'Number of ready events, or -1 on error',
        errors: 'EFAULT, EBADF, EINTR, EINVAL'
    }],
    [282, {
        number: 282,
        name: 'signalfd',
        description: 'Create a file descriptor that receives signals as read events',  // note: actual name may vary (signalfd or signalfd4 on modern kernels)
        parameters: ['%rdi: int ufd', '%rsi: const sigset_t *sigmask', '%rdx: int flags'],
        returns: 'File descriptor on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EMFILE, ENOMEM'
    }],
    [283, {
        number: 283,
        name: 'timerfd_create',
        description: 'Create a timer file descriptor (for POSIX timers via fd interface)',
        parameters: ['%rdi: int clockid', '%rsi: int flags'],
        returns: 'New fd on success, or -1 on error',
        errors: 'EINVAL, EMFILE, ENOMEM'
    }],
    [284, {
        number: 284,
        name: 'eventfd',
        description: 'Create an eventfd — user-kernel event notification via counter fd',
        parameters: ['%rdi: unsigned int initval', '%rsi: int flags'],
        returns: 'New fd on success, or -1 on error',
        errors: 'EINVAL, EMFILE, ENOMEM'
    }],
    [285, {
        number: 285,
        name: 'fallocate',
        description: 'Manipulate file space — preallocate or deallocate space to a file',
        parameters: ['%rdi: int fd', '%rsi: int mode', '%rdx: loff_t offset', '%r10: loff_t len'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EINVAL, EOPNOTSUPP'
    }],
    [286, {
        number: 286,
        name: 'timerfd_settime',
        description: 'Set the time for a timerfd created by timerfd_create',
        parameters: ['%rdi: int fd', '%rsi: int flags', '%rdx: const struct itimerspec *new_value', '%r10: struct itimerspec *old_value'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT'
    }],
    [287, {
        number: 287,
        name: 'timerfd_gettime',
        description: 'Get the remaining time of a timerfd',
        parameters: ['%rdi: int fd', '%rsi: struct itimerspec *cur_value'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT'
    }],
    [288, {
        number: 288,
        name: 'accept4',
        description: 'Accept a connection on a socket, with flags (non-blocking / close-on-exec)',
        parameters: ['%rdi: int sockfd', '%rsi: struct sockaddr *addr', '%rdx: socklen_t *addrlen', '%r10: int flags'],
        returns: 'File descriptor for new socket, or -1 on error',
        errors: 'EBADF, EFAULT, ENOTSOCK, EWOULDBLOCK, EINTR'
    }],
    [289, {
        number: 289,
        name: 'signalfd4',
        description: 'Extended signalfd (with flags) — receive signals via fd with extra control',
        parameters: ['%rdi: int ufd', '%rsi: const sigset_t *sigmask', '%rdx: int flags', '%r10: int /*unused/padding*/'],
        returns: 'File descriptor on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EMFILE, ENOMEM'
    }],
    [290, {
        number: 290,
        name: 'eventfd2',
        description: 'Extended eventfd (with flags) — user-kernel event counter fd',
        parameters: ['%rdi: unsigned int initval', '%rsi: int flags'],
        returns: 'File descriptor on success, or -1 on error',
        errors: 'EINVAL, EMFILE, ENOMEM'
    }],
    [291, {
        number: 291,
        name: 'epoll_create1',
        description: 'Create an epoll file descriptor with flags (close-on-exec, etc.)',
        parameters: ['%rdi: int flags'],
        returns: 'New epoll fd on success, or -1 on error',
        errors: 'EMFILE, ENFILE, ENOMEM'
    }],
    [292, {
        number: 292,
        name: 'dup3',
        description: 'Duplicate a file descriptor with flags (close-on-exec, non-block, etc.)',
        parameters: ['%rdi: unsigned int oldfd', '%rsi: unsigned int newfd', '%rdx: int flags'],
        returns: 'newfd on success, or -1 on error',
        errors: 'EBADF, EINVAL, ENOMEM'
    }],
    [293, {
        number: 293,
        name: 'pipe2',
        description: 'Create a pipe (pair of file descriptors) with flags (non-blocking, cloexec)',
        parameters: ['%rdi: int *fildes', '%rsi: int flags'],
        returns: '0 on success (fildes filled with two fds), or -1 on error',
        errors: 'EMFILE, ENFILE, ENOMEM'
    }],
    [294, {
        number: 294,
        name: 'inotify_init1',
        description: 'Initialize an inotify instance with flags (non-blocking, cloexec, etc.)',
        parameters: ['%rdi: int flags'],
        returns: 'New inotify fd on success, or -1 on error',
        errors: 'EMFILE, ENFILE, ENOMEM'
    }],
    [295, {
        number: 295,
        name: 'preadv',
        description: 'Read from file descriptor into multiple buffers (vector), at a given offset',
        parameters: ['%rdi: unsigned long fd', '%rsi: const struct iovec *vec', '%rdx: unsigned long vlen', '%r10: unsigned long pos_l', '%r8: unsigned long pos_h'],
        returns: 'Number of bytes read on success, or -1 on error',
        errors: 'EBADF, EFAULT, EINVAL'
    }],
    [296, {
        number: 296,
        name: 'pwritev',
        description: 'Write to file descriptor from multiple buffers (vector), at a given offset',
        parameters: ['%rdi: unsigned long fd', '%rsi: const struct iovec *vec', '%rdx: unsigned long vlen', '%r10: unsigned long pos_l', '%r8: unsigned long pos_h'],
        returns: 'Number of bytes written on success, or -1 on error',
        errors: 'EBADF, EFAULT, EINVAL'
    }],
    [297, {
        number: 297,
        name: 'rt_tgsigqueueinfo',
        description: 'Send a queued signal to a specific thread (with extra signal info)',
        parameters: ['%rdi: pid_t tgid', '%rsi: pid_t pid', '%rdx: int sig', '%r10: siginfo_t *uinfo'],
        returns: '0 on success, or -1 on error',
        errors: 'ESRCH, EINVAL, EPERM'
    }],
    [298, {
        number: 298,
        name: 'perf_event_open',
        description: 'Open a performance monitoring event (perf) for tracing or profiling',
        parameters: ['%rdi: struct perf_event_attr *attr', '%rsi: pid_t pid', '%rdx: int cpu', '%r10: int group_fd', '%r8: unsigned long flags'],
        returns: 'File descriptor for event, or -1 on error',
        errors: 'EFAULT, EINVAL, EMFILE, ENOMEM'
    }],
    [299, {
        number: 299,
        name: 'recvmmsg',
        description: 'Receive multiple messages on a socket using a vector of mmsghdr, optionally with timeout',
        parameters: ['%rdi: int fd', '%rsi: struct mmsghdr *msgvec', '%rdx: unsigned int vlen', '%r10: unsigned flags', '%r8: struct __kernel_timespec *timeout'],
        returns: 'Number of received messages on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EINTR'
    }],
    [300, {
        number: 300,
        name: 'fanotify_init',
        description: 'Initialize a fanotify group (file event notification) with flags',
        parameters: ['%rdi: unsigned int flags', '%rsi: unsigned int event_f_flags'],
        returns: 'File descriptor for fanotify group, or -1 on error',
        errors: 'EINVAL, EMFILE, ENOMEM'
    }],
    [301, {
        number: 301,
        name: 'fanotify_mark',
        description: 'Modify marks for a fanotify group (add/remove watch on file or subtree)',
        parameters: ['%rdi: int fanotify_fd', '%rsi: unsigned int flags', '%rdx: uint64_t mask', '%r10: int dirfd', '%r8: const char *pathname'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, EBADF, EINVAL'
    }],
    [302, {
        number: 302,
        name: 'prlimit64',
        description: 'Get or set resource limits of a process (64-bit)',
        parameters: ['%rdi: pid_t pid', '%rsi: unsigned int resource', '%rdx: const struct rlimit *new_limit', '%r10: struct rlimit *old_limit'],
        returns: '0 on success, or -1 on error',
        errors: 'ESRCH, EFAULT, EINVAL'
    }],
    [303, {
        number: 303,
        name: 'name_to_handle_at',
        description: 'Obtain a handle to a filesystem object and mount id, relative to directory fd',
        parameters: ['%rdi: int dfd', '%rsi: const char *pathname', '%rdx: struct file_handle *handle', '%r10: int *mount_id', '%r8: int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, EINVAL'
    }],
    [304, {
        number: 304,
        name: 'open_by_handle_at',
        description: 'Open a file referred by a handle (obtained via name_to_handle_at)',
        parameters: ['%rdi: int mount_fd', '%rsi: struct file_handle *handle', '%rdx: int flags'],
        returns: 'File descriptor on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EPERM'
    }],
    [305, {
        number: 305,
        name: 'clock_adjtime',
        description: 'Adjust the kernel’s clock, with fine resolution',
        parameters: ['%rdi: clockid_t clock_id', '%rsi: struct timex *buf'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EPERM'
    }],
    [306, {
        number: 306,
        name: 'syncfs',
        description: 'Synchronize a filesystem (flush all dirty data to storage)',
        parameters: ['%rdi: int fd'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EIO'
    }],
    [307, {
        number: 307,
        name: 'sendmmsg',
        description: 'Send multiple messages on a socket using a vector of mmsghdr',
        parameters: ['%rdi: int fd', '%rsi: struct mmsghdr *msgvec', '%rdx: unsigned int vlen', '%r10: unsigned int flags'],
        returns: 'Number of messages sent on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EINTR'
    }],
    [308, {
        number: 308,
        name: 'setns',
        description: 'Reassociate thread with a namespace (mount, uts, etc.) via namespace fd',
        parameters: ['%rdi: int fd', '%rsi: int nstype'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EINVAL, EPERM'
    }],
    [309, {
        number: 309,
        name: 'getcpu',
        description: 'Get current CPU and NUMA node for the calling thread',
        parameters: ['%rdi: unsigned *cpu', '%rsi: unsigned *node', '%rdx: struct getcpu_cache *cache'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT'
    }],
    [310, {
        number: 310,
        name: 'process_vm_readv',
        description: 'Read from another process’s memory (vectorized) — for ptrace-like memory access',
        parameters: ['%rdi: pid_t pid', '%rsi: const struct iovec *local_iov', '%rdx: unsigned long liovcnt', '%r10: const struct iovec *remote_iov', '%r8: unsigned long riovcnt', '%r9: unsigned long flags'],
        returns: 'Number of bytes read, or -1 on error',
        errors: 'ESRCH, EFAULT, EINVAL'
    }],
    [311, {
        number: 311,
        name: 'process_vm_writev',
        description: 'Write to another process’s memory (vectorized) — for ptrace-like memory access',
        parameters: ['%rdi: pid_t pid', '%rsi: const struct iovec *local_iov', '%rdx: unsigned long liovcnt', '%r10: const struct iovec *remote_iov', '%r8: unsigned long riovcnt', '%r9: unsigned long flags'],
        returns: 'Number of bytes written, or -1 on error',
        errors: 'ESRCH, EFAULT, EINVAL'
    }],
    [312, {
        number: 312,
        name: 'kcmp',
        description: 'Compare two kernel objects (e.g., to detect if two FDs refer to same file, or two processes share same namespace, etc.)',
        parameters: ['%rdi: pid_t pid1', '%rsi: pid_t pid2', '%rdx: int type', '%r10: unsigned long idx1', '%r8: unsigned long idx2'],
        returns: '0 if identical, non-zero if different, or -1 on error',
        errors: 'EINVAL, EPERM'
    }],
    [313, {
        number: 313,
        name: 'finit_module',
        description: 'Load a kernel module into the running kernel, from a file descriptor, with optional parameters',
        parameters: ['%rdi: int fd', '%rsi: const char *uargs', '%rdx: int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT, EPERM'
    }],
    [314, {
        number: 314,
        name: 'sched_setattr',
        description: 'Set scheduling attributes (like SCHED_DEADLINE) on a thread / process',
        parameters: ['%rdi: pid_t pid', '%rsi: const struct sched_attr *attr', '%rdx: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'ESRCH, EFAULT, EINVAL, EPERM'
    }],
    [315, {
        number: 315,
        name: 'sched_getattr',
        description: 'Get scheduling attributes for a thread / process',
        parameters: ['%rdi: pid_t pid', '%rsi: struct sched_attr *attr', '%rdx: unsigned int size', '%r10: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'ESRCH, EFAULT, EINVAL'
    }],
    [316, {
        number: 316,
        name: 'renameat2',
        description: 'Rename or move files/directories with extended semantics (e.g. atomic rename, exchange, allow cross-rename flags)',
        parameters: ['%rdi: int olddfd', '%rsi: const char *oldname', '%rdx: int newdfd', '%r10: const char *newname', '%r8: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, EFAULT, ENOENT, EINVAL, EPERM, ENOTEMPTY'
    }],
    [317, {
        number: 317,
        name: 'seccomp',
        description: 'Operate on seccomp filters (enable / manage syscall filtering for the process)',
        parameters: ['%rdi: unsigned int op', '%rsi: unsigned int flags', '%rdx: const void *args'],
        returns: 'Result depends on operation (0 or filter id), or -1 on error',
        errors: 'EINVAL, EPERM, EFAULT'
    }],
    [318, {
        number: 318,
        name: 'getrandom',
        description: 'Obtain random bytes',
        parameters: ['%rdi: void *buf', '%rsi: size_t buflen', '%rdx: unsigned int flags'],
        returns: 'Number of bytes copied, or -1 on error',
        errors: 'EAGAIN (would block), EFAULT (bad address), EINTR (interrupted), EINVAL (invalid flags)'
    }],
    [315, {
        number: 315,
        name: 'sched_getattr',
        description: 'Get scheduling attributes of a thread',
        parameters: ['%rdi: pid_t pid', '%rsi: struct sched_attr *attr', '%rdx: unsigned int size', '%r10: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, ESRCH, E2BIG'
    }],
    [316, {
        number: 316,
        name: 'renameat2',
        description: 'Rename a file, with extended flags (e.g. RENAME_NOREPLACE, RENAME_EXCHANGE, etc.)',
        parameters: ['%rdi: int olddfd', '%rsi: const char *oldname', '%rdx: int newdfd', '%r10: const char *newname', '%r8: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'ENOENT, EEXIST, EINVAL, EXDEV, ...'
    }],
    [317, {
        number: 317,
        name: 'seccomp',
        description: 'Operate on Secure Computing (seccomp) state of the process',
        parameters: ['%rdi: unsigned int op', '%rsi: unsigned int flags', '%rdx: void *args'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EPERM'
    }],
    [318, {
        number: 318,
        name: 'getrandom',
        description: 'Obtain random bytes from the kernel RNG',
        parameters: ['%rdi: char *buf', '%rsi: size_t count', '%rdx: unsigned int flags'],
        returns: 'Number of bytes read, or -1 on error',
        errors: 'EINTR, EFAULT'
    }],
    [319, {
        number: 319,
        name: 'memfd_create',
        description: 'Create an anonymous file and return a file descriptor',
        parameters: ['%rdi: const char *uname_ptr', '%rsi: unsigned int flags'],
        returns: 'file descriptor on success, or -1 on error',
        errors: 'EINVAL, EFILESIZE, EPERM'
    }],
    [320, {
        number: 320,
        name: 'kexec_file_load',
        description: 'Load a new kernel from a file — reboot into it later (kexec)',
        parameters: ['%rdi: int kernel_fd', '%rsi: int initrd_fd', '%rdx: unsigned long cmdline_len', '%r10: const char *cmdline_ptr', '%r8: unsigned long flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT, EPERM'
    }],
    [321, {
        number: 321,
        name: 'bpf',
        description: 'Operate on BPF (Berkeley Packet Filter) subsystem — create, load, attach, etc.',
        parameters: ['%rdi: int cmd', '%rsi: union bpf_attr *attr', '%rdx: unsigned int size'],
        returns: 'depends on command (e.g. file descriptor, success code, or -1 on error)',
        errors: 'EINVAL, EPERM'
    }],
    [322, {
        number: 322,
        name: 'execveat',
        description: 'Execute a program, relative to a directory file descriptor (like execve but with dirfd)',
        parameters: ['%rdi: int dfd', '%rsi: const char *filename', '%rdx: const char *const *argv', '%r10: const char *const *envp', '%r8: int flags'],
        returns: 'On success, does not return; on error, -1 and errno set',
        errors: 'EACCES, ENOENT, ENOTDIR, EINVAL, ETXTBSY, ...'
    }],
    [323, {
        number: 323,
        name: 'userfaultfd',
        description: 'Create a file descriptor for handling page faults in user space (userfaultfd API)',
        parameters: ['%rdi: int flags'],
        returns: 'file descriptor on success, or -1 on error',
        errors: 'EINVAL, ENOMEM, ...'
    }],
    [324, {
        number: 324,
        name: 'membarrier',
        description: 'Issue a memory-barrier or control memory-ordering across threads/CPUs',
        parameters: ['%rdi: int cmd', '%rsi: unsigned int flags', '%rdx: int cpu_id'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EPERM'
    }],
    [325, {
        number: 325,
        name: 'mlock2',
        description: 'Lock part of the calling process’s virtual address space into RAM, with flags (e.g. MLOCK_ONFAULT)',
        parameters: ['%rdi: unsigned long start', '%rsi: size_t len', '%rdx: int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'ENOMEM, ENOMEM_LOCK, EINVAL'
    }],
    [326, {
        number: 326,
        name: 'copy_file_range',
        description: 'Copy data between file descriptors without user-space buffer (efficient kernel-space copy)',
        parameters: ['%rdi: int fd_in', '%rsi: loff_t *off_in', '%rdx: int fd_out', '%r10: loff_t *off_out', '%r8: size_t len', '%r9: unsigned int flags'],
        returns: 'Number of bytes copied, or -1 on error',
        errors: 'EINVAL, EBADF, ENOSYS, EXDEV, ...'
    }],
    [327, {
        number: 327,
        name: 'preadv2',
        description: 'Perform vectorized pread (read with position), with flags (like preadv but newer)',
        parameters: ['%rdi: unsigned long fd', '%rsi: const struct iovec *vec', '%rdx: unsigned long vlen', '%r10: unsigned long pos_l', '%r8: unsigned long pos_h', '%r9: rwf_t flags'],
        returns: 'Number of bytes read, or -1 on error',
        errors: 'EINVAL, EFAULT, EBADF'
    }],
    [328, {
        number: 328,
        name: 'pwritev2',
        description: 'Perform vectorized pwrite (write with position), with flags (like pwritev but newer)',
        parameters: ['%rdi: unsigned long fd', '%rsi: const struct iovec *vec', '%rdx: unsigned long vlen', '%r10: unsigned long pos_l', '%r8: unsigned long pos_h', '%r9: rwf_t flags'],
        returns: 'Number of bytes written, or -1 on error',
        errors: 'EINVAL, EFAULT, EBADF'
    }],
    [329, {
        number: 329,
        name: 'pkey_mprotect',
        description: 'Change protection of a memory range using a protection key (for MPK support)',
        parameters: ['%rdi: unsigned long start', '%rsi: size_t len', '%rdx: unsigned long prot', '%r10: int pkey'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, ENOMEM, ENOSYS'
    }],
    [330, {
        number: 330,
        name: 'pkey_alloc',
        description: 'Allocate a protection key for use with memory protection key APIs',
        parameters: ['%rdi: unsigned long flags', '%rsi: unsigned long init_val'],
        returns: 'Protection key on success, or -1 on error',
        errors: 'ENOMEM, EAGAIN'
    }],
    [331, {
        number: 331,
        name: 'pkey_free',
        description: 'Free a previously allocated protection key',
        parameters: ['%rdi: int pkey'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL'
    }],
    [332, {
        number: 332,
        name: 'statx',
        description: 'Get file status (extended), with more info (like file attributes, birthtime, flags, etc.)',
        parameters: ['%rdi: int dfd', '%rsi: const char *path', '%rdx: unsigned flags', '%r10: unsigned mask', '%r8: struct statx *buffer'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, ENOENT, EACCES, ...'
    }],
    // Note: syscall 333 (io_pgetevents) and beyond are more complex (e.g. variable args), and man7 may not have full page for all.
    // For completeness:
    [333, {
        number: 333,
        name: 'io_pgetevents',
        description: 'Get asynchronous I/O events (with optional timeout and signal mask) — newer libaio interface',
        parameters: ['%rdi: aio_context_t ctx_id', '%rsi: long min_nr', '%rdx: long nr', '%r10: struct io_event *events', '%r8: struct __kernel_timespec *timeout', '%r9: const sigset_t *sigmask'],
        returns: 'Number of events on success, or -1 on error',
        errors: 'EINVAL, EINTR, EFAULT, ...'
    }],
    [424, {
        number: 424,
        name: 'pidfd_send_signal',
        description: 'Send a signal to a process referred to by a pid file descriptor',
        parameters: ['%rdi: int pidfd', '%rsi: int sig', '%rdx: siginfo_t *info (or NULL)', '%r10: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'ESRCH, EINVAL, EPERM, etc.'
    }],
    [425, {
        number: 425,
        name: 'io_uring_setup',
        description: 'Setup a new io_uring instance — create submission & completion queues',
        parameters: ['%rdi: unsigned int entries', '%rsi: struct io_uring_params *p'],
        returns: 'file descriptor on success (>=0), or -1 on error',
        errors: 'EINVAL, ENOMEM, EFAULT'
    }],
    [426, {
        number: 426,
        name: 'io_uring_enter',
        description: 'Enter (submit and/or wait) on an io_uring instance',
        parameters: ['%rdi: unsigned int fd', '%rsi: u32 to_submit', '%rdx: u32 min_complete', '%r10: u32 flags', '%r8: const void *argp', '%r9: size_t argsz'],
        returns: 'number of completions on success, or -1 on error',
        errors: 'EINVAL, EFAULT, EINVAL, EINTR, etc.'
    }],
    [427, {
        number: 427,
        name: 'io_uring_register',
        description: 'Register or unregister various resources/options for an io_uring instance',
        parameters: ['%rdi: unsigned int fd', '%rsi: unsigned int op', '%rdx: void *arg', '%r10: unsigned int nr_args'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, ENOMEM, EFAULT, etc.'
    }],
    [428, {
        number: 428,
        name: 'open_tree',
        description: 'Open a directory tree (for mounting or inspection) without traversing symlinks at each component',
        parameters: ['%rdi: int dfd', '%rsi: const char *path', '%rdx: unsigned flags'],
        returns: 'file descriptor on success, or -1 on error',
        errors: 'ENOENT, EACCES, EINVAL, etc.'
    }],
    [429, {
        number: 429,
        name: 'move_mount',
        description: 'Atomically move a mount subtree (from one place to another)',
        parameters: ['%rdi: int from_dfd', '%rsi: const char *from_path', '%rdx: int to_dfd', '%r10: const char *to_path', '%r8: unsigned int ms_flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EXDEV, EINVAL, EBUSY, EPERM, etc.'
    }],
    [430, {
        number: 430,
        name: 'fsopen',
        description: 'Open a filesystem by name for configuration or mounting under the new fsconfig/fsmount API',
        parameters: ['%rdi: const char *fs_name', '%rsi: unsigned int flags'],
        returns: 'file descriptor on success, or -1 on error',
        errors: 'EINVAL, ENOENT, ENOMEM, EACCES, etc.'
    }],
    [431, {
        number: 431,
        name: 'fsconfig',
        description: 'Configure a filesystem context (opened with fsopen) with parameters/options before mounting',
        parameters: ['%rdi: int fs_fd', '%rsi: unsigned int cmd', '%rdx: const char *key', '%r10: const void *value', '%r8: int aux'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, ENOTSUP, EFAULT, etc.'
    }],
    [432, {
        number: 432,
        name: 'fsmount',
        description: 'Mount a filesystem context (opened & configured via fsopen/fsconfig) into the mount namespace',
        parameters: ['%rdi: int fs_fd', '%rsi: unsigned int flags', '%rdx: unsigned int attr_flags'],
        returns: 'file descriptor on success (mount handle), or -1 on error',
        errors: 'EINVAL, EACCES, ENOTSUP, etc.'
    }],
    [433, {
        number: 433,
        name: 'fspick',
        description: 'Pick a filesystem subtree (relative to a directory fd) for mounting — part of the fsopen/fsconfig/fsmount API',
        parameters: ['%rdi: int dfd', '%rsi: const char *path', '%rdx: unsigned int flags'],
        returns: 'file descriptor on success, or -1 on error',
        errors: 'ENOENT, EACCES, EINVAL, etc.'
    }],
    [434, {
        number: 434,
        name: 'pidfd_open',
        description: 'Obtain a file descriptor referring to a process (PID), for later signal sending or status retrieval',
        parameters: ['%rdi: pid_t pid', '%rsi: unsigned int flags'],
        returns: 'file descriptor on success, or -1 on error',
        errors: 'ESRCH, EINVAL, ENOMEM, etc.'
    }],
    [435, {
        number: 435,
        name: 'clone3',
        description: 'Create a new process (or thread) with extended options (clone_args) — replacement for clone / fork variants',
        parameters: ['%rdi: struct clone_args *uargs', '%rsi: size_t size'],
        returns: 'child pid (or thread id) in parent, 0 in child, or -1 on error',
        errors: 'EINVAL, EPERM, ENOMEM, EFAULT, etc.'
    }],
    [436, {
        number: 436,
        name: 'close_range',
        description: 'Close all file descriptors in a given range [fd, max_fd] (optionally preserving some via flags)',
        parameters: ['%rdi: unsigned int fd', '%rsi: unsigned int max_fd', '%rdx: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EBADF (for invalid range), EPERM, etc.'
    }],
    [437, {
        number: 437,
        name: 'openat2',
        description: 'Open a file relative to a directory FD, with extended open options (struct open_how) — safer/more flexible than openat',
        parameters: ['%rdi: int dfd', '%rsi: const char *filename', '%rdx: struct open_how *how', '%r10: size_t size'],
        returns: 'file descriptor on success, or -1 on error',
        errors: 'EACCES, ENOENT, EINVAL, EFAULT, etc.'
    }],
    [438, {
        number: 438,
        name: 'pidfd_getfd',
        description: 'Get a file descriptor (for a target process) — duplicate an fd in another process, given its pidfd',
        parameters: ['%rdi: int pidfd', '%rsi: int target_fd', '%rdx: unsigned int flags'],
        returns: 'new file descriptor on success, or -1 on error',
        errors: 'EBADF, ESRCH, EINVAL, EPERM, etc.'
    }],
    [439, {
        number: 439,
        name: 'faccessat2',
        description: 'Check a file’s accessibility (permissions) relative to a directory FD, with additional flags',
        parameters: ['%rdi: int dfd', '%rsi: const char *filename', '%rdx: int mode', '%r10: int flags'],
        returns: '0 on success (file is accessible), or -1 on error (errno indicates reason)',
        errors: 'EACCES, ENOENT, ENOTDIR, EINVAL, etc.'
    }],
    [440, {
        number: 440,
        name: 'process_madvise',
        description: 'Advise the kernel on memory usage behavior for ranges of another process (via pidfd) — hint for memory management',
        parameters: ['%rdi: int pidfd', '%rsi: const struct iovec *vec', '%rdx: size_t vlen', '%r10: int behavior', '%r8: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT, EINVAL, ESRCH, etc.'
    }],
    [441, {
        number: 441,
        name: 'epoll_pwait2',
        description: 'Wait for I/O/event readiness on an epoll instance, with signal mask and high-precision timeout',
        parameters: ['%rdi: int epfd', '%rsi: struct epoll_event *events', '%rdx: int maxevents', '%r10: const struct __kernel_timespec *timeout', '%r8: const sigset_t *sigmask', '%r9: size_t sigsetsize'],
        returns: 'number of events on success, or -1 on error',
        errors: 'EINVAL, EINTR, EFAULT, etc.'
    }],
    [442, {
        number: 442,
        name: 'mount_setattr',
        description: 'Set or change mount attributes (e.g. mount flags, mount options) of an existing mount point (via directory FD)',
        parameters: ['%rdi: int dfd', '%rsi: const char *path', '%rdx: unsigned int flags', '%r10: struct mount_attr *uattr', '%r8: size_t usize'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EACCES, ENOENT, EPERM, etc.'
    }],
    [443, {
        number: 443,
        name: 'quotactl_fd',
        description: 'Control disk quotas via a file descriptor rather than legacy mount-point path',
        parameters: ['%rdi: unsigned int fd', '%rsi: unsigned int cmd', '%rdx: qid_t id', '%r10: void *addr'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EBADF, EFAULT, EPERM, etc.'
    }],
    [444, {
        number: 444,
        name: 'landlock_create_ruleset',
        description: 'Create a new ruleset for the Landlock security module (user-space file descriptor representing the ruleset)',
        parameters: ['%rdi: const struct landlock_ruleset_attr *attr', '%rsi: size_t size', '%rdx: __u32 flags'],
        returns: 'file descriptor of ruleset on success, or -1 on error',
        errors: 'EINVAL, ENOMEM, EFAULT, EPERM'
    }],
    [445, {
        number: 445,
        name: 'landlock_add_rule',
        description: 'Add a security rule to a Landlock ruleset',
        parameters: ['%rdi: int ruleset_fd', '%rsi: enum landlock_rule_type rule_type', '%rdx: const void *rule_attr', '%r10: __u32 flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT, EPERM'
    }],
    [446, {
        number: 446,
        name: 'landlock_restrict_self',
        description: 'Apply a Landlock ruleset to the current thread/self — restrict access as per ruleset',
        parameters: ['%rdi: int ruleset_fd', '%rsi: __u32 flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EPERM'
    }],
    [447, {
        number: 447,
        name: 'memfd_secret',
        description: 'Create a “secret” file descriptor for memory, suitable for confidential memory storage (non-persistent, inaccessible to others)',
        parameters: ['%rdi: unsigned int flags'],
        returns: 'file descriptor on success, or -1 on error',
        errors: 'EINVAL, ENOMEM, ENOSYS (if not supported)'
    }],
    [448, {
        number: 448,
        name: 'process_mrelease',
        description: 'Release memory resources of a process referred by pidfd (memory reclaim hint)',
        parameters: ['%rdi: int pidfd', '%rsi: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, ESRCH, EPERM'
    }],
    [449, {
        number: 449,
        name: 'futex_waitv',
        description: 'Wait on multiple futexes (vectorized wait), optionally with timeout and flags',
        parameters: ['%rdi: struct futex_waitv *waiters', '%rsi: unsigned int nr_futexes', '%rdx: unsigned int flags', '%r10: struct __kernel_timespec *timeout', '%r8: clockid_t clockid'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EINTR'
    }],
    [450, {
        number: 450,
        name: 'set_mempolicy_home_node',
        description: 'Set memory policy such that newly allocated memory prefers a given “home node” — hint for NUMA allocation',
        parameters: ['%rdi: unsigned long start', '%rsi: unsigned long len', '%rdx: unsigned long home_node', '%r10: unsigned long flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EFAULT, ENOMEM'
    }],
    [451, {
        number: 451,
        name: 'cachestat',
        description: 'Get statistics about file or filesystem cache usage (via a file descriptor)',
        parameters: ['%rdi: unsigned int fd', '%rsi: struct cachestat_range *range', '%rdx: struct cachestat *cstat', '%r10: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EINVAL, EBADF, EFAULT'
    }],
    [452, {
        number: 452,
        name: 'fchmodat2',
        description: 'Change file mode (permissions) relative to a directory FD with added flags',
        parameters: ['%rdi: int dfd', '%rsi: const char *filename', '%rdx: umode_t mode', '%r10: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, ENOENT, EINVAL, EFAULT'
    }],
    [453, {
        number: 453,
        name: 'map_shadow_stack',
        description: 'Map a shadow stack (for kernel-assisted control-flow enforcement / security) for current thread/process',
        parameters: ['%rdi: unsigned long flags'],  // actual parameters may vary; shadow-stack interface is architecture/security-specific
        returns: 'pointer/address on success (or file descriptor / handle), or -1 on error',
        errors: 'EINVAL, ENOMEM, EPERM, etc.'
    }],
    [454, {
        number: 454,
        name: 'futex_wake',
        description: 'Wake one or more waiters on a futex (futex2-style syscall ABI — replaces FUTEX_WAKE_BITSET semantics).',
        parameters: ['%rdi: const int *uaddr', '%rsi: unsigned int nr_wake', '%rdx: unsigned long bitmask_or_val', '%r10: unsigned long flags'],
        returns: 'Number of waiters woken on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EPERM'
    }],
    [455, {
        number: 455,
        name: 'futex_wait',
        description: 'Wait on a futex (futex2-style) until waked or timed out / interrupted.',
        parameters: ['%rdi: const int *uaddr', '%rsi: int val', '%rdx: const struct __kernel_timespec *timeout (or NULL)', '%r10: unsigned long flags'],
        returns: '0 on success (woken), or -1 on error (errno indicates reason, e.g. ETIMEDOUT, EAGAIN, EINTR)',
        errors: 'EFAULT, EAGAIN, ETIMEDOUT, EINTR'
    }],
    [456, {
        number: 456,
        name: 'futex_requeue',
        description: 'Wake some waiters on one futex and move (requeue) additional waiters to another futex (vectorized requeue / futex2 ABI).',
        parameters: ['%rdi: const int *uaddr', '%rsi: unsigned int nr_wake', '%rdx: unsigned int nr_requeue', '%r10: const int *uaddr2', '%r8: unsigned long flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EPERM'
    }],
    [457, {
        number: 457,
        name: 'statmount',
        description: 'Return information about a mount (structure contains mount attributes / ids) — used to inspect mounts within a namespace.',
        parameters: ['%rdi: const struct mount_id_req *req', '%rsi: struct statmount *smbuf', '%rdx: size_t bufsize', '%r10: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EPERM (CAP_SYS_ADMIN), EFAULT, EINVAL'
    }],
    [458, {
        number: 458,
        name: 'listmount',
        description: 'List mount IDs (children) under a given mount id — used together with statmount to iterate mounts.',
        parameters: ['%rdi: const struct listmount_req *req', '%rsi: __u64 *ids', '%rdx: size_t size', '%r10: unsigned int flags'],
        returns: 'Number of mount IDs returned on success, or -1 on error',
        errors: 'EPERM (CAP_SYS_ADMIN), EFAULT, EINVAL'
    }],
    [459, {
        number: 459,
        name: 'lsm_get_self_attr',
        description: 'Query LSM (Linux Security Module) attributes for the current task/process (returns LSM-specific attributes previously exposed under /proc/self/attr).',
        parameters: ['%rdi: unsigned int attr', '%rsi: struct lsm_ctx __user *ctx', '%rdx: u32 __user *size', '%r10: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EPERM'
    }],
    [460, {
        number: 460,
        name: 'lsm_set_self_attr',
        description: 'Set LSM-specific attributes for the current task/process (counterpart to lsm_get_self_attr).',
        parameters: ['%rdi: unsigned int attr', '%rsi: const struct lsm_ctx __user *ctx', '%rdx: u32 size', '%r10: unsigned int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EFAULT, EINVAL, EPERM'
    }],
    [461, {
        number: 461,
        name: 'lsm_list_modules',
        description: 'List security modules and/or module-specific attributes (LSM-related querying helper).',
        parameters: ['%rdi: __u64 __user *ids', '%rsi: u32 __user *size', '%rdx: u32 flags'],
        returns: 'Number of entries written on success, or -1 on error',
        errors: 'EFAULT, EINVAL'
    }],
    [462, {
        number: 462,
        name: 'mseal',
        description: 'Apply memory sealing to a memfd (apply seals to memory file descriptors) — prevents certain modifications to the memfd.',
        parameters: ['%rdi: int fd', '%rsi: unsigned int seals'],
        returns: '0 on success, or -1 on error',
        errors: 'EBADF, EINVAL, EPERM'
    }],
    [463, {
        number: 463,
        name: 'setxattrat',
        description: 'Set an extended attribute on a path relative to a directory fd (new *at variant for xattr operations).',
        parameters: ['%rdi: int dfd', '%rsi: const char *path', '%rdx: const char *name', '%r10: const void *value', '%r8: size_t size', '%r9: int flags'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, ENOENT, EINVAL, EFAULT'
    }],
    [464, {
        number: 464,
        name: 'getxattrat',
        description: 'Get an extended attribute on a path relative to a directory fd (new *at variant).',
        parameters: ['%rdi: int dfd', '%rsi: const char *path', '%rdx: const char *name', '%r10: void *value', '%r8: size_t size', '%r9: int flags'],
        returns: 'Size of attribute on success (or number of bytes copied), or -1 on error',
        errors: 'EACCES, ENOENT, EFAULT'
    }],
    [465, {
        number: 465,
        name: 'listxattrat',
        description: 'List extended attribute names for a path relative to a directory fd (the *at variant).',
        parameters: ['%rdi: int dfd', '%rsi: const char *path', '%rdx: char *list', '%r10: size_t size', '%r8: unsigned int flags'],
        returns: 'Number of bytes placed in list on success, or -1 on error',
        errors: 'EACCES, ENOENT, EFAULT'
    }],
    [466, {
        number: 466,
        name: 'removexattrat',
        description: 'Remove an extended attribute from a path relative to a directory fd (the *at variant).',
        parameters: ['%rdi: int dfd', '%rsi: const char *path', '%rdx: unsigned int at_flags', '%r10: const char *name'],
        returns: '0 on success, or -1 on error',
        errors: 'EACCES, ENOENT, EFAULT'
    }],
    [467, {
        number: 467,
        name: 'open_tree_attr',
        description: 'Create/open an (detached) mount tree and set mount attributes atomically (newer fs namespace API; can be used with OPEN_TREE_CLONE to create detached tree with attributes).',
        parameters: ['%rdi: int dfd', '%rsi: const char *path', '%rdx: unsigned int flags', '%r10: struct mount_attr *uattr', '%r8: size_t usize'],
        returns: 'file descriptor (mount handle) on success, or -1 on error',
        errors: 'EINVAL, EACCES, ENOENT, EPERM'
    }],
]);