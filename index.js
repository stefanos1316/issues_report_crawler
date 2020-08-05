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
                console.log('Title: ' + element.title[0]);
                console.log('Type: ' + element.type[0]['_']);
                console.log('Priority: ' + element.priority[0]['_']);
                console.log('Affected Version/s: ' + element.version[0]);
                console.log('Component/s: ' + element.component[0]['_']);
                console.log('Labels: ' + element.labels[0]['_']);
                console.log('Status: ' + element.status[0]['_']);
                console.log('Resolution: ' + element.resolution[0]['_']);
                console.log('Assignee: ' + element.assignee[0]['_']);
                console.log('Reporter: ' + element.reporter[0]['_']);
                console.log('Created: ' + element.created[0]);
                console.log('Updated: ' + element.updated[0]);
                console.log('Resolved: ' + element.resolved[0]);
                console.log('Summary: ' + element.summary[0]);
                console.log('Link: ' + element.link[0]);
                console.log('Votes: ' + element.votes[0]);
                // The railways below are removing HTML tags, tabs, double spaces, and new lines
                console.log('Description: ' + element.description[0].replace(/<[^>]*>?/gm, '').replace(/\r?\n|\r/g, " ").replace(/ +(?= )/g,''));
                for (var i = 0 ; i < element.comments[0].comment.length; ++i)
                    console.log('Comment_' + (i + 1) + ': ' + element.comments[0].comment[i]['_'].replace(/<[^>]*>?/gm, '').replace(/\r?\n|\r/g, " ").replace(/ +(?= )/g,''));

            });      
    } catch (error) {
      console.log(error.response);
    }
  })();