import * as core from '@actions/core';
import * as github from '@actions/github';
import eslintJsonReportToJsObject from './eslintReportJsonToObject';
import inputs from './inputs';
import getAnalyzedReport from './analyzedReport';
(async () => {
  /**
   * get User inputs
   */

  try {
    const { token, sha, githubContext, owner, repo, checkName, eslintReportFile } = inputs;
    console.log('inputs', inputs);
    const parsedEslintReportJs = eslintJsonReportToJsObject(eslintReportFile);
    console.log('parsedEslintReport: ', parsedEslintReportJs);
    const analyzedReport = getAnalyzedReport(parsedEslintReportJs);
    console.log('analyzedReport: ', analyzedReport);
    const annotations = analyzedReport.annotations;
    console.log('annotations: ', annotations);
    const conclusion = analyzedReport.success ? 'success' : 'failure';
    console.log('conclusion: ', conclusion);
    console.log('summery: ', analyzedReport.summary);
    core.debug(`Starting analysis of the ESLint report json to javascript object`);
    core.notice('github action');
    const octokit = github.getOctokit(token);
    console.log('octokit: ', octokit);
  } catch (e) {
    const error = e as Error;
    core.debug(error.toString());
    core.setFailed(error.message);
  }
})();
