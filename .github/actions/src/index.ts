import * as core from '@actions/core';
import * as github from '@actions/github';
import eslintJsonReportToJsObject from './eslintReportJsonToObject';
import inputs from './inputs';
import { getPullRequestChangedAnalyzedReport } from './analyzedReport';
import { createStatusCheck, onUpdateAnnotation } from './checksApi';
(async () => {
  try {
    core.debug(`Starting analysis of the ESLint report json to javascript object`);
    const { token, eslintReportFile } = inputs;
    const parsedEslintReportJs = eslintJsonReportToJsObject(eslintReportFile);
    const octokit = github.getOctokit(token);
    const { checkId, pullRequest } = await createStatusCheck(octokit);
    console.log('checkID', checkId, pullRequest);
    const report = await getPullRequestChangedAnalyzedReport(parsedEslintReportJs, octokit, pullRequest[0].number);
    const conclusion = report.annotations.length ? (report.success ? 'success' : 'failure') : 'success';
    await onUpdateAnnotation(octokit, checkId, conclusion, report.annotations, 'completed');
  } catch (e) {
    const error = e as Error;
    console.log('personal error: ', error.toString());
    core.setFailed(error.message);
  }
})();
