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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require("typescript");
var Lint = require("tslint/lib/lint");
var OPTION_CLASS_PREFIX = "class-prefix";
var OPTION_FUNCTION_PREFIX = "function-prefix";
var OPTION_GLOBAL_PREFIX = "global-prefix";
var OPTION_PARAMETER_PREFIX = "parameter-prefix";
var OPTION_JQUERY_PREFIX = "jquery-prefix";
var CLASS_PREFIX = "i";
var FUNCTION_PREFIX = "t";
var GLOBAL_PREFIX = "g";
var PARAMETER_PREFIX = "a";
var JQUERY_PREFIX = "$";
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        var variableNamePrefixWalker = new VariableNamePrefixWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(variableNamePrefixWalker);
    };
    /* tslint:disable:object-literal-sort-keys */
    Rule.metadata = {
        ruleName: "variable-name-prefix",
        description: "Checks prefix of variable names for various errors.",
        optionsDescription: (_a = ["\n        Five arguments may be optionally provided:\n\n        * `\"", "\"`: requires that class variable names must start with \"i\" as prefix\n        * `\"", "\"`: requires that variable names of type JQuery in each scope must start with \"$\" sign as prefix\n        * `\"", "\"`: requires that variable names in global scope must start with \"g\" as prefix\n        * `\"", "\"`: requires that variable names in function scope must start with \"t\" as prefix\n        * `\"", "\"`: requires that parameter names in constructor and function must start with \"a\" as prefix"], _a.raw = ["\n        Five arguments may be optionally provided:\n\n        * \\`\"", "\"\\`: requires that class variable names must start with \"i\" as prefix\n        * \\`\"", "\"\\`: requires that variable names of type JQuery in each scope must start with \"$\" sign as prefix\n        * \\`\"", "\"\\`: requires that variable names in global scope must start with \"g\" as prefix\n        * \\`\"", "\"\\`: requires that variable names in function scope must start with \"t\" as prefix\n        * \\`\"", "\"\\`: requires that parameter names in constructor and function must start with \"a\" as prefix"], Lint.Utils.dedent(_a, OPTION_CLASS_PREFIX, OPTION_JQUERY_PREFIX, OPTION_GLOBAL_PREFIX, OPTION_FUNCTION_PREFIX, OPTION_PARAMETER_PREFIX)),
        options: {
            type: "array",
            items: {
                type: "string",
                enum: [
                    OPTION_CLASS_PREFIX,
                    OPTION_JQUERY_PREFIX,
                    OPTION_GLOBAL_PREFIX,
                    OPTION_FUNCTION_PREFIX,
                    OPTION_PARAMETER_PREFIX,
                ],
            },
            minLength: 0,
            maxLength: 5,
        },
        optionExamples: ['[true, "class-prefix", "parameter-prefix", "jqery-prefix"]'],
        type: "style",
    };
    /* tslint:enable:object-literal-sort-keys */
    Rule.CLASS_PREFIX_FAILURE = "variable name in class scope must start with \"i\" as prefix followed by uppercase letter";
    Rule.FUNCTION_PREFIX_FAILURE = "variable name in function/method scope must start" +
        " with \"t\" as prefix followed by an uppercase letter";
    Rule.GLOBAL_PREFIX_FAILURE = "global variable name must start with \"g\" as prefix followed by an uppercase letter";
    Rule.PARAMETER_PREFIX_FAILURE = "parameter name must start with \"a\" as prefix followed by an uppercase letter";
    Rule.JQUERY_PREFIX_FAILURE = "variable name of type JQuery must start with \"$\" as prefix";
    return Rule;
    var _a;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var VariableNamePrefixWalker = (function (_super) {
    __extends(VariableNamePrefixWalker, _super);
    function VariableNamePrefixWalker(sourceFile, options) {
        _super.call(this, sourceFile, options);
        this.shouldCheckGlobalPrefix = this.hasOption(OPTION_GLOBAL_PREFIX);
        this.shouldCheckJqueryPrefix = this.hasOption(OPTION_JQUERY_PREFIX);
        this.shouldCheckParameterPrefix = this.hasOption(OPTION_PARAMETER_PREFIX);
        this.shouldCheckFunctionPrefix = this.hasOption(OPTION_FUNCTION_PREFIX);
        this.shouldCheckClassPrefix = this.hasOption(OPTION_CLASS_PREFIX);
    }
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
    VariableNamePrefixWalker.prototype.visitVariableDeclaration = function (node) {
        var nextScopeKind = this.getNextRelevantScopeOfNode(node);
        if (node.name.kind === ts.SyntaxKind.Identifier && this.isCatchClause(nextScopeKind) === false) {
            var identifier = node.name;
            if ((this.isFunctionDeclaration(nextScopeKind) || this.isMethodDeclaration(nextScopeKind))
                && (this.shouldCheckFunctionPrefix || this.shouldCheckJqueryPrefix)) {
                this.handleVariableNameFormat(FUNCTION_PREFIX, identifier, Rule.FUNCTION_PREFIX_FAILURE);
            }
            else if (!this.isFunctionDeclaration(nextScopeKind) && !this.isMethodDeclaration(nextScopeKind)
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
                if (identifier && identifier.kind === ts.SyntaxKind.Identifier && _this.isPropertyDeclaration(member)) {
                    _this.handleVariableNameFormat(CLASS_PREFIX, identifier, Rule.CLASS_PREFIX_FAILURE);
                }
            });
        }
        _super.prototype.visitClassDeclaration.call(this, node);
    };
    VariableNamePrefixWalker.prototype.visitFunctionDeclaration = function (node) {
        var _this = this;
        if (this.shouldCheckParameterPrefix || this.shouldCheckJqueryPrefix) {
            var functionParams = node.parameters;
            functionParams.forEach(function (parameter) {
                _this.visitParameterDeclaration(parameter);
            });
        }
        if (this.shouldCheckFunctionPrefix || this.shouldCheckJqueryPrefix) {
            var functionBlock = node.body;
            if (!functionBlock) {
                return;
            }
            var variableDeclarations = functionBlock.statements;
            variableDeclarations.forEach(function (statement) {
                if (statement.kind === ts.SyntaxKind.VariableStatement) {
                    var children = statement.getChildren(_this.getSourceFile());
                    children.forEach(function (childNode) {
                        _super.prototype.visitNode.call(_this, childNode);
                    });
                }
            });
        }
        _super.prototype.visitFunctionDeclaration.call(this, node);
    };
    VariableNamePrefixWalker.prototype.visitCatchClause = function (node) {
        var catchVariable = node.variableDeclaration;
        if (this.shouldCheckParameterPrefix && catchVariable) {
            var identifier = catchVariable.name;
            this.handleVariableNameFormat(PARAMETER_PREFIX, identifier, Rule.PARAMETER_PREFIX_FAILURE);
        }
        _super.prototype.visitCatchClause.call(this, node);
    };
    VariableNamePrefixWalker.prototype.getTypeOfIdentifier = function (identifier) {
        var declaration = identifier.parent;
        return declaration.type;
    };
    VariableNamePrefixWalker.prototype.isPropertyDeclaration = function (element) {
        return element.kind === ts.SyntaxKind.PropertyDeclaration;
    };
    VariableNamePrefixWalker.prototype.getNextRelevantScopeOfNode = function (node) {
        var scopes = [
            ts.SyntaxKind.ClassDeclaration,
            ts.SyntaxKind.FunctionDeclaration,
            ts.SyntaxKind.FunctionExpression,
            ts.SyntaxKind.MethodDeclaration,
            ts.SyntaxKind.WithStatement,
            ts.SyntaxKind.TryStatement
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
        if ((this.shouldCheckGlobalPrefix || this.shouldCheckParameterPrefix || this.shouldCheckFunctionPrefix
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
        return null;
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
    if (typeof type === "undefined") {
        return false;
    }
    return type.getText() === "JQuery";
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
