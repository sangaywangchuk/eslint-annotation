import type { ESLintReport, ChecksUpdateParamsOutputAnnotations, AnalyzedESLintReport } from './types';
import inputs from './inputs';
import { GitHub } from '@actions/github/lib/utils';
const { sha, githubContext, owner, repo, checkName, eslintReportFile, githubWorkSpace, pullRequest } = inputs;

/**
 * Analyzes an ESLint report JS object and returns a report
 * @param files a JavaScript representation of an ESLint JSON report
 */
export default function getAnalyzedReport(files: ESLintReport): AnalyzedESLintReport {
  console.log('getAnalyzedReport');
  // Create markdown placeholder
  let markdownText = '';

  // Start the error and warning counts at 0
  let errorCount = 0;
  let warningCount = 0;

  // Create text string placeholders
  let errorText = '';
  let warningText = '';

  // Create an array for annotations
  const annotations: ChecksUpdateParamsOutputAnnotations[] = [];

  // Loop through each file
  for (const file of files) {
    // Get the file path and any warning/error messages
    const { filePath, messages } = file;

    console.log(`Analyzing ${filePath}`);

    // Skip files with no error or warning messages
    if (!messages.length) {
      continue;
    }

    /**
     * Increment the error and warning counts by
     * the number of errors/warnings for this file
     * and note files in the PR
     */
    errorCount += file.errorCount;
    warningCount += file.warningCount;

    // Loop through all the error/warning messages for the file
    for (const lintMessage of messages) {
      // Pull out information about the error/warning message
      const { line, column, severity, ruleId, message } = lintMessage;

      // If there's no rule ID (e.g. an ignored file warning), skip
      if (!ruleId) continue;

      const endLine = lintMessage.endLine ? lintMessage.endLine : line;
      const endColumn = lintMessage.endColumn ? lintMessage.endColumn : column;

      // Check if it a warning or error
      const isWarning = severity < 2;

      // Trim the absolute path prefix from the file path
      const filePathTrimmed: string = filePath.replace(`${githubWorkSpace}/`, '');
      console.log(`Analyzing filePathTrimmed:  ${filePathTrimmed}`);
      /**
       * Create a GitHub annotation object for the error/warning
       * See https://developer.github.com/v3/checks/runs/#annotations-object
       */
      const annotation: ChecksUpdateParamsOutputAnnotations = {
        path: filePathTrimmed,
        start_line: line,
        end_line: endLine,
        annotation_level: isWarning ? 'warning' : 'failure',
        message: `[${ruleId}] ${message}`,
      };

      /**
       * Start and end column can only be added to the
       * annotation if start_line and end_line are equal
       */
      if (line === endLine) {
        annotation.start_column = column;
        if (endColumn !== null) {
          annotation.end_column = endColumn;
        }
      }

      // Add the annotation object to the array
      annotations.push(annotation);

      /**
       * Develop user-friendly markdown message
       * text for the error/warning
       */
      const link = `https://github.com/${owner}/${repo}/blob/${sha}/${filePathTrimmed}#L${line}:L${endLine}`;

      let messageText = `### [\`${filePathTrimmed}\` line \`${line.toString()}\`](${link})\n`;
      messageText += '- Start Line: `' + line.toString() + '`\n';
      messageText += '- End Line: `' + endLine.toString() + '`\n';
      messageText += '- Message: ' + message + '\n';
      messageText += '  - From: [`' + ruleId + '`]\n';

      // Add the markdown text to the appropriate placeholder
      if (isWarning) {
        warningText += messageText;
      } else {
        errorText += messageText;
      }
    }
  }

  // If there is any markdown error text, add it to the markdown output
  if (errorText.length) {
    markdownText += '## ' + errorCount.toString() + ' Error(s):\n';
    markdownText += errorText + '\n';
  }

  // If there is any markdown warning text, add it to the markdown output
  if (warningText.length) {
    markdownText += '## ' + warningCount.toString() + ' Warning(s):\n';
    markdownText += warningText + '\n';
  }

  let success = errorCount === 0;

  // Return the ESLint report analysis
  return {
    errorCount,
    warningCount,
    markdown: markdownText,
    success,
    summary: `${errorCount} ESLint error(s) and ${warningCount} ESLint warning(s) found`,
    annotations,
  };
}

export async function getPullRequestChangedAnalyzedReport(
  reportJS: ESLintReport,
  octokit: InstanceType<typeof GitHub>,
  number: number
): Promise<AnalyzedESLintReport> {
  console.log('getPullRequestChangedAnalyzedReport');
  const a = {
    owner: owner,
    repo: repo,
    pull_number: number,
  };
  console.log('octokit.rest.pulls.listFiles: ', a);
  const { data } = await octokit.rest.pulls.listFiles({
    owner: owner,
    repo: repo,
    pull_number: number,
  });
  console.log('githubWorkSpace: ', githubWorkSpace);
  const changedFiles = data.map((prFiles) => prFiles.filename);
  console.log('changedFiles :', changedFiles);

  const pullRequestFilesReportJS: ESLintReport = reportJS.filter((file) => {
    file.filePath = file.filePath.replace(githubWorkSpace + '/', '');
    console.log(changedFiles.indexOf(file.filePath), file.filePath);
    return changedFiles.indexOf(file.filePath) !== -1;
  });
  const nonPullRequestFilesReportJS: ESLintReport = reportJS.filter((file) => {
    file.filePath = file.filePath.replace(githubWorkSpace + '/', '');
    return changedFiles.indexOf(file.filePath) === -1;
  });
  console.log('pullRequestFilesReportJS: ', pullRequestFilesReportJS);

  const analyzedPullRequestReport = getAnalyzedReport(pullRequestFilesReportJS);
  console.log('analyzedPullRequestReport: ', analyzedPullRequestReport);
  const combinedSummary = `${analyzedPullRequestReport.summary} in pull request changed files.`;
  const combinedMarkdown = `# Pull Request Changed Files ESLint Results: 
    **${analyzedPullRequestReport.summary}**
    ${analyzedPullRequestReport.markdown}
  `;
  return {
    errorCount: analyzedPullRequestReport.errorCount,
    warningCount: analyzedPullRequestReport.warningCount,
    markdown: combinedMarkdown,
    success: analyzedPullRequestReport.success,
    summary: combinedSummary,
    annotations: analyzedPullRequestReport.annotations,
  };
}
