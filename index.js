const xml2js = require('xml2js');
const { Command } = require('commander');
const program = new Command();
var convert = require('xml-js');
var request = require('superagent');
var xml2jsParser = require('superagent-xml2jsparser');

// Note that currently we are only going to extract XML and then convert it to JSON data
var link = "https://issues.apache.org/jira/si/jira.issueviews:issue-xml/";

program
  .option('-d, --debug', 'output extra debugging')
  .option('-i, --issue <number>', 'number of the Apache Camel issue (e.g., 10597)');

(async () => {
    try {
        await program.parse(process.argv);
        if (program.issue) {
            link = link + "CAMEL-" + program.issue + "/CAMEL-" + program.issue + ".xml";  
        }


        await request
            .get(link)
            .accept('xml')
            .parse(xml2jsParser) // add the parser function
            .end(function(err, res){
                var element = res.body.rss.channel[0].item[0];
                console.log('Type: ' + element.type[0]['_']);
                console.log('Priority: ' + element.priority[0]['_']);
                console.log('Affected Version/s: ' + element.version[0]['_']);
                console.log('Component/s: ' + element.component[0]['_']);
                console.log('Labels: ' + element.labels[0]['_']);
                console.log('Status: ' + element.status[0]['_']);
                console.log('Resolution: ' + element.resolution[0]['_']);
                console.log('Assignee: ' + element.assignee[0]['_']);
                console.log('Description: ' + element.description[0].replace(/<[^>]*>?/gm, '').replace(/\r?\n|\r/g, " ").replace(/ +(?= )/g,''));
                if (Object.keys(element.comments[0].comment).length > 1) {
                    var myJSON = JSON.stringify(element.comments[0].comment);
                    myJSON.forEach(function(element) {
                        console.log(element['0']['_']);
                      });
                } else {
                    console.log('Fix Version/s: ' + element.comments[0]['_']);
                }
            });      
    } catch (error) {
      console.log(error.response);
    }
  })();