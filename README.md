[![Build Status](https://travis-ci.org/Bart6114/scheduleR.svg?branch=master)](https://travis-ci.org/Bart6114/scheduleR)

# scheduleR

scheduleR serves as an easy web interface for scheduling (simple) R scripts up to generating full-fledged Rmarkdown reports. Logging, error/success notifications and mailing of reports is supported.

By providing easy access to the scheduling of R scripts and Rmarkdown files, scheduleR tries to make automated data analytics and reporting as easy as possible.

scheduleR's web interface is built using Node.js and tested under GNU/Linux and Windows.

![](http://i.imgur.com/fmlUpPr.png)

## Requirements

Minimal dependencies:

- [Node.js](http://nodejs.org/) (with npm)
- [R](http://www.r-project.org/)
- [mongodb](http://www.mongodb.org/)

Optional dependencies (necessary for generating Rmarkdown reports):

- [Pandoc](http://johnmacfarlane.net/pandoc/)
- [rmarkdown](https://github.com/rstudio/rmarkdown) (most recent version installed using devtools)
- [knitr](http://yihui.name/knitr/)

## Installation

First download the repository using the latest [tarball](https://api.github.com/repos/Bart6114/scheduleR/tarball/) / [zip file](https://github.com/Bart6114/scheduleR/archive/master.zip) and extract it or simply clone the repository:

    git clone https://github.com/Bart6114/scheduleR.git

Next, run the following command to install dependencies.

    npm install

To configure scheduleR go to the directory containing the installation and edit the ```user.config.json``` file to your likings:

- **uploadDir** path to upload your scripts to
- **RScriptExecutable** how to call the ```Rscript``` executable (best to simply put ```Rscript``` on the path)
- **RstandardArguments** standard arguments to add to ```Rscript``` (should be fine)
- **mailer.from** the from address to use in notification/report mails
- **mailer.options** settings for ```nodemailer``` to user
- **db.url** the address of the mongodb server
- **db.suffix** the name used to create a db on the mongodb server
- **port** the port to serve scheduleR on

## Running scheduleR

You can start scheduleR by running

    npm start

You can then point your browser at the configured port & server address (default is [http://localhost:3000](http://localhost:3000)).

## Scheduling tasks

The **list tasks** view gives an overview of all the scheduled tasks. One can choose a specific task to get a detailed overview on run times and logs. The edit mode is also available via the detailed view.

Using **new task** one can schedule a new script:

- **name** the name of the script
- **description** a description of the script
- **script file** upload the .R / .Rmd file
- **extra arguments** potential extra arguments to call the script with
- **enabled** should the task be enabled after saving
- **render with Rmarkdown** will default to ```true``` for ```.Rmd``` files
- **Rmd output path** where to copy the resulting report (optional)
- **Rmd mail message** a message for the body of the report mail
- **mail report to** addresses to the resulting report to (as attachment)
- **schedule** the desired schedule (see the [cron manual](http://unixhelp.ed.ac.uk/CGI/man-cgi?crontab+5)
- **on success** addresses to send _successful execution_ notification to
- **on error** addresses to send _unsuccesful execution_ notification to

In the ```examples``` directory you can find a few example scripts to test scheduleR's functionality with.

## Browser compatability

Up to now only tested on a recent Chrome browser.

## Issues, questions, feedback

Create a new issue at [scheduleR's GitHub site](https://github.com/Bart6114/scheduleR/issues) or leave me a message at bartsmeets86 <at> gmail.com.
