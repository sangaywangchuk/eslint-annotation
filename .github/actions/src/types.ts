import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import { operations } from '@octokit/openapi-types';
import { WebhookEvents } from '@octokit/webhooks-types';

export type PullRequest = RestEndpointMethodTypes['pulls']['get']['response']['data'];

type ChecksCreate = operations['checks/create']['requestBody']['content']['application/json'];

type Output = NonNullable<ChecksCreate['output']>;

export type Annotations = NonNullable<Output['annotations']>;

export type Images = NonNullable<Output['images']>;

export type Actions = NonNullable<ChecksCreate['actions']>;
// export type Output = {
//   summary: string;
//   text_description?: string;
// };

export enum Conclusion {
  Success = 'success',
  Failure = 'failure',
  Neutral = 'neutral',
  Cancelled = 'cancelled',
  TimedOut = 'timed_out',
  ActionRequired = 'action_required',
}

export enum Status {
  Queued = 'queued',
  InProgress = 'in_progress',
  Completed = 'completed',
}

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

export interface RollupReport {
  errorCount: number;
  warningCount: number;
  success: boolean;
  markdown: string;
  summary: string;
  annotations: ChecksUpdateParamsOutputAnnotations[];
  reports: AnalyzedESLintReport[];
}

export interface FileSet {
  name: string;
  files: ESLintEntry[];
}

interface ArgsBase {
  repo?: string;
  sha?: string;
  token: string;
  conclusion?: Conclusion;
  status: Status;
  actionURL?: string;
  detailsURL?: string;
  output?: Output;
  annotations?: Annotations;
  images?: Images;
  actions?: Actions;
}

export interface ArgsCreate extends ArgsBase {
  name: string;
}

export interface ArgsUpdate extends ArgsBase {
  checkID: number;
}

export type Args = ArgsCreate | ArgsUpdate;
