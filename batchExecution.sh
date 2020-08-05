#!/bin/bash

[[ -d tmp ]] || mkdir -p tmp

while read fileLine; do
	node index -i $readLine -o issue_${readLine}.csv
done <issues

echo Done with all issues, please check files under the temp directory!

exit
