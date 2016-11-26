# Custom rules for TSLint
The linter for TypeScript give us the possibility to extend it's functionality with providing custom rule implementation. At __MULTA MEDIO AG__ for example, we decide to prefix our variable names with specific character depends on the current scope (e.g. function, class, etc.)

In order to lint this characteristic we extend the basic rule set of tslint with the appropiate custom rule.

At the moment this repository includes implementation for the following rules:
* `variableNamePrefixRule`

## Testing
Testing is done with the `ruleTestRunner.js` which is included in the core repository of tslint. In order to use the runner we have to do some small prerequisites.

### Prerequisites
1. Clone the official `tslint` repository from GitHub ([Link](https://github.com/palantir/tslint)).
2. Checkout version 3.15.1 with `git checkout 3.15.1`.
3. Create sym link `build` in tslint-multamedio-rules to `~/<your-workspace>/tslint/build`.
4. Run `npm install` and `npm run compile` to build custom rules.
5. Create sym link of each custom rule into sym link `build/src/rules` to allow ruleTestRunner.js loading the custom rules.

Finally, you can run the test command defined in `package.json` to verify the correctness of custom rule implementation:
 
```shell
$~ npm run test
```