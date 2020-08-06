const { Command } = require('commander');
const program = new Command();
const request = require('superagent');
const xml2jsParser = require('superagent-xml2jsparser');
const fs = require('fs');
const winston = require('winston');


// Creating our logger object 
const logger = winston.createLogger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  });

logger.log({
    level: 'info',
    message: 'Reporting only missing fields from the CAMEL issues.'
  });

// Note that currently we are only going to extract XML and then convert it to JSON data
var link = "https://issues.apache.org/jira/si/jira.issueviews:issue-xml/";

program
  .option('-o, --output <fileName>', 'output CSV file')
  .option('-i, --issue <number>', 'number of the Apache Camel issue (e.g., 10597)');


async function getElementNames(element) {
    var returnString = '';
    for (var i = 0 ; i < element.comments[0].comment.length; ++i)
        returnString += ', Comment_' + (i + 1);
    
    return returnString;
} 


async function getElementValues(element) {
    var returnString = '';
    for (var i = 0 ; i < element.comments[0].comment.length; ++i)
        returnString += ', ' + element.comments[0].comment[i]['_']
            .replace(/<[^>]*>?/gm, '')
            .replace(/\r?\n|\r/g, " ")
            .replace(/ +(?= )/g,'');
    
    return returnString;
}


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
            .end(async function(err, res){
                var element = res.body.rss.channel[0].item[0];

                firstLine = 'Title, Type, Priority, Component/s, Labels,' 
                    + 'Status, Resolution, Assignee, Reporter, Created, Updated,'
                    + 'Summary, Link, Votes, Description';
                
                // Check if any of the following elements are missing
                'version' in element ? firstLine += ', Affected Version/s'
                    : logger.info('[CAMEL-' + program.issue + "] affected version/s obj key is missing.");
                'resolved' in element ? firstLine += ', Resolved'
                    : logger.info('[CAMEL-' + program.issue + "] resolved obj key is missing.");
                'comments' in element ? firstLine += await getElementNames(element)
                    : logger.info('[CAMEL-' + program.issue + "] comments obj keys are missing.");

                secondLine = element.title[0] + ', ' + element.type[0]['_']  + ', ' +  element.priority[0]['_']
                    + ', ' + element.component[0] + ', ' + element.labels[0].replace(/\r?\n|\r/g, " ")
                    + ', ' + element.status[0]['_'] + ', ' + element.resolution[0]['_'] + ', ' + element.assignee[0]['_']
                    + ', ' + element.reporter[0]['_'] + ', ' + element.created[0] + ', ' + element.updated[0]
                    + ', ' + element.summary[0] + ', ' + element.link[0] + ', ' + element.votes[0]
                    + ', ' + element.description[0]
                        .replace(/<[^>]*>?/gm, '')
                        .replace(/\r?\n|\r/g, " ")
                        .replace(/ +(?= )/g,'');

                // Check if the any of the following elements are missing are log
                'version' in element ? secondLine += ', ' + element.version[0]
                    : logger.info('[CAMEL-' + program.issue + "] affected version/s obj value is missing.");
                'resolved' in element ? secondLine += ', ' + element.resolved[0]
                    : logger.info('[CAMEL-' + program.issue + "] resolved obj value is missing.");
                'comments' in element ? secondLine += await  getElementValues(element)
                    : logger.info('[CAMEL-' + program.issue + "] comments obj values are missing.")

                // Write to defined file if was option given
                if (program.output) {
                    try {
                        if (fs.existsSync(program.output)) {
                          //if file exists delete
                          fs.unlinkSync(program.output);
                        }
                      } catch(err) {
                        console.error(err);
                      }
                    fs.appendFileSync(program.output, firstLine);
                    fs.appendFileSync(program.output, '\n');
                    fs.appendFileSync(program.output, secondLine);
                } else {
                    try {
                        if (fs.existsSync('output.csv')) {
                          // If file exists delete
                          fs.unlinkSync('output.csv');
                        }
                      } catch(err) {
                        console.error(err);
                      }
                    fs.appendFileSync('output.csv', firstLine);
                    fs.appendFileSync('output.csv', '\n');
                    fs.appendFileSync('output.csv', secondLine);
                }
            });      
    } catch (error) {
      console.log(error.response);
    }
  })();