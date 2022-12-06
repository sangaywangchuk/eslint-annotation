import inputs from './inputs';
const { sha, ownership, checkName } = inputs;
import { GitHub } from '@actions/github/lib/utils';

/**
 * Create a new GitHub check run
 * @param options octokit.checks.create parameters
 */

const formatDate = (): string => {
  return new Date().toISOString();
};

export const createStatusCheck = async (octokit: InstanceType<typeof GitHub>): Promise<number> => {
  const { data } = await octokit.rest.checks.create({
    ...ownership,
    started_at: formatDate(),
    head_sha: sha,
    status: 'in_progress',
    name: checkName,
    /**
     * The check run API is still in beta and the developer preview must be opted into
     * See https://developer.github.com/changes/2018-05-07-new-checks-api-public-beta/
     */
    mediaType: {
      previews: ['antiope'],
    },
  });
  return data.id;
};
