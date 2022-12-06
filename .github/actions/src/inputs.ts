import * as core from '@actions/core';
import * as github from '@actions/github';

// const githubToken = core.getInput('repo-token', { required: true });
const ownership = {
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
};
const sha = github.context.sha;
const checkName = core.getInput('check-name') || 'ESLint Annotation Report Analysis';
const eslintReportFile = core.getInput('eslint-report-json', { required: true });

export default {
  // token: githubToken,
  sha: sha,
  ownership,
  githubContext: github.context,
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  checkName,
  eslintReportFile,
};
