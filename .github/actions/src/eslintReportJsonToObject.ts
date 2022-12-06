import fs from 'fs';
import path from 'path';
import type { ESLintReport } from './types';

/**
 * Converts an ESLint report JSON file to a JavaScript object
 * @param eslintReportFile path to an ESLint JSON file
 */
export default function eslintJsonReportToJsObject(eslintReportFile: string): ESLintReport {
  const reportPath = path.resolve(eslintReportFile);
  if (!fs.existsSync(reportPath)) {
    throw new Error(`The report-json file "${eslintReportFile}" could not be resolved.`);
  }
  const reportContents = fs.readFileSync(reportPath, 'utf-8');
  const parsedReport: ESLintReport = JSON.parse(reportContents);
  return parsedReport;
}
