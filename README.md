```
root@weather:~# cat /etc/default/network-connector
cloudflare-check-period=3600
cloudflare-dns-name=weather-service
cloudflare-zone-id=0123456789abcdef01234567890abcde
cloudflare-token=0123456789abcdef0123456789abcdef01234567
upnp-check-period=300
upnp-service[1]=weather-sshd-inbound
upnp-port-external[1]=90
upnp-port-internal[1]=22
upnp-protocol[1]=tcp
upnp-service[2]=weather-http-inbound
upnp-port-external[2]=8080
upnp-port-internal[2]=443
upnp-protocol[2]=tcp
connectivity-check-period=300
connectivity-url=http://www.google.com
heartbeat-period=60
mqtt-server=mqtt://localhost
mqtt-client=connector
mqtt-topic-prefix=system/connection

root@weather:~# systemctl restart network-connector && mosquitto_sub -t system/connection/#
{ "timestamp": 1761738933, "hostname": "weather", "event": "startup", "success": true, "message": "daemon started" }
{ "timestamp": 1761738936, "hostname": "weather", "event": "cloudflare", "success": true, "message": "IP valid at 12.34.56.78" }
{ "timestamp": 1761738938, "hostname": "weather", "event": "upnp", "success": true, "message": "2\/2 succeeded - [1]: 'weather-sshd-inbound' exists 192.168.0.44:22->12.34.56.78:90 tcp, [2]: 'weather-http-inbound' exists 192.168.0.44:443->12.34.56.78:8080 tcp" }
{ "timestamp": 1761738938, "hostname": "weather", "event": "connectivity", "success": true, "message": "connection to 'http:\/\/www.google.com' succeeded (HTTP 200, 151.497ms, 677 bytes)" }
{ "timestamp": 1761738999, "hostname": "weather", "event": "heartbeat", "success": true, "message": "daemon active (1)", "cloudflare_enabled": true, "upnp_enabled": true, "upnp_mappings": 2 }

root@workshop:~# journalctl -u network-connector | tail -25
Oct 29 12:39:26 weather network-connector[272]: connectivity: connection to 'http://www.google.com' succeeded (HTTP 200, 178.697ms, 677 bytes)
Oct 29 12:44:26 weather network-connector[272]: upnp: 2/2 succeeded - [1]: 'weather-sshd-inbound' exists 192.168.0.44:22->12.34.56.78:90 tcp, [2]: 'weather-http-inbound' exists 192.168.0.44:443->12.34.56.78:8080 tcp
Oct 29 12:44:27 weather network-connector[272]: connectivity: connection to 'http://www.google.com' succeeded (HTTP 200, 166.335ms, 677 bytes)
Oct 29 12:49:27 weather network-connector[272]: upnp: 2/2 succeeded - [1]: 'weather-sshd-inbound' exists 192.168.0.44:22->12.34.56.78:90 tcp, [2]: 'weather-http-inbound' exists 192.168.0.44:443->12.34.56.78:8080 tcp
Oct 29 12:49:28 weather network-connector[272]: connectivity: connection to 'http://www.google.com' succeeded (HTTP 200, 308.210ms, 677 bytes)
Oct 29 12:54:28 weather network-connector[272]: upnp: 2/2 succeeded - [1]: 'weather-sshd-inbound' exists 192.168.0.44:22->12.34.56.78:90 tcp, [2]: 'weather-http-inbound' exists 192.168.0.44:443->12.34.56.78:8080 tcp
Oct 29 12:54:29 weather network-connector[272]: connectivity: connection to 'http://www.google.com' succeeded (HTTP 200, 275.930ms, 677 bytes)
Oct 29 12:55:32 weather network-connector[272]: shutdown: daemon stopped
Oct 29 12:55:32 weather systemd[1]: Stopping network-connector.service - Network Connector...
Oct 29 12:55:33 weather systemd[1]: network-connector.service: Deactivated successfully.
Oct 29 12:55:33 weather systemd[1]: Stopped network-connector.service - Network Connector.
Oct 29 12:55:33 weather systemd[1]: network-connector.service: Consumed 37.631s CPU time.
Oct 29 12:55:33 weather systemd[1]: Started network-connector.service - Network Connector.
Oct 29 12:55:33 weather network-connector[29214]: config: file='/etc/default/network-connector', cloudflare-check-period='3600', cloudflare-dns-name='weather-service', cloudflare-zone-id='0123456789abcdef01234567890abcde', cloudflare-token='0123456789abcdef0123456789abcdef01234567', upnp-check-period='300', connectivity-check-period='300', connectivity-url='http://www.google.com', heartbeat-period='60', mqtt-server='mqtt://localhost', mqtt-client='connector', mqtt-topic-prefix='system/connection'
Oct 29 12:55:33 weather network-connector[29214]: cloudflare: 'weather-service' (3600, verbose)
Oct 29 12:55:33 weather network-connector[29214]: upnp: [1] 'weather-sshd-inbound' 22->90 tcp (300, verbose)
Oct 29 12:55:33 weather network-connector[29214]: upnp: [2] 'weather-http-inbound' 443->8080 tcp (300, verbose)
Oct 29 12:55:33 weather network-connector[29214]: connectivity: 'http://www.google.com' (300, verbose)
Oct 29 12:55:33 weather network-connector[29214]: heartbeat: (60, quiet)
Oct 29 12:55:33 weather network-connector[29214]: mqtt: connecting (host='localhost', port=1883, ssl=false, client='connector')
Oct 29 12:55:33 weather network-connector[29214]: mqtt: connected
Oct 29 12:55:33 weather network-connector[29214]: startup: daemon started
Oct 29 12:55:36 weather network-connector[29214]: cloudflare: IP valid at 12.34.56.78
Oct 29 12:55:38 weather network-connector[29214]: upnp: 2/2 succeeded - [1]: 'weather-sshd-inbound' exists 192.168.0.44:22->12.34.56.78:90 tcp, [2]: 'weather-http-inbound' exists 192.168.0.44:443->12.34.56.78:8080 tcp
Oct 29 12:55:38 weather network-connector[29214]: connectivity: connection to 'http://www.google.com' succeeded (HTTP 200, 151.497ms, 677 bytes)

root@weather:~# upnpc -l
upnpc : miniupnpc library test client, version 2.2.4.
...
Found valid IGD : http://192.168.0.1:49153/upnp/control/WANIPConn1
Local LAN ip address : 192.168.0.44
Connection Type : IP_Routed
...
ExternalIPAddress = 12.34.56.78
 i protocol exPort->inAddr:inPort description remoteHost leaseTime
...
11 TCP    90->192.168.0.44:22    'weather-sshd-inbound' '' 0
12 TCP  8080->192.168.0.44:443   'weather-http-inbound' '' 0
```
