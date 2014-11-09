args <- commandArgs(trailingOnly = TRUE)

temp_dir <- args[1]
args <- args[-1]

script_to_run <- args[1]
args <- args[-1]

commandArgs <- function() args

setwd( temp_dir )

tryCatch({
  source( script_to_run, echo=TRUE )
  },
  error = function(e){
    cat("\n\n\n")
    cat("========================\n")
    cat("An error was detected.\n");
    print(e)
    quit(save = "no", status = 1)
  })
