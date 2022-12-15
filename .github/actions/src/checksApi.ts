import inputs from './inputs';
import * as core from '@actions/core';
const { sha, ownership, checkName, repo, owner, pullRequest } = inputs;
import { GitHub } from '@actions/github/lib/utils';
import { AnalyzedESLintReport, ChecksUpdateParamsOutputAnnotations, PullRequest } from './types';
/**
 * Create a new GitHub check run
 * @param options octokit.checks.create parameters
 */

const formatDate = (): string => {
  return new Date().toISOString();
};

export const createStatusCheck = async (
  octokit: InstanceType<typeof GitHub>
): Promise<{ checkId: number; pullRequest: any }> => {
  const { data } = await octokit.rest.checks.create({
    ...ownership,
    started_at: formatDate(),
    head_sha: sha,
    status: 'in_progress',
    name: checkName,
    mediaType: {
      previews: ['antiope'],
    },
  });
  console.log('data', data);
  return { checkId: data.id, pullRequest: data.pull_requests };
};

/**
 * Add annotations to an existing GitHub check run
 * @param annotations an array of annotation objects. See https://developer.github.com/v3/checks/runs/#annotations-object-1
 * @param checkId the ID of the check run to add annotations to
 */
export const updateCheckRun = async (
  octokit: InstanceType<typeof GitHub>,
  checkId: number,
  conclusion: string,
  annotations: ChecksUpdateParamsOutputAnnotations[],
  status: string
): Promise<void> => {
  /**
   * Update the GitHub check with the
   * annotations from the report analysis.
   *
   * If there are more than 50 annotations
   * we need to make multiple API requests
   * to avoid rate limiting errors
   *
   * See https://developer.github.com/v3/checks/runs/#output-object-1
   */
  const numberOfAnnotations = annotations.length;
  const batchSize = 50;
  const numBatches = Math.ceil(numberOfAnnotations / batchSize);
  for (let batch = 1; batch <= numBatches; batch++) {
    const batchMessage = `Found ${numberOfAnnotations} ESLint errors and warnings, processing batch ${batch} of ${numBatches}...`;
    const annotationBatch = annotations.splice(0, batchSize);
    status = batch >= numBatches ? 'completed' : 'in_progress';
    const finalConclusion = status === 'completed' ? conclusion : null;
    const { data } = await octokit.rest.checks.update({
      ...ownership,
      check_run_id: checkId,
      status,
      conclusion: finalConclusion,
      output: {
        title: checkName,
        summary: batchMessage,
        annotations: annotationBatch,
      },
      /**
       * The check run API is still in beta and the developer preview must be opted into
       * See https://developer.github.com/changes/2018-05-07-new-checks-api-public-beta/
       */
      mediaType: {
        previews: ['antiope'],
      },
    });
    console.log('update status');
    console.log('updated data: ', data);
  }
};

export const closeStatusCheck = async (
  octokit: InstanceType<typeof GitHub>,
  conclusion: string,
  checkId: number,
  analyzedReport: AnalyzedESLintReport
): Promise<void> => {
  try {
    console.log('conclusion: ', conclusion);
    console.log('checkId: ', checkId);
    // https://developer.github.com/v3/checks/runs/#create-a-check-run
    // https://octokit.github.io/rest.js/v16#checks-create
    const { data } = await octokit.rest.checks.create({
      ...ownership,
      name: 'create Pull request to see to more result',
      status: 'completed',
      conclusion,
      completed_at: formatDate(),
      check_run_id: checkId,
      output: {
        title: checkName,
        text: analyzedReport.markdown,
        summary: analyzedReport.summary,
      },
    });
  } catch (err) {
    const error = err as Error;
    core.debug(error.toString());
    core.setFailed(error.message + 'Annotation updated failed');
  }
};
