#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os, glob, pymongo, subprocess, time
from pymongo import MongoClient

PORT = 3000
IFACE = "wlp7s0"
IP_ADDRESS = "10.1.82.1" 
client = MongoClient('mongodb://localhost:27017/')
db = client.monje

def defaultFirewallRules():
	subprocess.call(["iptables", "-A", "FORWARD", "-i", IFACE, "-p", "tcp", "--dport", "53", "-j" ,"ACCEPT"])
	subprocess.call(["iptables", "-A", "FORWARD", "-i", IFACE, "-p", "udp", "--dport", "53", "-j" ,"ACCEPT"])
	subprocess.call(["iptables", "-A", "FORWARD", "-i", IFACE, "-p", "tcp", "--dport", str(PORT),"-d", IP_ADDRESS, "-j" ,"ACCEPT"])
	subprocess.call(["iptables", "-A", "FORWARD", "-i", IFACE, "-j" ,"DROP"])
	subprocess.call(["iptables", "-t", "nat", "-A", "PREROUTING", "-i", IFACE, "-p", "tcp", "-j" ,"DNAT", "--to-destination", IP_ADDRESS+":"+str(PORT)])
	subprocess.call(["iptables", "-t", "nat", "-A", "POSTROUTING", "-j", "MASQUERADE"])

defaultFirewallRules()

while True:
	time.sleep(3)
	coll = db.ctrlscripts.find()
	run  = coll[0]['status']

	if run == 'T':
		subprocess.call(["iptables", "-F"])
		subprocess.call(["iptables", "-t", "nat", "-F"])
		subprocess.call(['sudo','systemctl','stop','isc-dhcp-server.service'])
		for f in glob.glob('/var/lib/dhcp/dhcpd*'):
			os.remove(f)
			
		subprocess.call(['touch','/var/lib/dhcp/dhcpd.leases'])
		dhcpdReservFile = open('/etc/dhcp/dhcpd-reservations.conf', 'w') 

		coll = db.deviceips
		count = 0
		for dev in coll.find():
			ip = dev['ip'].encode("utf-8")
			mac = dev['mac'].encode("utf-8")
			count += 1
			subprocess.call(["iptables", "-t", "nat", "-I", "PREROUTING", "1", "-s", ip, "-m", "mac", "--mac-source", mac, "-j" ,"ACCEPT"])
			subprocess.call(["iptables", "-I", "FORWARD", "-s", ip, "-m", "mac", "--mac-source", mac, "-j" ,"ACCEPT"])
			dhcpdReservFile.write("host device_"+ str(count) +" { hardware ethernet "+ mac +"; fixed-address "+ ip +"; } \n")

		dhcpdReservFile.close()
		db.ctrlscripts.update({ },  {"$set": { "status": 'F' }});
		subprocess.call(['sudo','systemctl','start','isc-dhcp-server.service'])
		defaultFirewallRules()