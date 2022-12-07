import * as core from '@actions/core';
import * as github from '@actions/github';
import eslintJsonReportToJsObject from './eslintReportJsonToObject';
import inputs from './inputs';
import getAnalyzedReport, { getPullRequestChangedAnalyzedReport } from './analyzedReport';
import { createStatusCheck, updateCheckRun, closeStatusCheck } from './checksApi';
(async () => {
  try {
    core.debug(`Starting analysis of the ESLint report json to javascript object`);
    const { token, eslintReportFile } = inputs;
    console.log('inputs: ', inputs);
    const parsedEslintReportJs = eslintJsonReportToJsObject(eslintReportFile);
    // const analyzedReport = getAnalyzedReport(parsedEslintReportJs);
    // console.log('analyzedReport: ', analyzedReport);
    // const conclusion = analyzedReport.success ? 'success' : 'failure';
    const octokit = github.getOctokit(token);
    await getPullRequestChangedAnalyzedReport(parsedEslintReportJs, octokit);
    const checkId = await createStatusCheck(octokit);

    // await updateCheckRun(octokit, checkId, analyzedReport.annotations);

    // await closeStatusCheck(octokit, conclusion, checkId, analyzedReport.summary);
  } catch (e) {
    const error = e as Error;
    core.debug(error.toString());
    core.setFailed(error.message);
  }
})();
