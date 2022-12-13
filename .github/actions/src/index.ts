import * as core from '@actions/core';
import * as github from '@actions/github';
import eslintJsonReportToJsObject from './eslintReportJsonToObject';
import inputs from './inputs';
import getAnalyzedReport, { getPullRequestChangedAnalyzedReport } from './analyzedReport';
import { createStatusCheck, updateCheckRun, closeStatusCheck } from './checksApi';
import { GitHub } from '@actions/github/lib/utils';
(async () => {
  try {
    core.debug(`Starting analysis of the ESLint report json to javascript object`);
    const { token, eslintReportFile, pullRequest, repo, owner } = inputs;
    console.log('inputs: ', inputs);
    const parsedEslintReportJs = eslintJsonReportToJsObject(eslintReportFile);
    console.log('parsedEslintReportJs: ', parsedEslintReportJs);
    const analyzedReport = getAnalyzedReport(parsedEslintReportJs);
    // console.log('analyzedReport: ', analyzedReport);
    const octokit = github.getOctokit(token);
    const checkId = await createStatusCheck(octokit);
    const data = await getPullRequestChangedAnalyzedReport(parsedEslintReportJs, octokit);

    const conclusion = data.success ? 'success' : 'failure';
    console.log('conclusion', conclusion);
    await updateCheckRun(octokit, checkId, conclusion, data.annotations);

    // await closeStatusCheck(octokit, conclusion, checkId, data.summary);
  } catch (e) {
    const error = e as Error;
    core.debug(error.toString());
    core.setFailed(error.message);
  }
})();
