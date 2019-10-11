The proxy intercept mode creates a network listener for each Ziti service that is
intercepted. The services to intercept, and the ports that they are intercepted on,
are specified on the command line (as opposed to using the service definitions that
are retrieved from the edge controller):

    $ ziti-tunnel --identity ziti.json proxy wttr.in:8443 ssh-local:2222 netcat:22169
    [   0.004]    INFO ziti/tunnel/intercept/proxy.(*proxyInterceptor).Start: starting proxy interceptor
    [   0.120]    INFO ziti/tunnel/intercept.updateServices: starting tunnel for newly available service ssh-local
    [   0.183]    INFO ziti/tunnel/intercept.updateServices: service ssh-local not hostable
    [   0.183]    INFO ziti/tunnel/intercept.updateServices: starting tunnel for newly available service netcat
    [   0.183]    INFO ziti/tunnel/intercept/proxy.proxyInterceptor.runServiceListener: {addr=[0.0.0.0:2222] service=[ssh-local]} service is listening
    [   0.203]    INFO ziti/tunnel/intercept.updateServices: service netcat not hostable
    [   0.203]    INFO ziti/tunnel/intercept/proxy.proxyInterceptor.runServiceListener: {addr=[0.0.0.0:22169] service=[netcat]} service is listening
    [   0.203]    INFO ziti/tunnel/intercept.updateServices: starting tunnel for newly available service wttr.in
    [   0.226]    INFO ziti/tunnel/intercept.updateServices: service wttr.in not hostable
    [   0.226]    INFO ziti/tunnel/intercept/proxy.proxyInterceptor.runServiceListener: {addr=[0.0.0.0:8443] service=[wttr.in]} service is listening

All network listeners bind to local network interfaces (0.0.0.0):

    $ netstat -tnl | fgrep 0.0.0.0
    Active Internet connections (only servers)
    Proto Recv-Q Send-Q Local Address           Foreign Address         State      
    tcp        0      0 0.0.0.0:2222            0.0.0.0:*               LISTEN     
    tcp        0      0 0.0.0.0:22169           0.0.0.0:*               LISTEN     
    tcp        0      0 0.0.0.0:8443            0.0.0.0:*               LISTEN     

Proxy mode is intended to be a developer tool, most useful in situations where root
privileges are not available.