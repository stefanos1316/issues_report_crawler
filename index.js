const xml2js = require('xml2js');
const { Command } = require('commander');
const program = new Command();
const request = require('superagent');
const xml2jsParser = require('superagent-xml2jsparser');
const fs = require('fs'); 

// Note that currently we are only going to extract XML and then convert it to JSON data
var link = "https://issues.apache.org/jira/si/jira.issueviews:issue-xml/";

program
  .option('-d, --debug', 'output extra debugging')
  .option('-o, --output', 'output CSV file')
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

                firstLine = 'Title, Type, Priority, Affected Version/s, Component/s, Labels,' 
                    + 'Status, Resolution, Assignee, Reporter, Created, Updated, Resolved,'
                    + 'Summary, Link, Votes, Description';
                for (var i = 0 ; i < element.comments[0].comment.length; ++i)
                    firstLine += ', Comment_' + (i + 1);

                secondLine = element.title[0] + ', ' + element.type[0]['']  + ', ' +  element.priority[0]['_']
                    + ', ' + element.version[0] + ', ' + element.component[0] + ', ' + element.labels[0].replace(/\r?\n|\r/g, " ")
                    + ', ' + element.status[0]['_'] + ', ' + element.resolution[0]['_'] + ', ' + element.assignee[0]['_']
                    + ', ' + element.reporter[0]['_'] + ', ' + element.created[0] + ', ' + element.updated[0]
                    + ', ' + element.resolved[0] + ', ' + element.summary[0] + ', ' + element.link[0] + ', ' + element.votes[0]
                    + ', ' + element.description[0].replace(/<[^>]*>?/gm, '').replace(/\r?\n|\r/g, " ").replace(/ +(?= )/g,'');
                for (var i = 0 ; i < element.comments[0].comment.length; ++i)
                    secondLine += ', ' + element.comments[0].comment[i]['_'].replace(/<[^>]*>?/gm, '').replace(/\r?\n|\r/g, " ").replace(/ +(?= )/g,'');

                if (program.ouput) {
                    try {
                        if (fs.existsSync(path)) {
                          //if file exists delete
                          fs.unlinkSync(path) 
                        }
                      } catch(err) {
                        console.error(err)
                      }
                    fs.appendFileSync(program.output, firstLine);
                    fs.appendFileSync(program.output, secondLine);
                } else {
                    try {
                        if (fs.existsSync('output.csv')) {
                          //if file exists delete
                          fs.unlinkSync('output.csv') 
                        }
                      } catch(err) {
                        console.error(err)
                      }
                    fs.appendFileSync('output.csv', firstLine);
                    fs.appendFileSync('output.csv', secondLine);
                }

                // console.log('Title: ' + element.title[0]);
                // console.log('Type: ' + element.type[0]['_']);
                // console.log('Priority: ' + element.priority[0]['_']);
                // console.log('Affected Version/s: ' + element.version[0]);
                // console.log('Component/s: ' + element.component[0]);
                // console.log('Labels: ' + element.labels[0].replace(/\r?\n|\r/g, " "));
                // console.log('Status: ' + element.status[0]['_']);
                // console.log('Resolution: ' + element.resolution[0]['_']);
                // console.log('Assignee: ' + element.assignee[0]['_']);
                // console.log('Reporter: ' + element.reporter[0]['_']);
                // console.log('Created: ' + element.created[0]);
                // console.log('Updated: ' + element.updated[0]);
                // console.log('Resolved: ' + element.resolved[0]);
                // console.log('Summary: ' + element.summary[0]);
                // console.log('Link: ' + element.link[0]);
                // console.log('Votes: ' + element.votes[0]);
                // // The railways below are removing HTML tags, tabs, double spaces, and new lines
                // console.log('Description: ' + element.description[0].replace(/<[^>]*>?/gm, '').replace(/\r?\n|\r/g, " ").replace(/ +(?= )/g,''));
                // for (var i = 0 ; i < element.comments[0].comment.length; ++i)
                //     console.log('Comment_' + (i + 1) + ': ' + element.comments[0].comment[i]['_'].replace(/<[^>]*>?/gm, '').replace(/\r?\n|\r/g, " ").replace(/ +(?= )/g,''));

            });      
    } catch (error) {
      console.log(error.response);
    }
  })();