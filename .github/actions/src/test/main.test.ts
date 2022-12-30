import eslintJsonReportToJs from '../eslintReportJsonToObject';
import reportJSExpected from './mock/eslintReportJs';
const cwd = process.cwd();
describe('ESLint report JSON to JS', () => {
  it('Converts a standard ESLint JSON file to a JS object', async () => {
    const testReportPath = `${cwd}/src/test/mock/eslintReportJs.json`;
    const reportJS = eslintJsonReportToJs(testReportPath);
    expect(reportJS).toEqual(reportJSExpected);
  });
});
