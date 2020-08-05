#!/bin/bash

[[ -d tmp ]] || mkdir -p tmp

while read fileLine; do
	node index -i $fileLine -o tmp/issue_${fileLine}.csv
done <issues

echo Done with all issues, please check files under the temp directory!

exit
