#!/bin/bash

echo Create log files. 

[[ -d tmp ]] || mkdir -p tmp

while read fileLine; do
	node index -i $fileLine -o tmp/issue_${fileLine}.csv
done <<< $(curl -s https://issues.apache.org/jira/projects/CAMEL/issues/CAMEL-13590?filter=allopenissues \
	| grep -o -P '(?<=issueKeys).*(?=jiraHasIssues)' | sed 's/,/\n/g' | sed 's/\\"//g' | sed 's/CAMEL\-//g' \
	| sed 's/]//g' | sed 's/:\[//g' | sed '$d')

echo Done with all issues, please check files under the temp directory.

exit
