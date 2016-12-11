import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
export declare class Rule extends Lint.Rules.AbstractRule {
    static metadata: Lint.IRuleMetadata;
    static CLASS_PREFIX_FAILURE: string;
    static FUNCTION_PREFIX_FAILURE: string;
    static GLOBAL_PREFIX_FAILURE: string;
    static PARAMETER_PREFIX_FAILURE: string;
    static JQUERY_PREFIX_FAILURE: string;
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
}
