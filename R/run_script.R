# TODO: set exit value
args <- commandArgs(trailingOnly = TRUE)

script_to_run <- args[1]

args <- args[-1]
commandArgs <- function() args

setwd(
  dirname(script_to_run)
  )

tryCatch({
source(
  basename(script_to_run), echo=TRUE
  )},
error = function(e) quit(save = "no", status = 1))