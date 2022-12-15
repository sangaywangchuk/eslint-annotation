import * as core from '@actions/core';
import * as github from '@actions/github';
import eslintJsonReportToJsObject from './eslintReportJsonToObject';
import inputs from './inputs';
import getAnalyzedReport, { getPullRequestChangedAnalyzedReport } from './analyzedReport';
import { createStatusCheck, updateCheckRun, closeStatusCheck } from './checksApi';
(async () => {
  try {
    core.debug(`Starting analysis of the ESLint report json to javascript object`);
    const { token, sha, checkName, eslintReportFile, ownership, repo, owner } = inputs;
    console.log('inputs: ', inputs);
    const parsedEslintReportJs = eslintJsonReportToJsObject(eslintReportFile);
    console.log('parsedEslintReportJs: ', parsedEslintReportJs);
    // const analyzedReport = getAnalyzedReport(parsedEslintReportJs);
    // console.log('analyzedReport: ', analyzedReport);
    const octokit = github.getOctokit(token);
    const { checkId, pullRequest } = await createStatusCheck(octokit);
    console.log('checkId', checkId);
    console.log('pullRequest', pullRequest);

    if (pullRequest.length) {
      const report = await getPullRequestChangedAnalyzedReport(parsedEslintReportJs, octokit, pullRequest[0].number);
      const conclusion = report.success ? 'success' : 'failure';
      console.log('conclusion', conclusion);
      await updateCheckRun(octokit, checkId, conclusion, report.annotations, 'completed');
    } else {
      console.log('pullRequest', pullRequest);
      // await closeStatusCheck(octokit, conclusion, checkId, data.summary);
    }
  } catch (e) {
    const error = e as Error;
    console.log('personal error: ', error.toString());
    core.setFailed(error.message);
  }
})();
