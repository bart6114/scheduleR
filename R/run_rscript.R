args <- commandArgs(trailingOnly = TRUE)

script_to_run <- args[1]

args <- args[-1]
commandArgs <- function() args

setwd(
  dirname(script_to_run)
)

print(44)

tryCatch({
  source(
    basename(script_to_run), echo=TRUE
  )},
  error = function(e){
    cat("\n\n\n")
    cat("========================\n")
    cat("An error was detected.\n");
    print(e)
    quit(save = "no", status = 1)
  })