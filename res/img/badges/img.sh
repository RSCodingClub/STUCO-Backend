#!/bin/bash 
COUNTER=1
while [  $COUNTER -lt 50 ]; do
	# cp [$COUNTER - 1].png $COUNTER.png 
	NEWNAME=$(($COUNTER+1))
	echo The counter is $COUNTER new name is $NEWNAME
	cp -a "$COUNTER.png" "$NEWNAME.png" 
	(( COUNTER += 1 ))
done

read -t10 -n1 -r -p 'Press any key in the next five seconds...' key