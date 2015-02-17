require(shiny)
library(methods)

args <- commandArgs(trailingOnly = TRUE)

app_package_to_run <- args[1]
args <- args[-1]

p_number <- args[1]
args <- args[-1]

commandArgs <- function() args

temp_dir <- tempdir()
setwd( temp_dir )

tryCatch({
  unzip(app_package_to_run)
  shiny::runApp(launch.browser = FALSE,
                port = as.integer(p_number),
                host = "0.0.0.0")
  },
  error = function(e){
    cat("\n\n\n")
    cat("========================\n")
    cat("An error was detected.\n");
    print(e)
    quit(save = "no", status = 1)
  })
