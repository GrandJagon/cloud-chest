#!/bin/bash


if [ -z $(pidof cloud-chest) ]
then
    echo "Starting cloud chest"
    npm start &
else
   echo "Cloud chest is already running, reboot tu reboot it"
fi