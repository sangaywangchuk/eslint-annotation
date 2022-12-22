import * as core from '@actions/core';
import * as github from '@actions/github';
import { PullRequest } from './types';
const githubToken = core.getInput('token', { required: true });
const ownership = {
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
};
const prEvents = ['pull_request', 'pull_request_review', 'pull_request_review_comment', 'pull_request_target'];
const pushEvents = ['push'];
const sha = github?.context.payload?.pull_request?.head?.sha;
const checkName = core.getInput('check-name') || 'ESLint Annotation Report Analysis';
const eslintReportFile = core.getInput('eslint-report-json', { required: true });
// If this is a pull request, store the context
// Otherwise, set to false
const isPullRequest = Object.prototype.hasOwnProperty.call(github.context.payload, 'pull_request');
const pullRequest = (isPullRequest ? github.context.payload.pull_request : false) as PullRequest;

const getSha = (): string => {
  let sha = github.context.sha;
  /**
   * For Pull request events the last commit is on github.context.payload.pull_request.head.sha
   */
  if (prEvents.includes(github.context.eventName)) {
    const pull = github.context.payload.pull_request as PullRequest;
    sha = pull?.head.sha;
  }
  /**
   * For push events the last commit is on github.context.sha
   */
  if (pushEvents.includes(github.context.eventName)) {
    sha = github.context.sha;
  }
  return sha;
};

export default {
  token: githubToken,
  sha: getSha(),
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
