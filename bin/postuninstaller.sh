#!/bin/bash

# this postuninstaller script for npm remove created symlinks in
# tslint package
echo "Clean up tslint-multamedio-rules ..."

targetPath="../tslint/lib/rules"

# add custom rule implementation files here
declare -a filesToRemoveArray=(
  "variableNamePrefixRule.js"
  "variableNamePrefixRule.d.ts"
)

for file in "${filesToRemoveArray[@]}"
do
  if [ -h "$targetPath/$file" ]
  then
    echo "Remove file $file"
    rm $targetPath/$file
  fi
done

echo "Clean up 'tslint-multamedio-rules' finished"