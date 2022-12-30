import * as core from '@actions/core';

/**
 * Github action inputs
 */
const githubToken = core?.getInput('token', { required: true });
const checkName = core?.getInput('check-name', { required: false });
const eslintReportFile = core?.getInput('eslint-report-json', { required: true });

export default {
  token: githubToken,
  checkName,
  eslintReportFile,
};
