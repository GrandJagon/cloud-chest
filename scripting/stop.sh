#!/bin/bash


if [ -z $(pidof cloud-chest) ]
then
    echo "Cloud chest is not running, start to start it"
else
   echo "Terminating cloud-chest"
   sudo kill 9 $(pgrep cloud-chest)
fi


