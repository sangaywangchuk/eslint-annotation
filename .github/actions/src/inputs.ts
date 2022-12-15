import * as core from '@actions/core';
import * as github from '@actions/github';
import { PullRequest } from './types';
const githubToken = core.getInput('token', { required: true });
const ownership = {
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
};
const sha = github.context.sha;
const checkName = core.getInput('check-name') || 'ESLint Annotation Report Analysis';
const eslintReportFile = core.getInput('eslint-report-json', { required: true });
// If this is a pull request, store the context
// Otherwise, set to false
// const isPullRequest = Object.prototype.hasOwnProperty.call(github.context.payload, 'pull_request');
// const pullRequest = (isPullRequest ? github.context.payload.pull_request : false) as PullRequest;
const isPullRequest = false;
const pullRequest = false as any;
export default {
  token: githubToken,
  sha: sha,
  ownership,
  isPullRequest,
  pullRequest,
  githubWorkSpace: process.env.GITHUB_WORKSPACE as string,
  githubContext: github.context,
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  checkName,
  eslintReportFile,
};
