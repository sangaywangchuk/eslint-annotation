import * as core from '@actions/core';
import * as github from '@actions/github';
import eslintJsonReportToJsObject from './eslintReportJsonToObject';
import inputs from './inputs';
(async () => {
  /**
   * get User inputs
   */

  const { sha, githubContext, owner, repo, checkName, eslintReportFile } = inputs;
  const parsedEslintReportJs = eslintJsonReportToJsObject(eslintReportFile);
  core.debug(`Starting analysis of the ESLint report json to javascript object`);
  console.log('report2', parsedEslintReportJs);

  try {
    core.notice('github action');
  } catch (e) {
    const error = e as Error;
    core.debug(error.toString());
    core.setFailed(error.message);
  }
})();
