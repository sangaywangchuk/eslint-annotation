import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import { operations } from '@octokit/openapi-types';

export type PullRequest = RestEndpointMethodTypes['pulls']['get']['response']['data'];

type ChecksCreate = operations['checks/create']['requestBody']['content']['application/json'];

type Output = NonNullable<ChecksCreate['output']>;

export type Annotations = NonNullable<Output['annotations']>;

export type Images = NonNullable<Output['images']>;

export type Actions = NonNullable<ChecksCreate['actions']>;

export interface ChecksUpdateParamsOutputAnnotations {
  path: string;
  start_line: number;
  end_line: number;
  start_column?: number;
  end_column?: number;
  annotation_level: 'notice' | 'warning' | 'failure';
  message: string;
  title?: string;
  raw_details?: string;
}

export interface ESLintMessage {
  ruleId: string;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType: string | null;
  endLine?: number;
  endColumn?: number | null;
  fix?: {
    range: number[];
    text: string;
  };
  messageId?: string;
}

export interface ESLintEntry {
  filePath: string;
  messages: ESLintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source?: string;
  usedDeprecatedRules?: [];
}

export type ESLintReport = ESLintEntry[];

export interface AnalyzedESLintReport {
  errorCount: number;
  warningCount: number;
  success: boolean;
  markdown: string;
  summary: string;
  annotations: ChecksUpdateParamsOutputAnnotations[];
}
