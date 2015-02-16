require(shiny)

args <- commandArgs(trailingOnly = TRUE)

app_package_to_run <- args[1]
args <- args[-1]

port <- args[1]
args <- args[-1]

commandArgs <- function() args

temp_dir <- tempdir()
setwd( temp_dir )

tryCatch({
  unzip(app_package_to_run)
  shiny::runApp(port = port)
  },
  error = function(e){
    cat("\n\n\n")
    cat("========================\n")
    cat("An error was detected.\n");
    print(e)
    quit(save = "no", status = 1)
  })
