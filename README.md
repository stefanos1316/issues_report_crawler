# Crawler for Issues Report

This is the second task for my Postdoctoral interview where I am supposed to
develop a crawler to parse Apache Camel reports from Jira.
And I am very sure that Guoliang is more interested in this task rather than
the first one.
Therefore, I will try to offer a good quality of code.
But note that this tool will be in BASH :P

On second a thought, I think it might be easier in JavaScrit (NodeJS)
because it offers many modules to parse xml or even convert it to JSON.


# Installation

In the root directory execute:
	
	$ npm i

to install all NodeJS modules.
Note that I used the version 13.13.0


# Usage

Execute help for more info:

	$ node index.js [--help | -h]

For batch execution just add the issue numbers in the issues file
and execute the BASH script as:

	$ bash batchExecution

All the results are stored in files under the tmp directory
or at the given -o outputfilename


# Basic Idea

All the Jire issues for Apache CAMEL can be extracted as XML
and note JSON since we are not the administrators.
Therefore, we get the XML through the superagent module
and we use the xml2js to convert the XML to JSON.
The we print accordingly the modules.

# Important

Some of the info are rather hard to obtain (custome fields and values) since it
is unknow each time in which array position they will be.
To this end, info like estimated complexity, patch availability, and so on
might not be present in the current release.

# Author

Stefanos Georgiou
