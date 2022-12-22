import * as core from '@actions/core';

/**
 * github action inputs
 */
const githubToken = core.getInput('token', { required: true });
const checkName = core.getInput('check-name') || 'ESLint Annotation Report Analysis';
const eslintReportFile = core.getInput('eslint-report-json', { required: true });

export default {
  token: githubToken,
  checkName,
  eslintReportFile,
};
