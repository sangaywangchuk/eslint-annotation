import inputs from './inputs';
import utils from './utils';
const { checkName } = inputs;
const { sha, ownership } = utils;
import { GitHub } from '@actions/github/lib/utils';
import { ChecksUpdateParamsOutputAnnotations } from './types';
/**
 *
 * @returns current date
 */
const formatDate = (): string => {
  return new Date().toISOString();
};

/**
 * Create a new GitHub check run
 * @param octokit octokit.checks.create parameters
 */
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
 * @param octokit octokit.checks.update parameters
 * @param checkId the ID of the check run to add annotations to
 * @param conclusion
 * @param annotations an array of annotation objects. See https://developer.github.com/v3/checks/runs/#annotations-object-1
 * @param status
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
      await updateChecksRun(octokit, checkId, finalConclusion, batchMessage, annotationBatch, status);
    }
  } else {
    const message = 'NO ERROR its Ready for merge';
    await updateChecksRun(octokit, checkId, conclusion, message, annotations, status);
  }
};

/**
 * Add annotations to an existing GitHub check run
 * @param octokit
 * @param checkId the ID of the check run to add annotations to
 * @param conclusion
 * @param summary
 * @param annotations an array of annotation objects. See https://developer.github.com/v3/checks/runs/#annotations-object-1
 * @param status
 * @returns
 * The check run API is still in beta and the developer preview must be opted into
 * See https://developer.github.com/changes/2018-05-07-new-checks-api-public-beta/
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
  });
};
