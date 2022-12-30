import inputs from './inputs';
import utils from './utils';
import { AnalyzedESLintReport, ChecksUpdateParamsOutputAnnotations } from './types';

/**
 *
 * @returns current date
 */
const formatDate = (): string => {
  return new Date()?.toISOString();
};

/**
 * Create a new GitHub check run
 * @param octokit octokit.checks.create parameters
 */
export const createStatusCheck = async (): Promise<{ checkId: number }> => {
  const { data } = await utils?.octokit?.rest?.checks?.create({
    ...utils?.ownership,
    started_at: formatDate(),
    head_sha: utils?.sha,
    status: 'in_progress',
    name: inputs?.checkName,
  });
  return { checkId: data?.id };
};

/**
 * On check rate limiting error.
 * @param octokit octokit.checks.update parameters
 * @param checkId the check run's ID that you want to annotate
 * @param conclusion
 * @param annotations an array of annotation objects. See https://developer.github.com/v3/checks/runs/#annotations-object-1
 * @param status the current status.
 */
export const onCheckRateLimitingError = async (
  checkId: number,
  conclusion: string,
  report: AnalyzedESLintReport,
  status: string
): Promise<void> => {
  /**
   * We need to send numerous API queries if there are more than 50 annotations in order to prevent rate limiting errors.
   * See https://developer.github.com/v3/checks/runs/#output-object-1
   */

  if (!report?.annotations?.length) {
    const message = `## Eslint checks successfully completed. No Error and warning!!! \n`;
    const text =
      '![This is a alt text.](https://images.selise.club/6add5d48b5e77bc5848e58a35d5cadef.webp "completed.")';
    await updateChecksRun(checkId, conclusion, message, report?.annotations, status, text);
    return;
  }
  const numberOfAnnotations = report?.annotations?.length;
  const batchSize = 50;
  const batchesLimit = Math.ceil(numberOfAnnotations / batchSize);
  for (let batch = 1; batch <= batchesLimit; batch++) {
    const batchMessage = `${numberOfAnnotations} ESLint warnings and errors were found in this pull request when processing batch ${batch}.`;
    const annotationBatch = report?.annotations?.splice(0, batchSize);
    status = batch >= batchesLimit ? 'completed' : 'in_progress';
    const finalConclusion = status === 'completed' ? conclusion : null;
    await updateChecksRun(checkId, finalConclusion, batchMessage, annotationBatch, status, report?.markdown);
  }
};

/**
 * Update the GitHub check with the annotations from the report analysis.
 * @param octokit instance
 * @param checkId the check run's ID that you want to annotate
 * @param conclusion
 * @param summary of the check run
 * @param annotations an array of annotation objects. See https://developer.github.com/v3/checks/runs/#annotations-object-1
 * @param status the current status.
 * @returns
 * The check run API is still in beta and the developer preview must be opted into
 * See https://developer.github.com/changes/2018-05-07-new-checks-api-public-beta/
 */
const updateChecksRun = async (
  checkId: number,
  conclusion: string | null,
  summary: string,
  annotations: ChecksUpdateParamsOutputAnnotations[],
  status: string,
  text: string
) => {
  return await utils?.octokit?.rest?.checks?.update({
    ...utils?.ownership,
    check_run_id: checkId,
    status,
    conclusion,
    output: {
      title: inputs?.checkName,
      summary,
      text,
      annotations,
    },
  });
};
