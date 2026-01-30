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
root@weather:~# journalctl -u network-connector | /opt/network-connector/analysis/latency.js

=== DAILY LATENCY (ms) ===

Period            │   N   │   p50 │   p95 │   p99 │    Min │    Max
──────────────────┼───────┼───────┼───────┼───────┼────────┼───────
Last 24h          │   287 │ 134.0 │ 186.0 │ 338.8 │   35.8 │  434.9
24-48h ago        │   287 │  47.1 │ 306.8 │ 322.3 │   35.7 │  371.3
48-72h ago        │   287 │  46.4 │ 307.2 │ 314.3 │   36.0 │ 1088.1
72-96h ago        │   287 │  45.9 │ 309.6 │ 358.0 │   35.1 │  963.2
96-120h ago       │   287 │  51.6 │ 306.5 │ 312.9 │   35.3 │  903.2
120-144h ago      │   287 │  45.3 │ 306.8 │ 313.7 │   35.6 │  766.0
144-168h ago      │   287 │  44.9 │ 306.5 │ 308.4 │   35.5 │  383.2
168-192h ago      │   287 │  45.1 │ 306.2 │ 307.3 │   35.2 │  310.5
192-216h ago      │   287 │  45.1 │ 355.5 │ 506.5 │   35.6 │ 1099.9
216-240h ago      │   287 │  44.4 │ 345.2 │ 347.2 │   36.1 │ 1106.1
240-264h ago      │   287 │  45.2 │ 306.4 │ 308.6 │   35.7 │  789.9
264-288h ago      │   287 │  45.4 │ 306.6 │ 309.1 │   34.7 │  444.9
288-312h ago      │   285 │  44.7 │ 313.3 │ 651.0 │   35.3 │ 1075.2
312-336h ago      │   287 │  44.0 │  64.2 │ 364.9 │   34.7 │  633.1
336-360h ago      │   287 │  45.7 │ 356.7 │ 388.3 │   35.5 │  615.9
360-384h ago      │   287 │  46.5 │ 355.9 │ 363.3 │   35.7 │  690.3
384-408h ago      │   216 │  38.5 │ 306.1 │ 353.3 │   34.8 │  422.3
432-456h ago      │    77 │  47.0 │ 248.1 │ 569.3 │   43.5 │ 1078.5
456-480h ago      │   287 │  45.2 │ 307.1 │ 309.3 │   36.6 │  437.3
480-504h ago      │   287 │  45.3 │ 307.0 │ 354.8 │   36.4 │ 1038.8
504-528h ago      │   288 │  45.8 │ 354.0 │ 382.0 │   35.6 │ 1112.5
528-552h ago      │    77 │  43.5 │  49.4 │ 107.0 │   35.8 │  235.5
──────────────────┼───────┼───────┼───────┼───────┼────────┼───────
OVERALL           │  5822 │  45.5 │ 308.1 │ 359.9 │   34.7 │ 1112.5

=== TIME OF DAY (ms) ===

Hour  │   N   │   p50 │   p95 │   p99 │    Min │    Max │ Histogram
──────┼───────┼───────┼───────┼───────┼────────┼────────┼──────────────────────────
00:00 │   238 │  38.4 │  45.4 │  54.9 │   34.7 │   68.5 │ ███
01:00 │   239 │  38.1 │  44.9 │  56.1 │   34.8 │   66.2 │ ███
02:00 │   239 │  38.3 │  45.0 │  58.0 │   35.6 │  251.4 │ ███
03:00 │   237 │  39.7 │  46.8 │  63.7 │   35.4 │  230.9 │ ███
04:00 │   239 │  38.4 │  43.5 │  47.1 │   35.3 │   69.0 │ ███
05:00 │   246 │  38.2 │  44.9 │  63.5 │   35.5 │  235.5 │ ███
06:00 │   251 │  38.2 │  45.4 │  47.0 │   34.7 │   63.1 │ ███
07:00 │   251 │  38.6 │  46.3 │  55.1 │   35.1 │  186.9 │ ███
08:00 │   252 │  44.2 │  47.7 │  91.1 │   35.9 │  135.1 │ ███
09:00 │   250 │  45.8 │  64.9 │ 136.1 │   36.3 │  252.9 │ ████
10:00 │   251 │  46.2 │ 154.3 │ 156.1 │   36.5 │  157.2 │ ███████████
11:00 │   249 │  46.9 │ 157.5 │ 225.6 │   43.2 │  615.9 │ ███████████
12:00 │   239 │  47.0 │ 158.1 │ 183.1 │   43.3 │  184.4 │ ███████████
13:00 │   239 │  46.8 │ 156.2 │ 184.6 │   43.1 │  336.6 │ ███████████
14:00 │   240 │  47.1 │ 181.6 │ 185.3 │   36.8 │  254.1 │ ████████████
15:00 │   240 │  47.0 │ 184.6 │ 189.6 │   36.1 │  338.5 │ █████████████
16:00 │   248 │  53.1 │ 240.5 │ 246.5 │   38.9 │  307.3 │ ████████████████
17:00 │   244 │ 184.4 │ 308.8 │ 944.7 │   43.8 │ 1106.1 │ █████████████████████
18:00 │   235 │ 305.5 │ 326.6 │ 610.0 │   43.8 │ 1078.5 │ ██████████████████████
19:00 │   240 │ 305.8 │ 359.8 │ 952.6 │   44.3 │ 1112.5 │ █████████████████████████
20:00 │   240 │ 306.9 │ 365.0 │ 832.9 │   38.8 │ 1038.8 │ █████████████████████████
21:00 │   239 │ 305.8 │ 361.7 │ 721.4 │   36.3 │  903.2 │ █████████████████████████
22:00 │   238 │  40.3 │ 307.5 │ 359.3 │   35.7 │  608.2 │ █████████████████████
23:00 │   238 │  38.4 │  46.7 │  53.9 │   35.5 │   91.2 │ ███
```
