#!/bin/sh
echo "Starting apps..."
rm log/alumno.log log/docente.log log/server.log
pm2 start apps.json
sleep 2
multitail -s 3 -i log/server.log -i log/alumno.log -i log/docente.log
