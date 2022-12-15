import * as core from '@actions/core';
import * as github from '@actions/github';
import eslintJsonReportToJsObject from './eslintReportJsonToObject';
import inputs from './inputs';
import getAnalyzedReport from './analyzedReport';
import { createStatusCheck, updateCheckRun, closeStatusCheck } from './checksApi';
(async () => {
  try {
    core.debug(`Starting analysis of the ESLint report json to javascript object`);
    const { token, eslintReportFile } = inputs;
    const parsedEslintReportJs = eslintJsonReportToJsObject(eslintReportFile);
    const analyzedReport = getAnalyzedReport(parsedEslintReportJs);
    console.log('analyzedReport: ', analyzedReport);
    const conclusion = analyzedReport.success ? 'success' : 'failure';
    const octokit = github.getOctokit(token);
    const checkId = await createStatusCheck(octokit);
<<<<<<< Updated upstream

    await updateCheckRun(octokit, checkId, analyzedReport.annotations);

    await closeStatusCheck(octokit, conclusion, checkId, analyzedReport.summary);
=======

    const data = await getPullRequestChangedAnalyzedReport(parsedEslintReportJs, octokit);

    const conclusion = data.success ? 'success' : 'failure';
    console.log('conclusion', conclusion);
    await updateCheckRun(octokit, checkId, conclusion, data.annotations, 'completed');

    await closeStatusCheck(octokit, conclusion, checkId, data.summary);
>>>>>>> Stashed changes
  } catch (e) {
    const error = e as Error;
    core.debug(error.toString());
    core.setFailed(error.message);
  }
})();
