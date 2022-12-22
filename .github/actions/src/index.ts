import * as core from '@actions/core';
import * as github from '@actions/github';
import eslintJsonReportToJsObject from './eslintReportJsonToObject';
import inputs from './inputs';
import { getPullRequestChangedAnalyzedReport } from './analyzedReport';
import { createStatusCheck, onUpdateAnnotation } from './checksApi';
(async () => {
  try {
    const { token, eslintReportFile } = inputs;
    /**
     * convert eslint report json file to javascript object
     */
    const parsedEslintReportJs = eslintJsonReportToJsObject(eslintReportFile);
    /**
     * create octokit instance
     */
    const octokit = github.getOctokit(token);

    const { checkId, pullRequest } = await createStatusCheck(octokit);

    const report = await getPullRequestChangedAnalyzedReport(parsedEslintReportJs, octokit, pullRequest[0]?.number);

    const conclusion = report.annotations.length ? (report.success ? 'success' : 'failure') : 'success';

    await onUpdateAnnotation(octokit, checkId, conclusion, report.annotations, 'completed');

    if (conclusion === 'failure') {
      core.setFailed('linting failed fix the issues');
    }
  } catch (e) {
    const error = e as Error;
    console.log('personal error: ', error.toString());
    core.setFailed(error.message);
  }
})();
