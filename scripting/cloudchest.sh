#!/bin/bash


if [ "$1" == "status" ]
then
    sh ./status.sh
elif [ "$1" == "signup" ]
then
    sh ./signup.sh
elif [ "$1" == "reboot" ]
then
    sh ./reboot.sh
elif [ "$1" == "start" ]
then
    sh ./start.sh
elif [ "$1" == "stop" ]
then
    sh ./stop.sh
else
    echo "Allowed parameters are : status, signup, reboot, start or stop"
fi

