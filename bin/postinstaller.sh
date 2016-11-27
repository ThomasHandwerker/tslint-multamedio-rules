#!/bin/bash

# tslint-multamedio-rules postinstaller is necessary in order to create
# symlinks for custom tslint rules in tslint rules folder
# The installer check, if tslint is installed in project, else exit with 1

if ! [ -d "../tslint" ]
then
  echo "Peer dependency tslint is missing"
  exit 1
fi

echo "Prepare tslint-multamedio-rules for usage with tslint ..."

targetPath="../tslint/lib/rules"
sourcePath="./lib"

# add custom rule implementation files here
declare -a filesToLinkArray=(
  "orderedImportAliasesRule.js"
  "orderedImportAliasesRule.d.ts"
  "variableNamePrefixRule.js"
  "variableNamePrefixRule.d.ts"
)

for file in "${filesToLinkArray[@]}"
do

  if ! [ -h "$targetPath/$file" ]
  then
    echo "Create hard link via 'ln' command for file $file"
    ln -f "$(readlink -f $sourcePath/$file)" $targetPath/$file
  fi
done

echo "Links for custom rules are successfully created."
