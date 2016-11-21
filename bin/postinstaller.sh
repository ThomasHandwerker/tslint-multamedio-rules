#!/bin/sh
ln -s "$(readlink -f ./lib/variableNamePrefixRule.js)" ../tslint/lib/rules/variableNamePrefixRule.js
ln -s "$(readlink -f ./lib/variableNamePrefixRule.d.ts)" ../tslint/lib/rules/variableNamePrefixRule.d.ts
