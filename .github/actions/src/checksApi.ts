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
 * To an existing GitHub check run, add annotations.
 * @param octokit octokit.checks.update parameters
 * @param checkId The check run's ID that you want to annotate
 * @param conclusion
 * @param annotations an array of annotation objects. See https://developer.github.com/v3/checks/runs/#annotations-object-1
 * @param status
 */
export const onRateLimitingError = async (
  octokit: InstanceType<typeof GitHub>,
  checkId: number,
  conclusion: string,
  annotations: ChecksUpdateParamsOutputAnnotations[],
  status: string,
  text: string
): Promise<void> => {
  /**
   * We need to send numerous API queries if there are more than 50 annotations in order to prevent rate limiting errors.
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
      await updateChecksRun(octokit, checkId, finalConclusion, batchMessage, annotationBatch, status, text);
    }
  } else {
    const message = 'NO ERROR its Ready for merge';
    await updateChecksRun(octokit, checkId, conclusion, message, annotations, status);
  }
};

/**
 * Update the GitHub check with the annotations from the report analysis.
 * @param octokit
 * @param checkId The ID of the check run to add annotations to
 * @param conclusion
 * @param summary
 * @param annotations An array of annotation objects. See https://developer.github.com/v3/checks/runs/#annotations-object-1
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
  status: string,
  text?: string
) => {
  return await octokit.rest.checks.update({
    ...ownership,
    check_run_id: checkId,
    status,
    conclusion,
    output: {
      title: checkName,
      summary,
      text,
      annotations,
    },
  });
};
