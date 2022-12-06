import * as core from '@actions/core';
import * as github from '@actions/github';
import eslintJsonReportToJsObject from './eslintReportJsonToObject';
import inputs from './inputs';
import getAnalyzedReport from './analyzedReport';
import { createStatusCheck } from './checksApi';
(async () => {
  /**
   * get User inputs
   */

  try {
    const { token, sha, githubContext, owner, repo, checkName, eslintReportFile } = inputs;
    console.log('inputs', inputs);
    const parsedEslintReportJs = eslintJsonReportToJsObject(eslintReportFile);
    const analyzedReport = getAnalyzedReport(parsedEslintReportJs);
    const annotations = analyzedReport.annotations;
    console.log('annotations: ', annotations);
    const conclusion = analyzedReport.success ? 'success' : 'failure';
    console.log('conclusion: ', conclusion);
    console.log('summery: ', analyzedReport.summary);
    core.debug(`Starting analysis of the ESLint report json to javascript object`);
    const octokit = github.getOctokit(inputs.token);
    const checkId = await createStatusCheck(octokit);
    console.log('checkId', checkId);
    console.log('octokit', octokit);
  } catch (e) {
    const error = e as Error;
    core.debug(error.toString());
    core.setFailed(error.message);
  }
})();
