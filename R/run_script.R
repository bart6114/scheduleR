# TODO: set exit value
args <- commandArgs(trailingOnly = TRUE)

script_to_run <- args[1]

args <- args[-1]
commandArgs <- function() args

setwd(
  dirname(script_to_run)
  )


source(
  basename(script_to_run), echo=TRUE
  )