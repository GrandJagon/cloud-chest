#!/bin/bash


if [ -z $(pidof cloud-chest) ]
then
    echo "Cloud chest is not running, start to start it"
else
   echo "Rebooting cloud chest"
   sudo kill 9 $(pgrep cloud-chest)
   npm start &
fi
