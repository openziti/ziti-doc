    #creates a new hosted service
    ziti edge controller create service ${svc_name} --hosted ${intercept_ip_dns} ${intercept_port} --host-ids ${comma separated identity list}

    #creates a non-hosted service
    ziti edge controller create service ${svc_name} "${destinationHost}" "${destinationPort}" \
    "${edgeRouter}" "tcp:${interceptHost/ip}:${intercept port}" -c "${cluster}"
