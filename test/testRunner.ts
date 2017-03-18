import * as glob from 'glob';
import * as path from 'path';
import * as tslint from 'tslint';

const testDirectories :string[] = glob.sync('./test/rules/**/tslint.json').map(path.dirname);

for (const testDirectory of testDirectories) {
  const results :any = tslint.Test.runTest(testDirectory, './lib');
  const didAllTestsPass :any = tslint.Test.consoleTestResultHandler(results);
  if (!didAllTestsPass) {
      process.exit(1);
  }
}

process.exit(0);
