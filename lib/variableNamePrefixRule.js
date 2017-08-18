"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Lint = require("tslint");
var ts = require("typescript");
var OPTION_CLASS_PREFIX = 'class-prefix';
var OPTION_FUNCTION_PREFIX = 'function-prefix';
var OPTION_GLOBAL_PREFIX = 'global-prefix';
var OPTION_PARAMETER_PREFIX = 'parameter-prefix';
var OPTION_JQUERY_PREFIX = 'jquery-prefix';
var CLASS_PREFIX = 'i';
var FUNCTION_PREFIX = 't';
var GLOBAL_PREFIX = 'g';
var PARAMETER_PREFIX = 'a';
var JQUERY_PREFIX = '$';
var Rule = (function (_super) {
    tslib_1.__extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        var variableNamePrefixWalker = new VariableNamePrefixWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(variableNamePrefixWalker);
    };
    /* tslint:disable:object-literal-sort-keys max-line-length */
    Rule.metadata = {
        ruleName: 'variable-name-prefix',
        description: 'Checks prefix of variable names for various errors.',
        optionsDescription: (_a = ["\n    Five arguments may be optionally provided:\n\n    * `'", "'`: requires that class variable names must start with \"i\" as prefix\n    * `'", "'`: requires that variable names of type JQuery in each scope must start with \"$\" sign as prefix\n    * `'", "'`: requires that variable names in global scope must start with \"g\" as prefix\n    * `'", "'`: requires that variable names in function scope must start with \"t\" as prefix\n    * `'", "'`: requires that parameter names in constructor and function must start with 'a\" as prefix"], _a.raw = ["\n    Five arguments may be optionally provided:\n\n    * \\`'", "'\\`: requires that class variable names must start with \"i\" as prefix\n    * \\`'", "'\\`: requires that variable names of type JQuery in each scope must start with \"$\" sign as prefix\n    * \\`'", "'\\`: requires that variable names in global scope must start with \"g\" as prefix\n    * \\`'", "'\\`: requires that variable names in function scope must start with \"t\" as prefix\n    * \\`'", "'\\`: requires that parameter names in constructor and function must start with 'a\" as prefix"], Lint.Utils.dedent(_a, OPTION_CLASS_PREFIX, OPTION_JQUERY_PREFIX, OPTION_GLOBAL_PREFIX, OPTION_FUNCTION_PREFIX, OPTION_PARAMETER_PREFIX)),
        options: {
            type: 'array',
            items: {
                type: 'string',
                enum: [
                    OPTION_CLASS_PREFIX,
                    OPTION_JQUERY_PREFIX,
                    OPTION_GLOBAL_PREFIX,
                    OPTION_FUNCTION_PREFIX,
                    OPTION_PARAMETER_PREFIX
                ]
            },
            minLength: 0,
            maxLength: 5
        },
        optionExamples: ['[true, "class-prefix", "parameter-prefix", "jqery-prefix"]'],
        type: 'style',
        typescriptOnly: true
    };
    /* tslint:enable:object-literal-sort-keys max-line-length */
    Rule.CLASS_PREFIX_FAILURE = 'variable name in class scope must start with \"i\" as prefix followed by uppercase letter';
    Rule.FUNCTION_PREFIX_FAILURE = 'variable name in function/method scope must start' +
        ' with \"t\" as prefix followed by an uppercase letter';
    Rule.GLOBAL_PREFIX_FAILURE = 'global variable name must start with \"g\" as prefix followed by an uppercase letter';
    Rule.PARAMETER_PREFIX_FAILURE = 'parameter name must start with \"a\" as prefix followed by an uppercase letter';
    Rule.JQUERY_PREFIX_FAILURE = 'variable name of type JQuery must start with \"$\" as prefix';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var VariableNamePrefixWalker = (function (_super) {
    tslib_1.__extends(VariableNamePrefixWalker, _super);
    function VariableNamePrefixWalker(sourceFile, options) {
        var _this = _super.call(this, sourceFile, options) || this;
        _this.isUnitTestSpecFile = sourceFile.fileName.indexOf('.spec') > -1;
        _this.shouldCheckGlobalPrefix = _this.hasOption(OPTION_GLOBAL_PREFIX);
        _this.shouldCheckJqueryPrefix = _this.hasOption(OPTION_JQUERY_PREFIX);
        _this.shouldCheckParameterPrefix = _this.hasOption(OPTION_PARAMETER_PREFIX);
        _this.shouldCheckFunctionPrefix = _this.hasOption(OPTION_FUNCTION_PREFIX);
        _this.shouldCheckClassPrefix = _this.hasOption(OPTION_CLASS_PREFIX);
        return _this;
    }
    VariableNamePrefixWalker.prototype.isConstructorDeclaration = function (kind) {
        return kind === ts.SyntaxKind.Constructor;
    };
    VariableNamePrefixWalker.prototype.isFunctionDeclaration = function (kind) {
        return kind === ts.SyntaxKind.FunctionDeclaration
            || kind === ts.SyntaxKind.FunctionExpression;
    };
    VariableNamePrefixWalker.prototype.isMethodDeclaration = function (kind) {
        return kind === ts.SyntaxKind.MethodDeclaration;
    };
    VariableNamePrefixWalker.prototype.isCatchClause = function (kind) {
        return kind === ts.SyntaxKind.WithStatement
            || kind === ts.SyntaxKind.TryStatement;
    };
    VariableNamePrefixWalker.prototype.isArrowFunction = function (kind) {
        return kind === ts.SyntaxKind.ArrowFunction;
    };
    VariableNamePrefixWalker.prototype.visitVariableDeclaration = function (node) {
        var nextScopeKind = this.getNextRelevantScopeOfNode(node);
        var callExpression = null;
        if (this.isUnitTestSpecFile && this.isArrowFunction(nextScopeKind)) {
            callExpression = this.findCallExpressionParentNode(node);
            if (callExpression === null) {
                return;
            }
        }
        if (node.name.kind === ts.SyntaxKind.Identifier && this.isCatchClause(nextScopeKind) === false) {
            var identifier = node.name;
            if ((this.isFunctionDeclaration(nextScopeKind) || this.isMethodDeclaration(nextScopeKind)
                || this.isConstructorDeclaration(nextScopeKind)
                || (this.isArrowFunction(nextScopeKind) && this.isUnitTestSpecFile === false)
                || (this.isArrowFunction(nextScopeKind) && this.isUnitTestSpecFile
                    && isItContextOfTestFile(callExpression)))
                && (this.shouldCheckFunctionPrefix || this.shouldCheckJqueryPrefix)) {
                this.handleVariableNameFormat(FUNCTION_PREFIX, identifier, Rule.FUNCTION_PREFIX_FAILURE);
            }
            else if ((!this.isFunctionDeclaration(nextScopeKind) && !this.isMethodDeclaration(nextScopeKind)
                && !this.isConstructorDeclaration(nextScopeKind)
                || (this.isArrowFunction(nextScopeKind) && this.isUnitTestSpecFile === false)
                || (this.isArrowFunction(nextScopeKind) && this.isUnitTestSpecFile
                    && isDescribeContextOfTestFile(callExpression)))
                && (this.shouldCheckGlobalPrefix || this.shouldCheckJqueryPrefix)) {
                this.handleVariableNameFormat(GLOBAL_PREFIX, identifier, Rule.GLOBAL_PREFIX_FAILURE);
            }
        }
        _super.prototype.visitVariableDeclaration.call(this, node);
    };
    VariableNamePrefixWalker.prototype.visitParameterDeclaration = function (node) {
        if (this.shouldCheckParameterPrefix || this.shouldCheckJqueryPrefix) {
            if (node.name.kind === ts.SyntaxKind.Identifier) {
                var identifier = node.name;
                this.handleVariableNameFormat(PARAMETER_PREFIX, identifier, Rule.PARAMETER_PREFIX_FAILURE);
            }
        }
        _super.prototype.visitParameterDeclaration.call(this, node);
    };
    VariableNamePrefixWalker.prototype.visitClassDeclaration = function (node) {
        var _this = this;
        if (this.shouldCheckClassPrefix || this.shouldCheckJqueryPrefix) {
            var members = node.members;
            members.forEach(function (member) {
                var identifier = member.name;
                var hasStaticModifier = containStaticModifier(member.modifiers);
                if (identifier && identifier.kind === ts.SyntaxKind.Identifier
                    && _this.isPropertyDeclaration(member) && hasStaticModifier === false) {
                    _this.handleVariableNameFormat(CLASS_PREFIX, identifier, Rule.CLASS_PREFIX_FAILURE);
                }
            });
        }
        _super.prototype.visitClassDeclaration.call(this, node);
    };
    VariableNamePrefixWalker.prototype.visitCatchClause = function (node) {
        var catchVariable = node.variableDeclaration;
        if (this.shouldCheckParameterPrefix && catchVariable) {
            var identifier = catchVariable.name;
            this.handleVariableNameFormat(PARAMETER_PREFIX, identifier, Rule.PARAMETER_PREFIX_FAILURE);
        }
        _super.prototype.visitCatchClause.call(this, node);
    };
    VariableNamePrefixWalker.prototype.findCallExpressionParentNode = function (node) {
        if (typeof node !== 'undefined' && node.kind === ts.SyntaxKind.CallExpression) {
            return node;
        }
        else if (typeof node !== 'undefined') {
            return this.findCallExpressionParentNode(node.parent);
        }
        return {};
    };
    VariableNamePrefixWalker.prototype.getTypeOfIdentifier = function (identifier) {
        var declaration = identifier.parent;
        return declaration.type || undefined;
    };
    VariableNamePrefixWalker.prototype.isPropertyDeclaration = function (element) {
        return element.kind === ts.SyntaxKind.PropertyDeclaration;
    };
    VariableNamePrefixWalker.prototype.getNextRelevantScopeOfNode = function (node) {
        var scopes = [
            ts.SyntaxKind.ClassDeclaration,
            ts.SyntaxKind.Constructor,
            ts.SyntaxKind.FunctionDeclaration,
            ts.SyntaxKind.FunctionExpression,
            ts.SyntaxKind.MethodDeclaration,
            ts.SyntaxKind.WithStatement,
            ts.SyntaxKind.TryStatement,
            ts.SyntaxKind.ArrowFunction /* in test case e.g. it() or describe() */
        ];
        return isNodeDeclaredInRelevantScope(node, scopes);
    };
    VariableNamePrefixWalker.prototype.handleVariableNameFormat = function (prefix, identifier, ruleFailure) {
        var type = this.getTypeOfIdentifier(identifier);
        if (this.shouldCheckJqueryPrefix && isJQueryType(type)) {
            this.handleVariableNameFormatWithJQueryType([JQUERY_PREFIX, prefix], identifier, ruleFailure);
        }
        else {
            this.handleVariableNameFormatWithoutJQueryType(prefix, identifier, ruleFailure);
        }
    };
    VariableNamePrefixWalker.prototype.handleVariableNameFormatWithoutJQueryType = function (prefix, identifier, ruleFailure, hasVariableJQueryPrefix) {
        if (hasVariableJQueryPrefix === void 0) { hasVariableJQueryPrefix = false; }
        var variableName = reviseVariableName(identifier.text, hasVariableJQueryPrefix);
        if (isVariableNameLongerThan(1, variableName, hasVariableJQueryPrefix) && (this.shouldCheckGlobalPrefix
            || this.shouldCheckParameterPrefix || this.shouldCheckFunctionPrefix
            || this.shouldCheckClassPrefix) && !isValidPrefix(prefix, variableName)) {
            this.addFailure(this.createFailure(identifier.getStart(), identifier.getWidth(), ruleFailure));
        }
    };
    VariableNamePrefixWalker.prototype.handleVariableNameFormatWithJQueryType = function (prefix, identifier, ruleFailure) {
        var jqueryPrefix = prefix[0];
        var variablePrefix = prefix[1];
        var variableName = identifier.text;
        var isJqueryPrefix = isValidJQueryPrefix(jqueryPrefix, variableName);
        if (!isJqueryPrefix) {
            this.addFailure(this.createFailure(identifier.getStart(), identifier.getWidth(), Rule.JQUERY_PREFIX_FAILURE));
        }
        this.handleVariableNameFormatWithoutJQueryType(variablePrefix, identifier, ruleFailure, isJqueryPrefix);
    };
    return VariableNamePrefixWalker;
}(Lint.RuleWalker));
function reviseVariableName(name, hasJQueryPrefix) {
    if (hasJQueryPrefix === true) {
        return name.substr(1, name.length);
    }
    return name;
}
function isKindInScope(kind, scopes) {
    return scopes.indexOf(kind) > -1;
}
function isNodeDeclaredInRelevantScope(node, scopes) {
    if (node === undefined || node.parent === undefined) {
        return ts.SyntaxKind.Unknown;
    }
    else if (isKindInScope(node.parent.kind, scopes)) {
        return node.parent.kind;
    }
    else {
        return isNodeDeclaredInRelevantScope(node.parent, scopes);
    }
}
function isNodeDeclaredInScopeOfType(node, kind) {
    if (node === undefined || node.parent === undefined) {
        return false;
    }
    else if (node.parent.kind === kind) {
        return true;
    }
    else {
        return isNodeDeclaredInScopeOfType(node.parent, kind);
    }
}
function isJQueryType(type) {
    if (typeof type === 'undefined') {
        return false;
    }
    return type.getText() === 'JQuery' || type.getText() === 'JQuery[]';
}
function isVariableNameLongerThan(threshold, name, hasJQueryPrefix) {
    if (hasJQueryPrefix === true) {
        name = name.substr(1, name.length);
    }
    return name.length > threshold;
}
function isValidJQueryPrefix(prefix, name) {
    var firstCharacter = name.charAt(0);
    if (firstCharacter === prefix) {
        return true;
    }
    return false;
}
function isValidPrefix(prefix, name) {
    var firstCharacter = name.charAt(0);
    var secondCharacter = name.charAt(1);
    if (firstCharacter === prefix && isUpperCaseCharacter(secondCharacter)) {
        return true;
    }
    return false;
}
function isUpperCaseCharacter(character) {
    if (character === character.toUpperCase()) {
        return true;
    }
    return false;
}
function isItContextOfTestFile(callExpression) {
    if (callExpression === null) {
        return false;
    }
    return 'it' === callExpression.expression.getText();
}
function isDescribeContextOfTestFile(callExpression) {
    if (callExpression === null) {
        return false;
    }
    return 'describe' === callExpression.expression.getText();
}
function containStaticModifier(modifiers) {
    if (typeof modifiers === 'undefined') {
        return false;
    }
    var containStatic = false;
    modifiers.forEach(function (modifier) {
        if (modifier.kind === ts.SyntaxKind.StaticKeyword) {
            containStatic = true;
        }
    });
    return containStatic;
}
var _a;
