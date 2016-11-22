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

import * as Lint from "tslint/lib/lint";
import * as ts from "typescript";

const OPTION_CLASS_PREFIX = "class-prefix";
const OPTION_FUNCTION_PREFIX = "function-prefix";
const OPTION_GLOBAL_PREFIX = "global-prefix";
const OPTION_PARAMETER_PREFIX = "parameter-prefix";
const OPTION_JQUERY_PREFIX = "jquery-prefix";

const CLASS_PREFIX = "i";
const FUNCTION_PREFIX = "t";
const GLOBAL_PREFIX = "g";
const PARAMETER_PREFIX = "a";
const JQUERY_PREFIX = "$";

export class Rule extends Lint.Rules.AbstractRule {
    /* tslint:disable:object-literal-sort-keys */
    public static metadata: Lint.IRuleMetadata = {
        ruleName: "variable-name-prefix",
        description: "Checks prefix of variable names for various errors.",
        optionsDescription: Lint.Utils.dedent`
        Five arguments may be optionally provided:

        * \`"${OPTION_CLASS_PREFIX}"\`: requires that class variable names must start with "i" as prefix
        * \`"${OPTION_JQUERY_PREFIX}"\`: requires that variable names of type JQuery in each scope must start with "$" sign as prefix
        * \`"${OPTION_GLOBAL_PREFIX}"\`: requires that variable names in global scope must start with "g" as prefix
        * \`"${OPTION_FUNCTION_PREFIX}"\`: requires that variable names in function scope must start with "t" as prefix
        * \`"${OPTION_PARAMETER_PREFIX}"\`: requires that parameter names in constructor and function must start with "a" as prefix`,
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

    public static CLASS_PREFIX_FAILURE = "variable name in class scope must start with \"i\" as prefix followed by uppercase letter";
    public static FUNCTION_PREFIX_FAILURE = "variable name in function/method scope must start" +
                                                " with \"t\" as prefix followed by an uppercase letter";
    public static GLOBAL_PREFIX_FAILURE = "global variable name must start with \"g\" as prefix followed by an uppercase letter";
    public static PARAMETER_PREFIX_FAILURE = "parameter name must start with \"a\" as prefix followed by an uppercase letter";
    public static JQUERY_PREFIX_FAILURE = "variable name of type JQuery must start with \"$\" as prefix";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new VariableNamePrefixWalker(sourceFile, this.getOptions()));
    }
}

class VariableNamePrefixWalker extends Lint.RuleWalker {
    private shouldCheckGlobalPrefix: boolean;
    private shouldCheckJqueryPrefix: boolean;
    private shouldCheckParameterPrefix: boolean;
    private shouldCheckFunctionPrefix: boolean;
    private shouldCheckClassPrefix: boolean;

    constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
        super(sourceFile, options);

        this.shouldCheckGlobalPrefix = this.hasOption(OPTION_GLOBAL_PREFIX);
        this.shouldCheckJqueryPrefix = this.hasOption(OPTION_JQUERY_PREFIX);
        this.shouldCheckParameterPrefix = this.hasOption(OPTION_PARAMETER_PREFIX);
        this.shouldCheckFunctionPrefix = this.hasOption(OPTION_FUNCTION_PREFIX);
        this.shouldCheckClassPrefix = this.hasOption(OPTION_CLASS_PREFIX);
    }

    public isFunctionDeclaration(kind: ts.SyntaxKind): boolean {
        return kind === ts.SyntaxKind.FunctionDeclaration
            || kind === ts.SyntaxKind.FunctionExpression;
    }

    public isMethodDeclaration(kind: ts.SyntaxKind): boolean {
        return kind === ts.SyntaxKind.MethodDeclaration;
    }

    public visitSourceFile(node: ts.SourceFile) {
        super.visitSourceFile(node);
    }

    public visitVariableDeclaration(node: ts.VariableDeclaration) {
      console.error('visit variable');
        const nextScopeKind: ts.SyntaxKind = this.getNextRelevantScopeOfNode(node);

        if (node.name.kind === ts.SyntaxKind.Identifier) {
            const identifier = <ts.Identifier> node.name;

            if ((this.isFunctionDeclaration(nextScopeKind) || this.isMethodDeclaration(nextScopeKind))
                    && (this.shouldCheckFunctionPrefix || this.shouldCheckJqueryPrefix) ) {
                this.handleVariableNameFormat(FUNCTION_PREFIX, identifier, Rule.FUNCTION_PREFIX_FAILURE);
            } else if (!this.isFunctionDeclaration(nextScopeKind) && !this.isMethodDeclaration(nextScopeKind)
                    && (this.shouldCheckGlobalPrefix || this.shouldCheckJqueryPrefix) ) {
                this.handleVariableNameFormat(GLOBAL_PREFIX, identifier, Rule.GLOBAL_PREFIX_FAILURE);
            }
        }

        super.visitVariableDeclaration(node);
    }

    public visitParameterDeclaration(node: ts.ParameterDeclaration) {
      console.error('visit parameter');
        if (this.shouldCheckParameterPrefix || this.shouldCheckJqueryPrefix) {
            if (node.name.kind === ts.SyntaxKind.Identifier) {
                const identifier = <ts.Identifier> node.name;

                this.handleVariableNameFormat(PARAMETER_PREFIX, identifier, Rule.PARAMETER_PREFIX_FAILURE);
            }
        }

        super.visitParameterDeclaration(node);
    }

    public visitClassDeclaration(node: ts.ClassDeclaration) {
      console.error('visit class');
        if (this.shouldCheckClassPrefix || this.shouldCheckJqueryPrefix) {
            const members = <ts.NodeArray<ts.ClassElement>> node.members;

            members.forEach((member: ts.ClassElement) => {
                const identifier = <ts.Identifier> member.name;

                if (identifier && identifier.kind === ts.SyntaxKind.Identifier && this.isPropertyDeclaration(member)) {
                    this.handleVariableNameFormat(CLASS_PREFIX, identifier, Rule.CLASS_PREFIX_FAILURE);
                }
            });
        }

        super.visitClassDeclaration(node);
    }

    public visitFunctionDeclaration(node: ts.FunctionDeclaration) {
      console.error('visit function');
        if (this.shouldCheckParameterPrefix || this.shouldCheckJqueryPrefix) {
            const functionParams = <ts.NodeArray<ts.ParameterDeclaration>> node.parameters;

            functionParams.forEach((parameter: ts.ParameterDeclaration) => {
                this.visitParameterDeclaration(parameter);
            });
        }
        if (this.shouldCheckFunctionPrefix || this.shouldCheckJqueryPrefix) {
            const functionBlock = <ts.Block> node.body;

            if (!functionBlock) {
              return;
            }

            const variableDeclarations = <ts.NodeArray<ts.Statement>> functionBlock.statements;
            variableDeclarations.forEach((statement: ts.Statement) => {
                if (statement.kind === ts.SyntaxKind.VariableStatement) {
                    const children = <ts.Node[]> statement.getChildren(this.getSourceFile());

                    children.forEach((childNode: ts.Node) => {
                        super.visitNode(childNode);
                    });
                }
            });
        }

        super.visitFunctionDeclaration(node);
    }

    private getTypeOfIdentifier(identifier: ts.Identifier) {
        const declaration = <ts.VariableDeclaration> identifier.parent;

        return declaration.type;
    }

    private isPropertyDeclaration(element: ts.ClassElement) {
        return element.kind === ts.SyntaxKind.PropertyDeclaration;
    }

    private getNextRelevantScopeOfNode(node: ts.Node): ts.SyntaxKind {
        const scopes: ts.SyntaxKind[] = [
            ts.SyntaxKind.FunctionDeclaration,
            ts.SyntaxKind.FunctionExpression,
            ts.SyntaxKind.MethodDeclaration,
            ts.SyntaxKind.ClassDeclaration,
        ];

        return isNodeDeclaredInRelevantScope(node, scopes);
    }

    private handleVariableNameFormat(prefix: string, identifier: ts.Identifier, ruleFailure: string) {
        const type = <ts.TypeNode> this.getTypeOfIdentifier(identifier);

        if (this.shouldCheckJqueryPrefix && isJQueryType(type)) {
            this.handleVariableNameFormatWithJQueryType([JQUERY_PREFIX, prefix], identifier, ruleFailure);
        } else {
            this.handleVariableNameFormatWithoutJQueryType(prefix, identifier, ruleFailure);
        }
    }

    private handleVariableNameFormatWithoutJQueryType(
            prefix: string, identifier: ts.Identifier,
            ruleFailure: string, hasVariableJQueryPrefix: boolean = false) {
        const variableName = reviseVariableName(identifier.text, hasVariableJQueryPrefix);

        if ( (this.shouldCheckGlobalPrefix || this.shouldCheckParameterPrefix || this.shouldCheckFunctionPrefix
                || this.shouldCheckClassPrefix) && !isValidPrefix(prefix, variableName)) {
            this.addFailure(this.createFailure(
                identifier.getStart(), identifier.getWidth(), ruleFailure));
        }
    }

    private handleVariableNameFormatWithJQueryType(prefix: string[], identifier: ts.Identifier, ruleFailure: string) {
        const jqueryPrefix: string = prefix[0];
        const variablePrefix: string = prefix[1];
        const variableName: string = identifier.text;
        const isJqueryPrefix: boolean = isValidJQueryPrefix(jqueryPrefix, variableName);

        if (!isJqueryPrefix) {
            this.addFailure(this.createFailure(
                identifier.getStart(), identifier.getWidth(), Rule.JQUERY_PREFIX_FAILURE));
        }

        this.handleVariableNameFormatWithoutJQueryType(variablePrefix, identifier, ruleFailure, isJqueryPrefix);
    }
}

function reviseVariableName(name: string, hasJQueryPrefix: boolean): string {
    if (hasJQueryPrefix === true) {
        return name.substr(1, name.length);
    }

    return name;
}

function isKindInScope(kind: ts.SyntaxKind, scopes: ts.SyntaxKind[]): boolean {
    return scopes.indexOf(kind) > -1;
}

function isNodeDeclaredInRelevantScope(node: ts.Node, scopes: ts.SyntaxKind[]): ts.SyntaxKind {
    if (node === undefined || node.parent === undefined) {
        return null;
    } else if (isKindInScope(node.parent.kind, scopes)) {
        return node.parent.kind;
    } else {
        return isNodeDeclaredInRelevantScope(node.parent, scopes);
    }
}

function isNodeDeclaredInScopeOfType(node: ts.Node, kind: ts.SyntaxKind): boolean {
    if (node === undefined || node.parent === undefined) {
        return false;
    } else if (node.parent.kind === kind) {
        return true;
    } else {
        return isNodeDeclaredInScopeOfType(node.parent, kind);
    }
}

function isJQueryType(type: ts.TypeNode): boolean {
    if (typeof type === "undefined") {
        return false;
    }

    return type.getText() === "JQuery";
}

function isValidJQueryPrefix(prefix: string, name: string) {
    const firstCharacter = name.charAt(0);

    if (firstCharacter === prefix) {
        return true;
    }

    return false;
}

function isValidPrefix(prefix: string, name: string) {
    const firstCharacter = name.charAt(0);
    const secondCharacter = name.charAt(1);

    if (firstCharacter === prefix && isUpperCaseCharacter(secondCharacter)) {
        return true;
    }

    return false;
}

function isUpperCaseCharacter(character: string) {
    if (character === character.toUpperCase()) {
        return true;
    }

    return false;
}
