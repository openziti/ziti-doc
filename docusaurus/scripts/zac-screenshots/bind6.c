// LD_PRELOAD shim for containers with IPv6 off on loopback (wslc has no --sysctl to turn it on).
// ziti-sdk-c binds its OIDC callback listener to [::1]:20314 only. When that bind fails, this retries on [::] with
// IPV6_V6ONLY off, which also accepts the browser's IPv4 connection to localhost:20314.
#define _GNU_SOURCE
#include <dlfcn.h>
#include <netinet/in.h>
#include <string.h>
#include <sys/socket.h>

int bind(int fd, const struct sockaddr *addr, socklen_t len) {
    static int (*real_bind)(int, const struct sockaddr *, socklen_t);
    if (!real_bind) real_bind = (int (*)(int, const struct sockaddr *, socklen_t)) dlsym(RTLD_NEXT, "bind");

    int rc = real_bind(fd, addr, len);
    if (rc == 0 || !addr || addr->sa_family != AF_INET6 || len < sizeof(struct sockaddr_in6)) return rc;

    struct sockaddr_in6 any;
    memcpy(&any, addr, sizeof(any));
    if (!IN6_IS_ADDR_LOOPBACK(&any.sin6_addr)) return rc;
    any.sin6_addr = in6addr_any;
    int off = 0;
    setsockopt(fd, IPPROTO_IPV6, IPV6_V6ONLY, &off, sizeof(off));
    return real_bind(fd, (const struct sockaddr *) &any, sizeof(any));
}
