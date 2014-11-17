# scheduleR

scheduleR serves as an easy web interface for scheduling (simple) R scripts up to generating full-fledged Rmarkdown reports. Logging, error/success notifications and mailing of reports is supported.

By providing easy access to the scheduling of R scripts and Rmarkdown files, scheduleR tries to make automated data analytics and reporting as easy as possible.

scheduleR's web interface is built using Node.js and tested under GNU/Linux and Windows.

## Requirements

Minimal dependencies:

- [Node.js](http://nodejs.org/)
- [R](http://www.r-project.org/)
- [mongodb](http://www.mongodb.org/)

Optional dependencies (for generating Rmarkdown reports):

- [Pandoc](http://johnmacfarlane.net/pandoc/)
- [rmarkdown](https://github.com/rstudio/rmarkdown) (most recent version installed using devtools)

## Installation

First download the repository using the latest [tarball](), [zip file]() or simply clone the repository:

    git clone https://github.com/Bart6114/scheduleR.git

Edit the ```user.config.json``` file to your likings (see _configuration_ below) and continue to start scheduleR.

