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
  });
  return { checkId: data.id, pullRequest: data.pull_requests || [] };
};

/**
 * Add annotations to an existing GitHub check run
 * @param annotations an array of annotation objects. See https://developer.github.com/v3/checks/runs/#annotations-object-1
 * @param checkId the ID of the check run to add annotations to
 */
export const onUpdateAnnotation = async (
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
  if (annotations?.length) {
    const numberOfAnnotations = annotations.length;
    const batchSize = 50;
    const numBatches = Math.ceil(numberOfAnnotations / batchSize);
    for (let batch = 1; batch <= numBatches; batch++) {
      const batchMessage = `Found ${numberOfAnnotations} ESLint errors and warnings, processing batch ${batch} of ${numBatches}...`;
      const annotationBatch = annotations.splice(0, batchSize);
      status = batch >= numBatches ? 'completed' : 'in_progress';
      const finalConclusion = status === 'completed' ? conclusion : null;
      const { data } = await updateChecksRun(octokit, checkId, finalConclusion, batchMessage, annotationBatch, status);
      // const { data } = await octokit.rest.checks.update({
      //   ...ownership,
      //   check_run_id: checkId,
      //   status,
      //   conclusion: finalConclusion,
      //   output: {
      //     title: checkName,
      //     summary: batchMessage,
      //     annotations: annotationBatch,
      //   },
      /**
       * The check run API is still in beta and the developer preview must be opted into
       * See https://developer.github.com/changes/2018-05-07-new-checks-api-public-beta/
       */
      // });
      console.log('pull request file updated', data);
    }
  } else {
    const message = 'NO ERROR its Ready for merge';
    const { data } = await updateChecksRun(octokit, checkId, conclusion, message, annotations, status);
    console.log('pull request not updated, need to create ', data);

    // const { data } = await octokit.rest.checks.update({
    //   ...ownership,
    //   check_run_id: checkId,
    //   status,
    //   conclusion,
    //   output: {
    //     title: checkName,
    //     summary: 'Create Pull Request To see Eslint Annotation for affected files',
    //   },
    /**
     * The check run API is still in beta and the developer preview must be opted into
     * See https://developer.github.com/changes/2018-05-07-new-checks-api-public-beta/
     */
    // });
  }
};
/**
 * Add annotations to an existing GitHub check run
 * @param octokit
 * @param annotations an array of annotation objects. See https://developer.github.com/v3/checks/runs/#annotations-object-1
 * @param checkId the ID of the check run to add annotations to
 */
const updateChecksRun = async (
  octokit: InstanceType<typeof GitHub>,
  checkId: number,
  conclusion: string | null,
  summary: string,
  annotations: ChecksUpdateParamsOutputAnnotations[],
  status: string
) => {
  return await octokit.rest.checks.update({
    ...ownership,
    check_run_id: checkId,
    status,
    conclusion,
    output: {
      title: checkName,
      summary,
      annotations,
    },
    /**
     * The check run API is still in beta and the developer preview must be opted into
     * See https://developer.github.com/changes/2018-05-07-new-checks-api-public-beta/
     */
  });
};

// export const closeStatusCheck = async (
//   octokit: InstanceType<typeof GitHub>,
//   conclusion: string,
//   checkId: number,
//   analyzedReport: AnalyzedESLintReport
// ): Promise<void> => {
//   try {
//     console.log('conclusion: ', conclusion);
//     console.log('checkId: ', checkId);
//     const { data } = await octokit.rest.checks.update({
//       ...ownership,
//       check_run_id: checkId,
//       status: 'completed',
//       conclusion,
//       output: {
//         title: checkName,
//         summary: analyzedReport.summary,
//         text: analyzedReport.markdown,
//       },
//     });
//     console.log('closeStatusCheck: ', data);
//   } catch (err) {
//     const error = err as Error;
//     core.debug(error.toString());
//     console.log('hello');
//     core.setFailed(error.message + 'Annotation updated failed');
//   }
// };
