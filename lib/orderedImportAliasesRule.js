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
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Lint = require("tslint");
var OPTION_CASE_INSENSITIVE = 'case-insensitive';
var OPTION_LOWERCASE_FIRST = 'lowercase-first';
var OPTION_LOWERCASE_LAST = 'lowercase-last';
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        var orderedImportAliasesWalker = new OrderedImportAliasesWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(orderedImportAliasesWalker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
/* tslint:disable:object-literal-sort-keys */
Rule.metadata = {
    ruleName: 'ordered-import-aliases',
    description: 'Requires that import alias statements be alphabetized.',
    descriptionDetails: (_a = ["\n      Enforce a consistent ordering of import aliases:\n      - Named imports must be alphabetized (i.e. \"import foo = de.foo.F;\")\n          - The exact ordering can be controled by the additional option for the rule.\n      - Import sources must be alphabetized within groups, i.e.:\n              import bar = de.bar.B;\n              import Foo = de.foo.F;\n      - Groups of imports are delineated by blank lines. You can use these to group imports\n          however you like, e.g. by first- vs. third-party or thematically."], _a.raw = ["\n      Enforce a consistent ordering of import aliases:\n      - Named imports must be alphabetized (i.e. \"import foo = de.foo.F;\")\n          - The exact ordering can be controled by the additional option for the rule.\n      - Import sources must be alphabetized within groups, i.e.:\n              import bar = de.bar.B;\n              import Foo = de.foo.F;\n      - Groups of imports are delineated by blank lines. You can use these to group imports\n          however you like, e.g. by first- vs. third-party or thematically."], Lint.Utils.dedent(_a)),
    optionsDescription: (_b = ["\n      In order to control the ordered alphabetized TODO!!!"], _b.raw = ["\n      In order to control the ordered alphabetized TODO!!!"], Lint.Utils.dedent(_b)),
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
Rule.IMPORT_ALIASES_UNORDERED = 'Import aliases within a group must be alphabetized';
exports.Rule = Rule;
// convert aBcD --> aBcD
function flipCase(x) {
    return x.split('').map(function (char) {
        if (char >= 'a' && char <= 'z') {
            return char.toUpperCase();
        }
        else if (char >= 'A' && char <= 'Z') {
            return char.toLowerCase();
        }
        return char;
    }).join('');
}
var TRANSFORMS = {
    'case-insensitive': function (x) { return x.toLowerCase(); },
    'lowercase-first': flipCase,
    'lowercase-last': function (x) { return x; }
};
var OrderedImportAliasesWalker = (function (_super) {
    __extends(OrderedImportAliasesWalker, _super);
    function OrderedImportAliasesWalker(sourceFile, options) {
        var _this = _super.call(this, sourceFile, options) || this;
        _this.optionSet = '';
        _this.lastImportAlias = null;
        _this.importAliasOrderTransform = function () { return ''; };
        _this.optionSet = _this.getOptions()[0] || 'case-insensitive';
        _this.importAliasOrderTransform = TRANSFORMS[_this.optionSet];
        return _this;
    }
    // e.g. "import Foo = de.Foo.f;"
    OrderedImportAliasesWalker.prototype.visitImportEqualsDeclaration = function (node) {
        var alias = this.importAliasOrderTransform(node.name.text);
        if (this.lastImportAlias && alias < this.lastImportAlias) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), this.getParameterizedFailureText()));
        }
        this.lastImportAlias = alias;
        _super.prototype.visitImportEqualsDeclaration.call(this, node);
    };
    /**
     * @see orderedImportsRule in core rule implementation of tslint
     * Check for a blank line, in which case we should reset the import ordering.
     */
    OrderedImportAliasesWalker.prototype.visitNode = function (node) {
        var prefixLength = node.getStart() - node.getFullStart();
        var prefix = node.getFullText().slice(0, prefixLength);
        if (prefix.indexOf('\n\n') >= 0 ||
            prefix.indexOf('\r\n\r\n') >= 0) {
            this.lastImportAlias = null;
        }
        _super.prototype.visitNode.call(this, node);
    };
    OrderedImportAliasesWalker.prototype.getParameterizedFailureText = function () {
        return Rule.IMPORT_ALIASES_UNORDERED + " (" + this.optionSet + ").";
    };
    return OrderedImportAliasesWalker;
}(Lint.RuleWalker));
var _a, _b;
