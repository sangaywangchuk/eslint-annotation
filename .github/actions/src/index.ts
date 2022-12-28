import * as core from '@actions/core';
import * as github from '@actions/github';
import eslintJsonReportToJsObject from './eslintReportJsonToObject';
import inputs from './inputs';
import { getPullRequestChangedAnalyzedReport } from './analyzedReport';
import { createStatusCheck, onRateLimitingError } from './checksApi';
(async () => {
  try {
    const { token, eslintReportFile } = inputs;
    /**
     * Eslint report to javascript object conversion
     */
    const parsedEslintReportJs = eslintJsonReportToJsObject(eslintReportFile);
    /**
     * create octokit instance
     */
    const octokit = github.getOctokit(token);

    const { checkId, pullRequest } = await createStatusCheck(octokit);

    const report = await getPullRequestChangedAnalyzedReport(parsedEslintReportJs, octokit, pullRequest[0]?.number);

    const conclusion = report.annotations.length ? (report.success ? 'success' : 'failure') : 'success';

    await onRateLimitingError(octokit, checkId, conclusion, report.annotations, 'completed', report?.markdown);

    if (conclusion === 'failure') {
      core.setFailed('linting failed fix the issues');
    }
  } catch (e) {
    const error = e as Error;
    console.log('personal error: ', error.toString());
    core.setFailed(error.message);
  }
})();
