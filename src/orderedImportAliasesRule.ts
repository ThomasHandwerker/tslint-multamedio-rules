/**
 * @license
 * Copyright 2016 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Lint from 'tslint';
import * as ts from 'typescript';

const OPTION_CASE_INSENSITIVE :string = 'case-insensitive';
const OPTION_LOWERCASE_FIRST :string = 'lowercase-first';
const OPTION_LOWERCASE_LAST :string = 'lowercase-last';

export class Rule extends Lint.Rules.AbstractRule {
  /* tslint:disable:object-literal-sort-keys */
  public static metadata :Lint.IRuleMetadata = {
    ruleName: 'ordered-import-aliases',
    description: 'Requires that import alias statements be alphabetized.',
    descriptionDetails: Lint.Utils.dedent`
      Enforce a consistent ordering of import aliases:
      - Named imports must be alphabetized (i.e. "import foo = de.foo.F;")
          - The exact ordering can be controled by the additional option for the rule.
      - Import sources must be alphabetized within groups, i.e.:
              import bar = de.bar.B;
              import Foo = de.foo.F;
      - Groups of imports are delineated by blank lines. You can use these to group imports
          however you like, e.g. by first- vs. third-party or thematically.`,
    optionsDescription: Lint.Utils.dedent`
      In order to control the ordered alphabetized TODO!!!`,
    options: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          OPTION_CASE_INSENSITIVE,
          OPTION_LOWERCASE_FIRST,
          OPTION_LOWERCASE_LAST
        ]
      },
      minLength: 0,
      maxLength: 2
    },
    optionExamples: [
      'true',
      '[true, "case-insensitive"]',
      '[true, "lowercase-first"]'
    ],
    type: 'style',
    typescriptOnly: true
  };
  /* tslint:enable:object-literal-sort-keys */

  public static IMPORT_ALIASES_UNORDERED :string =
  'Import aliases within a group must be alphabetized';

  public apply(sourceFile :ts.SourceFile) :Lint.RuleFailure[] {
    const orderedImportAliasesWalker :OrderedImportAliasesWalker =
      new OrderedImportAliasesWalker(sourceFile, this.getOptions());

    return this.applyWithWalker(orderedImportAliasesWalker);
  }
}

// convert aBcD --> aBcD
function flipCase(x :string) :string {
  return x.split('').map((char :string) => {
    if (char >= 'a' && char <= 'z') {
      return char.toUpperCase();
    } else if (char >= 'A' && char <= 'Z') {
      return char.toLowerCase();
    }

    return char;
  }).join('');
}

const TRANSFORMS :{ [ordering :string] :(x :string) => string } = {
  'case-insensitive': (x :string) => x.toLowerCase(),
  'lowercase-first': flipCase,
  'lowercase-last': (x :string) => x
};

class OrderedImportAliasesWalker extends Lint.RuleWalker {

  private optionSet :string = '';
  private lastImportAlias :string | null = null;
  private importAliasOrderTransform :(x :string) => string = () => '';

  constructor(sourceFile :ts.SourceFile, options :Lint.IOptions) {
    super(sourceFile, options);

    this.optionSet = this.getOptions()[0] || 'case-insensitive';
    this.importAliasOrderTransform = TRANSFORMS[this.optionSet];
  }

  // e.g. "import Foo = de.Foo.f;"
  public visitImportEqualsDeclaration(node :ts.ImportEqualsDeclaration) :void {
    const alias :string = this.importAliasOrderTransform(node.name.text);

    if (this.lastImportAlias && alias < this.lastImportAlias) {
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(),
        this.getParameterizedFailureText()));
    }

    this.lastImportAlias = alias;

    super.visitImportEqualsDeclaration(node);
  }

  /**
   * @see orderedImportsRule in core rule implementation of tslint
   * Check for a blank line, in which case we should reset the import ordering.
   */
  public visitNode(node :ts.Node) :void {
    const prefixLength :number = node.getStart() - node.getFullStart();
    const prefix :string = node.getFullText().slice(0, prefixLength);

    if (prefix.indexOf('\n\n') >= 0 ||
      prefix.indexOf('\r\n\r\n') >= 0) {
      this.lastImportAlias = null;
    }
    super.visitNode(node);
  }

  private getParameterizedFailureText() :string {
    return `${Rule.IMPORT_ALIASES_UNORDERED} (${this.optionSet}).`;
  }
}
