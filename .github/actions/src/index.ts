import * as core from '@actions/core';
import eslintJsonReportToJsObject from './eslintReportJsonToObject';
import inputs from './inputs';
import { getPullRequestChangedAnalyzedReport } from './analyzedReport';
import { createStatusCheck, onCheckRateLimitingError } from './checksApi';
(async () => {
  try {
    /**
     * Eslint report to javascript object conversion
     */
    const parsedEslintReportJs = eslintJsonReportToJsObject(inputs?.eslintReportFile);

    const { checkId } = await createStatusCheck();

    const report = await getPullRequestChangedAnalyzedReport(parsedEslintReportJs);

    const conclusion = report?.annotations?.length ? (report?.success ? 'success' : 'failure') : 'success';

    await onCheckRateLimitingError(checkId, conclusion, report, 'completed');

    if (conclusion === 'failure') {
      core.setFailed('Fix this pipeline by resolving the pull request error');
    }
  } catch (e) {
    const error = e as Error;
    console.log('personal error: ', error.toString());
    core.setFailed(error.message);
  }
})();
