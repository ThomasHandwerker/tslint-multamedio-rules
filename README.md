# Custom rules for TSLint
The linter for TypeScript give us the possibility to extend it's functionality with providing custom rule implementation. At __MULTA MEDIO AG__ for example, we decide to prefix our variable names with specific character depends on the current scope (e.g. function, class, etc.)

In order to lint this characteristic we extend the basic rule set of tslint with the appropiate custom rule.

At the moment this repository includes implementation for the following rules:
* `variableNamePrefixRule`
* `orderedImportAliasesRule`

## Compile
The custom tslint rules are implemented in TypeScript. It is necessary to compile them into JavaScript. This can be easily done via the command line script `npm run compile`. It compile source and test files. For compilation there are the following scripts defined in `package.json`:

* `compile`: Compiles source and test files
* `compile:core`: Compiles only source files
* `compile:test`: Compiles only test files

## Tests
After successfully compiling source and test files the implemented unit tests can be run. This verification can be easily done with the command

```shell
$~ npm tests
```

It runs all specified test cases in the subfolders of `test/` and run it with the TSLint test runner. Some helpful hints for testing custom rules is available in the official documentation of TSLint: [Testing Rules](https://palantir.github.io/tslint/develop/testing-rules/)

## Contribution
It is as simple as possible. Submit a new merge request on GitHub which contain your changes or improvements. We will check your submit and then merge it to the `master`-branch.

During implementation of your custom rule, it is very helpful to read the official docs first. There are advises on how to improve performance of rule implementation and other meaningful hints. [Official TSLint documentation on custom rules](https://palantir.github.io/tslint/develop/custom-rules/)