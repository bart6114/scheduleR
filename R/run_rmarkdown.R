library(rmarkdown)

args <- commandArgs(trailingOnly = TRUE)

script_to_run <- args[1]

args <- args[-1]
commandArgs <- function() args

setwd(
  dirname(script_to_run)
)

tryCatch({
    render(script_to_run)           
  },
  error = function(e){
    cat("\n\n\n")
    cat("========================\n")
    cat("An error was detected.\n");
    print(e)
    quit(save = "no", status = 1)
  })
