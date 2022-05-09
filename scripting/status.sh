#!/bin/bash


if [ -z $(pidof cloud-chest) ]
then
    echo "Cloud chest is not running, 'start' to start it"
else
   echo "Cloud chest is up and running, 'stop' to stop it"
fi