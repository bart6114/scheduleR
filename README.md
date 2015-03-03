[![Build Status](https://travis-ci.org/Bart6114/scheduleR.svg?branch=master)](https://travis-ci.org/Bart6114/scheduleR)

# scheduleR

__scheduleR__ is a framework that can be used to deploy R tasks, reports and apps. 

* __Tasks__ are 'regular' R scripts that you want to schedule to be  executed on a regular basis (often ETL related scripts).
* __Reports__ are Rmarkdown (.Rmd) reports that can be converted to a PDF or HTML. See [rmarkdown](https://github.com/rstudio/rmarkdown) for more info.
* __Apps__ are [Shiny](http://shiny.rstudio.com/) apps, support for these in scheduleR is experimental.

An easy web interface for scheduling is provided for adding tasks, maintenance and viewing logs. __scheduleR__ provides extensive logging support and  error/success notifications.

__scheduleR__ is built to be used on a server. It can be used locally but that mean that you have to keep a mongodb server and scheduleR running at all times.

![](http://i.imgur.com/mh1Yeyw.png)

## Requirements

Minimal dependencies:

- [Node.js](http://nodejs.org/) (with npm)
- [R](http://www.r-project.org/)
- [mongodb](http://www.mongodb.org/)

Optional dependencies (necessary for generating Rmarkdown reports):

- [Pandoc](http://johnmacfarlane.net/pandoc/) (> v1.13.0)
- [rmarkdown](https://github.com/rstudio/rmarkdown) (most recent version installed using devtools)
- [knitr](http://yihui.name/knitr/)

__scheduleR__'s web interface is built using Node.js and tested under GNU/Linux and Windows. Feedback on Mac compatibility is appreciated.


## Installation

Make sure you have access to a running [MongoDB](http://www.mongodb.org/) server. You can set one up locally or use a service such as [mongolab](https://mongolab.com/) for testing.

First download the repository using the latest [tarball](https://api.github.com/repos/Bart6114/scheduleR/tarball/) / [zip file](https://github.com/Bart6114/scheduleR/archive/master.zip) and extract it or simply clone the repository. Cloning the repository is advised as this makes updating __scheduleR__ a piece of cake.

    git clone https://github.com/Bart6114/scheduleR.git

Next, run the following command to install dependencies (might require admin rights).

    npm install
    
#### Known issues

If when using ```npm install``` you get an error like ```Error: ENOENT ...``` try updating npm to the latest version: ```npm update -g npm``` (might require admin rights).

## Configuration

To configure scheduleR go to the directory containing the installation and edit the ```user.config.json``` file to your likings:

- **uploadDir** path to upload your scripts to (is essential!)
- **RScriptExecutable** how to call the ```Rscript``` executable (best to simply put ```Rscript``` on the path)
- **RstandardArguments** standard arguments to add to ```Rscript``` (should be fine as is)
- **errorNotificationMailAddresses** (array of) email addresses that will be added to the recipients of __error__ notification mails
- **mailer.from** the from address to use in notification/report mails
- **mailer.options** settings for ```nodemailer``` to user
- **db.url** the address of the mongodb server
- **db.suffix** the name used to create a db on the mongodb server
- **port** the port to serve scheduleR on

## Running scheduleR

You can start __scheduleR__ by simply running in the directory where it was downloaded.

    npm start

You can then point your browser at the configured port & server address (default is [http://localhost:3000](http://localhost:3000)).

## User management

At the first start of scheduleR an initial signup option is available. After the initial signup new users can be invited (an account will be created for them). An invite email will be send to them with their username and initial password. If something goes wrong in sending this email (e.g. when you don't have access to a mail server) the new user's username and initial password are shown in the server-side console.

## Tasks

The **list tasks** view gives an overview of all the scheduled tasks. One can choose a specific task to get a detailed overview on run times and logs. The edit mode is also available via the detailed view.

![](http://i.imgur.com/wv4ORgx.png)

Using **new task** one can schedule a new script:

- **name** the name of the task
- **description** a description of the task
- **script file** upload the .R file
- **extra arguments** potential extra arguments to call the script with
- **enabled** should the task be enabled after saving
- **mail report to** addresses to the resulting report to (as attachment) - make sure to press enter after each address
- **schedule** the desired schedule (see the [cron manual](http://unixhelp.ed.ac.uk/CGI/man-cgi?crontab+5)
- **on success** addresses to send _successful execution_ notification to - make sure to press enter after each address
- **on error** addresses to send _unsuccesful execution_ notification to - make sure to press enter after each address

## Reports

The **list reports** view gives an overview of all the scheduled reports. One can choose a specific report to get a detailed overview on run times and logs. The edit mode is also available via the detailed view.

Markdown reports (pdf / html) can be copied to a specified path (either on the server on one that is available on the network) or be sent by mail to a number of recipients.

Using **new report** one can schedule a new report:

- **name** the name of the report
- **description** a description of the script
- **script file** upload the .Rmd file
- **extra arguments** potential extra arguments to call the script with
- **enabled** should the task be enabled after saving
- **Rmd output path** where to copy the resulting report (optional)
- **Rmd mail message** a message for the body of the report mail (optional)
- **mail report to** addresses to the resulting report to (as attachment) - make sure to press enter after each address
- **schedule** the desired schedule (see the [cron manual](http://unixhelp.ed.ac.uk/CGI/man-cgi?crontab+5))
- **on success** addresses to send _successful execution_ notification to - make sure to press enter after each address
- **on error** addresses to send _unsuccesful execution_ notification to - make sure to press enter after each address

## Shiny app

__Beware, shiny app support is very experimental.__

When adding new app, the following input fields are available:

- **name** the name of the app
- **description** a description of the app
- **script file** the script file should be a zipped (.zip) file with at is root the required file to call ```shiny::runApp()``` on (e.g. ```server.r``` and ```ui.r```).
- **URL suffix** the URL to access the app by, if the suffix is for example ```test-app``` you can access the app by using http://address-to-scheduleR/app/test-app.

See an example below:

<a href="http://webmshare.com/o89eg" ><img src="http://s1.webmshare.com/t/o89eg.jpg" title="Hosted by webmshare.com" /></a>

## Test scripts

In the ```examples``` directory you can find a few example scripts to test scheduleR's functionality with.

## Browser compatibility

Up to now only tested on a recent Chrome browser. Testing on different browsers is appreciated.

## Issues, questions, feedback

For support and bug reports create a new issue at [scheduleR's GitHub site](https://github.com/Bart6114/scheduleR/issues).

Bug fixes are very welcome.


## Changes

### v.0.0.13

- fixed bug that didn't correctly show report status in list view
- correct link to reports from 'enabled reports' button
- added list of mail-to addresses to detailed report view

### v.0.0.12

- Added __experimental__ support for Shiny apps
- Separated R _tasks_ from R markdown _reports_
- A lot of refactoring

### v.0.0.11

- Added (limited) pagination to logs in detailed task view in order to improve performance
- Improved file renaming method
- Functionality to add timestamps to the filename of generated Rmd reports

### v0.0.10

- Small optimizations to retrieving big log lists

### v0.0.9

- Inviting users depended on the ability to send emails (hence have access to a mail server). Quick fix: if there is an error in sending the account details to the user the username and __initial__ password will be printed on the server-side console.

### v0.0.8

- The filenames of Rmarkdown reports are renamed back to the original filename (instead of the randomly generated upload filename)

### v0.0.7

- Added a "notificationMailAddresses" variable to user.config.json, email addresses specified here will be added to the recipients of all notification mails

### v0.0.6

- Added a "run once" button to test scheduled tasks
- Added status (success / error) to notification mails
