    # ------------------- helpful variables you may need ----------------------
    
    #load the default cluster id into an environment variable
    cluster=$(ziti edge controller list clusters | tr -s ' ' | cut -d ' ' -f4)

    #load the first edge router id into an environment variable
    edgeRouter=$(ziti edge controller list gateways | cut -d ' ' -f2)

    # ------------------- actual creation of the service ----------------------

    #creates a new hosted service
    ziti edge controller create service ${svc_name} --hosted ${intercept_ip_dns} ${intercept_port} --host-ids ${comma separated identity list}

    #creates a non-hosted service
    ziti edge controller create service ${svc_name} "${destinationHost}" "${destinationPort}" \
    "${edgeRouter}" "tcp:${interceptHost/ip}:${intercept port}" -c "${cluster}"
