import fs from 'node:fs';
import { expect, test } from 'vitest';

import {
    getResults,
    getComparisonResults,
    runProductionBuild,
    INTEGRATION_REPO_OWNER,
    INTEGRATION_REPO_NAME,
    REPOSITORY_CACHE,
} from '../utils';

const DEBUG_LOG_PATTERN = /\[DEBUG (\S|:)*\] /g;
const ESLINT_CONFIG_ALL = `async function initialize() {
    const { default: js } = await import('@eslint/js');
    return [js.configs.all];
}`;

test('results are rendered on CI mode', async () => {
    const { output } = await runProductionBuild({ CI: true });
    const finalLog = output.pop();

    expect(finalLog).toMatchInlineSnapshot(`
      "Results:
      Repository: AriPerkkio/eslint-remote-tester-integration-test-target
      Rule: local-rules/some-unstable-rule
      Message: Cannot read property 'someAttribute' of undefined
      Occurred while linting <removed>/node_modules/.cache-eslint-remote-tester/AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js
      Rule: "local-rules/some-unstable-rule"
      Path: AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js
      Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/expected-to-crash-linter.js#L2

        1 | // Identifier.name = attributeForCrashing
      > 2 | window.attributeForCrashing();
        3 |

      Error:
      TypeError: Cannot read property 'someAttribute' of undefined
      Occurred while linting <removed>/node_modules/.cache-eslint-remote-tester/AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js
      Rule: "local-rules/some-unstable-rule"
          at Identifier (<removed>/eslint-local-rules.cjs:23:56)
          at ruleErrorHandler (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/linter.js)
          at <removed>/<package-manager-path>/node_modules/eslint/lib/linter/source-code-visitor.js
          at Array.forEach (<anonymous>)
          at SourceCodeVisitor.callSync (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/source-code-visitor.js)
          at <removed>/<package-manager-path>/node_modules/eslint/lib/linter/source-code-traverser.js
          at Array.forEach (<anonymous>)
          at SourceCodeTraverser.traverseSync (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/source-code-traverser.js)
          at runRules (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/linter.js)
          at #flatVerifyWithoutProcessors (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/linter.js)

      Repository: AriPerkkio/eslint-remote-tester-integration-test-target
      Rule: no-undef
      Message: 'bar' is not defined.
      Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
      Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L1-L1

      > 1 | var foo = bar;
          |           ^^^
        2 |
        3 | if (foo) {
        4 | }

      Repository: AriPerkkio/eslint-remote-tester-integration-test-target
      Rule: no-empty
      Message: Empty block statement.
      Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
      Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L3-L4

        1 | var foo = bar;
        2 |
      > 3 | if (foo) {
          |          ^
      > 4 | }
          | ^^
        5 |
        6 | var p = {
        7 |     get name(){

      Repository: AriPerkkio/eslint-remote-tester-integration-test-target
      Rule: getter-return
      Message: Expected to return a value in getter 'name'.
      Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
      Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L7-L7

         5 |
         6 | var p = {
      >  7 |     get name(){
           |     ^^^^^^^^
         8 |         // no returns.
         9 |     }
        10 | };

      Repository: AriPerkkio/eslint-remote-tester-integration-test-target
      Rule: no-compare-neg-zero
      Message: Do not use the '===' operator to compare against -0.
      Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
      Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L14-L14

        12 |
        13 |
      > 14 | if (foo === -0) {
           |     ^^^^^^^^^^
        15 |   // prevent no-empty
        16 | }


      "
    `);
});

test('results are written to file system on CLI mode', async () => {
    await runProductionBuild({ CI: false });
    const results = getResults();

    expect(results).toMatchInlineSnapshot(`
      "## Rule: local-rules/some-unstable-rule

      -   Message: \`Cannot read property 'someAttribute' of undefined Occurred while linting <removed>/node_modules/.cache-eslint-remote-tester/AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js Rule: "local-rules/some-unstable-rule"\`
      -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js\`
      -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/expected-to-crash-linter.js#L2)

      \`\`\`js
        1 | // Identifier.name = attributeForCrashing
      > 2 | window.attributeForCrashing();
        3 |
      \`\`\`

      \`\`\`
      TypeError: Cannot read property 'someAttribute' of undefined
      Occurred while linting <removed>/node_modules/.cache-eslint-remote-tester/AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js
      Rule: "local-rules/some-unstable-rule"
          at Identifier (<removed>/eslint-local-rules.cjs:23:56)
          at ruleErrorHandler (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/linter.js)
          at <removed>/<package-manager-path>/node_modules/eslint/lib/linter/source-code-visitor.js
          at Array.forEach (<anonymous>)
          at SourceCodeVisitor.callSync (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/source-code-visitor.js)
          at <removed>/<package-manager-path>/node_modules/eslint/lib/linter/source-code-traverser.js
          at Array.forEach (<anonymous>)
          at SourceCodeTraverser.traverseSync (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/source-code-traverser.js)
          at runRules (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/linter.js)
          at #flatVerifyWithoutProcessors (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/linter.js)
      \`\`\`

      ## Rule: no-undef

      -   Message: \`'bar' is not defined.\`
      -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
      -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L1-L1)

      \`\`\`js
      > 1 | var foo = bar;
          |           ^^^
        2 |
        3 | if (foo) {
        4 | }
      \`\`\`

      ## Rule: no-empty

      -   Message: \`Empty block statement.\`
      -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
      -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L3-L4)

      \`\`\`js
        1 | var foo = bar;
        2 |
      > 3 | if (foo) {
          |          ^
      > 4 | }
          | ^^
        5 |
        6 | var p = {
        7 |     get name(){
      \`\`\`

      ## Rule: getter-return

      -   Message: \`Expected to return a value in getter 'name'.\`
      -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
      -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L7-L7)

      \`\`\`js
         5 |
         6 | var p = {
      >  7 |     get name(){
           |     ^^^^^^^^
         8 |         // no returns.
         9 |     }
        10 | };
      \`\`\`

      ## Rule: no-compare-neg-zero

      -   Message: \`Do not use the '===' operator to compare against -0.\`
      -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
      -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L14-L14)

      \`\`\`js
        12 |
        13 |
      > 14 | if (foo === -0) {
           |     ^^^^^^^^^^
        15 |   // prevent no-empty
        16 | }
      \`\`\`
      "
    `);
});

test('final log is rendered on CLI mode', async () => {
    const { output } = await runProductionBuild({ CI: false });
    const finalLog = output.pop();

    expect(finalLog).toMatchInlineSnapshot(`
        "Full log:
        [ERROR] AriPerkkio/eslint-remote-tester-integration-test-target crashed: local-rules/some-unstable-rule
        [ERROR] AriPerkkio/eslint-remote-tester-integration-test-target 5 errors
        [DONE] Finished scan of 1 repositories
        [INFO] Cached repositories (1) at ./node_modules/.cache-eslint-remote-tester

        "
    `);
});

test('excludes files matching exclude pattern', async () => {
    const { output } = await runProductionBuild({ CI: true });
    const finalLog = output.pop();

    expect(finalLog).not.toMatch('expected-to-be-excluded');
});

test('repositories are cached', async () => {
    const cleanRun = await runProductionBuild({ CI: true });

    expect(cleanRun.output.some(row => /CLONING/.test(row))).toBe(true);
    expect(fs.existsSync(REPOSITORY_CACHE)).toBe(true);

    const cachedRun = await runProductionBuild({ CI: true });

    expect(cachedRun.output.some(row => /CLONING/.test(row))).toBe(false);
    expect(cachedRun.output.some(row => /PULLING/.test(row))).toBe(true);
    expect(fs.existsSync(REPOSITORY_CACHE)).toBe(true);
});

test('repository caching can be disabled', async () => {
    await runProductionBuild({ cache: false });

    expect(fs.existsSync(REPOSITORY_CACHE)).toBe(false);
});

test('cache status is rendered on CLI mode', async () => {
    const cleanRun = await runProductionBuild({ CI: false });

    expect(cleanRun.output.pop()).toMatchInlineSnapshot(`
        "Full log:
        [ERROR] AriPerkkio/eslint-remote-tester-integration-test-target crashed: local-rules/some-unstable-rule
        [ERROR] AriPerkkio/eslint-remote-tester-integration-test-target 5 errors
        [DONE] Finished scan of 1 repositories
        [INFO] Cached repositories (1) at ./node_modules/.cache-eslint-remote-tester

        "
    `);

    const cachedRun = await runProductionBuild({ CI: false });

    expect(cachedRun.output.pop()).toMatchInlineSnapshot(`
        "Full log:
        [INFO] Cached repositories (1) at ./node_modules/.cache-eslint-remote-tester
        [ERROR] AriPerkkio/eslint-remote-tester-integration-test-target crashed: local-rules/some-unstable-rule
        [ERROR] AriPerkkio/eslint-remote-tester-integration-test-target 5 errors
        [DONE] Finished scan of 1 repositories
        [INFO] Cached repositories (1) at ./node_modules/.cache-eslint-remote-tester

        "
    `);
});

test('progress is displayed on CI mode', async () => {
    const { output } = await runProductionBuild({ CI: true });
    const repository = `${INTEGRATION_REPO_OWNER}/${INTEGRATION_REPO_NAME}`;

    const [
        startMessage,
        cloneMessage,
        readMessage,
        lintStartMessage,
        lintCrashMessage,
        lintDoneMessage,
        scanDoneMessage,
    ] = output;

    expect(startMessage).toMatch(`[STARTING] ${repository}`);
    expect(cloneMessage).toMatch(`[CLONING] ${repository}`);
    expect(readMessage).toMatch(`[READING] ${repository}`);
    expect(lintStartMessage).toMatch(`[LINTING] ${repository} - 2 files`);
    expect(lintCrashMessage).toMatch(`[ERROR] ${repository} crashed`);
    expect(lintDoneMessage).toMatch(`[ERROR] ${repository} 5 errors`);
    expect(scanDoneMessage).toMatch(`[DONE] Finished scan of 1 repositories`);
});

test('resultParser option is used on CI mode', async () => {
    const { output } = await runProductionBuild({
        CI: true,
        resultParser: 'markdown',
    });

    const finalLog = output.pop();

    expect(finalLog).toMatch('## Rule');
});

test('resultParser option is used on CLI mode', async () => {
    await runProductionBuild({ CI: false, resultParser: 'plaintext' });

    const results = getResults('');

    expect(results).toMatch('Rule');
    expect(results).not.toMatch('## Rule');
});

test('erroneous scan exits with error code', async () => {
    const { exitCode } = await runProductionBuild();

    expect(exitCode).toBe(1);
});

test('successful scan exits without error code', async () => {
    const { exitCode } = await runProductionBuild({
        rulesUnderTesting: [],
        eslintConfig: [],
    });

    expect(exitCode).toBe(0);
});

test('calls onComplete hook with the results', async () => {
    const { output } = await runProductionBuild({
        CI: true,
        onComplete: function onComplete(results, _, repositoryCount) {
            console.log(`[TEST-ON-COMPLETE-START]`);

            console.log(`[REPOSITORY-COUNT-START]`);
            console.log(repositoryCount);
            console.log(`[REPOSITORY-COUNT-END]`);

            results.forEach(result => {
                Object.entries(result).forEach(([key, value]) => {
                    if (key === `__internalHash`) return;
                    const block = `[${key.toUpperCase()}]`;

                    console.log(`.`);
                    console.log(block);
                    console.log(value);
                    console.log(block);
                });
            });

            console.log(`[TEST-ON-COMPLETE-END]`);
        },
    });

    const [onCompleteCall] = output
        .join('\n')
        .match(/\[TEST-ON-COMPLETE-START\]([\s|\S]*)\[TEST-ON-COMPLETE-END\]/)!;

    expect(onCompleteCall).toMatchInlineSnapshot(`
      "[TEST-ON-COMPLETE-START]
      [REPOSITORY-COUNT-START]
      1
      [REPOSITORY-COUNT-END]
      .
      [REPOSITORY]
      eslint-remote-tester-integration-test-target
      [REPOSITORY]
      .
      [REPOSITORYOWNER]
      AriPerkkio
      [REPOSITORYOWNER]
      .
      [RULE]
      local-rules/some-unstable-rule
      [RULE]
      .
      [MESSAGE]
      Cannot read property 'someAttribute' of undefined
      Occurred while linting <removed>/node_modules/.cache-eslint-remote-tester/AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js
      Rule: "local-rules/some-unstable-rule"
      [MESSAGE]
      .
      [PATH]
      AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js
      [PATH]
      .
      [LINK]
      https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/expected-to-crash-linter.js#L2
      [LINK]
      .
      [EXTENSION]
      js
      [EXTENSION]
      .
      [SOURCE]
        1 | // Identifier.name = attributeForCrashing
      > 2 | window.attributeForCrashing();
        3 |
      [SOURCE]
      .
      [ERROR]
      TypeError: Cannot read property 'someAttribute' of undefined
      Occurred while linting <removed>/node_modules/.cache-eslint-remote-tester/AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js
      Rule: "local-rules/some-unstable-rule"
          at Identifier (<removed>/eslint-local-rules.cjs:23:56)
          at ruleErrorHandler (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/linter.js)
          at <removed>/<package-manager-path>/node_modules/eslint/lib/linter/source-code-visitor.js
          at Array.forEach (<anonymous>)
          at SourceCodeVisitor.callSync (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/source-code-visitor.js)
          at <removed>/<package-manager-path>/node_modules/eslint/lib/linter/source-code-traverser.js
          at Array.forEach (<anonymous>)
          at SourceCodeTraverser.traverseSync (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/source-code-traverser.js)
          at runRules (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/linter.js)
          at #flatVerifyWithoutProcessors (<removed>/<package-manager-path>/node_modules/eslint/lib/linter/linter.js)
      [ERROR]
      .
      [REPOSITORY]
      eslint-remote-tester-integration-test-target
      [REPOSITORY]
      .
      [REPOSITORYOWNER]
      AriPerkkio
      [REPOSITORYOWNER]
      .
      [RULE]
      no-undef
      [RULE]
      .
      [MESSAGE]
      'bar' is not defined.
      [MESSAGE]
      .
      [PATH]
      AriPerkkio/eslint-remote-tester-integration-test-target/index.js
      [PATH]
      .
      [LINK]
      https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L1-L1
      [LINK]
      .
      [EXTENSION]
      js
      [EXTENSION]
      .
      [SOURCE]
      > 1 | var foo = bar;
          |           ^^^
        2 |
        3 | if (foo) {
        4 | }
      [SOURCE]
      .
      [ERROR]
      undefined
      [ERROR]
      .
      [REPOSITORY]
      eslint-remote-tester-integration-test-target
      [REPOSITORY]
      .
      [REPOSITORYOWNER]
      AriPerkkio
      [REPOSITORYOWNER]
      .
      [RULE]
      no-empty
      [RULE]
      .
      [MESSAGE]
      Empty block statement.
      [MESSAGE]
      .
      [PATH]
      AriPerkkio/eslint-remote-tester-integration-test-target/index.js
      [PATH]
      .
      [LINK]
      https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L3-L4
      [LINK]
      .
      [EXTENSION]
      js
      [EXTENSION]
      .
      [SOURCE]
        1 | var foo = bar;
        2 |
      > 3 | if (foo) {
          |          ^
      > 4 | }
          | ^^
        5 |
        6 | var p = {
        7 |     get name(){
      [SOURCE]
      .
      [ERROR]
      undefined
      [ERROR]
      .
      [REPOSITORY]
      eslint-remote-tester-integration-test-target
      [REPOSITORY]
      .
      [REPOSITORYOWNER]
      AriPerkkio
      [REPOSITORYOWNER]
      .
      [RULE]
      getter-return
      [RULE]
      .
      [MESSAGE]
      Expected to return a value in getter 'name'.
      [MESSAGE]
      .
      [PATH]
      AriPerkkio/eslint-remote-tester-integration-test-target/index.js
      [PATH]
      .
      [LINK]
      https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L7-L7
      [LINK]
      .
      [EXTENSION]
      js
      [EXTENSION]
      .
      [SOURCE]
         5 |
         6 | var p = {
      >  7 |     get name(){
           |     ^^^^^^^^
         8 |         // no returns.
         9 |     }
        10 | };
      [SOURCE]
      .
      [ERROR]
      undefined
      [ERROR]
      .
      [REPOSITORY]
      eslint-remote-tester-integration-test-target
      [REPOSITORY]
      .
      [REPOSITORYOWNER]
      AriPerkkio
      [REPOSITORYOWNER]
      .
      [RULE]
      no-compare-neg-zero
      [RULE]
      .
      [MESSAGE]
      Do not use the '===' operator to compare against -0.
      [MESSAGE]
      .
      [PATH]
      AriPerkkio/eslint-remote-tester-integration-test-target/index.js
      [PATH]
      .
      [LINK]
      https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L14-L14
      [LINK]
      .
      [EXTENSION]
      js
      [EXTENSION]
      .
      [SOURCE]
        12 |
        13 |
      > 14 | if (foo === -0) {
           |     ^^^^^^^^^^
        15 |   // prevent no-empty
        16 | }
      [SOURCE]
      .
      [ERROR]
      undefined
      [ERROR]
      [TEST-ON-COMPLETE-END]"
    `);
});

test('erroneous onComplete does not crash application', async () => {
    const { output, exitCode } = await runProductionBuild({
        CI: true,
        rulesUnderTesting: [],
        eslintConfig: [],
        onComplete: function onComplete(results) {
            // @ts-expect-error -- intentional error
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- intentional error
            results.some.nonexisting.field;
        },
    });

    const errorLog = output.splice(
        output.findIndex(r => /onComplete/.test(r)),
        2
    );

    expect(errorLog.join('\n')).toMatchInlineSnapshot(`
        "Error: Error occurred while calling onComplete callback
        TypeError: Cannot read property 'field' of undefined"
    `);
    expect(exitCode).toBe(0);
    expect(output.pop()).toMatch(/Results:/);
});

test('comparison results are written to file system on CLI mode', async () => {
    await runProductionBuild({
        compare: true,
        CI: false,
        eslintConfig: ESLINT_CONFIG_ALL,
        rulesUnderTesting: [
            'no-compare-neg-zero', // Used in initial scan, not in second
            // 'no-undef', // Used in second scan, not in first
            'no-empty', // Used in both scans
        ],
    });

    const { output } = await runProductionBuild({
        compare: true,
        CI: false,
        eslintConfig: ESLINT_CONFIG_ALL,
        rulesUnderTesting: [
            // 'no-compare-neg-zero', // Used in initial scan, not in second
            'no-undef', // Used in second scan, not in first
            'no-empty', // Used in both scans
        ],
    });

    expect(output.find(row => /comparison/.test(row))).toMatch(
        '[DONE] Result comparison: Added 2. Removed 1.'
    );

    // Remaining errors should be visible in results but not in comparison
    expect(getResults()).toMatch(/no-empty/);

    const comparisonResults = getComparisonResults();
    const snapshot = [
        '[ADDED]',
        comparisonResults.added,
        '[ADDED]',
        '[REMOVED]',
        comparisonResults.removed,
        '[REMOVED]',
    ].join('\n');

    expect(snapshot).toMatchInlineSnapshot(`
        "[ADDED]
        # Added:
        ## Rule: no-undef

        -   Message: \`'window' is not defined.\`
        -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js\`
        -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/expected-to-crash-linter.js#L2-L2)

        \`\`\`js
          1 | // Identifier.name = attributeForCrashing
        > 2 | window.attributeForCrashing();
            | ^^^^^^
          3 |
        \`\`\`

        ## Rule: no-undef

        -   Message: \`'bar' is not defined.\`
        -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
        -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L1-L1)

        \`\`\`js
        > 1 | var foo = bar;
            |           ^^^
          2 |
          3 | if (foo) {
          4 | }
        \`\`\`

        [ADDED]
        [REMOVED]
        # Removed:
        ## Rule: no-compare-neg-zero

        -   Message: \`Do not use the '===' operator to compare against -0.\`
        -   Path: \`AriPerkkio/eslint-remote-tester-integration-test-target/index.js\`
        -   [Link](https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L14-L14)

        \`\`\`js
          12 |
          13 |
        > 14 | if (foo === -0) {
             |     ^^^^^^^^^^
          15 |   // prevent no-empty
          16 | }
        \`\`\`

        [REMOVED]"
    `);
});

test('comparison result reference updating can be disabled', async () => {
    await runProductionBuild({
        compare: true,
        CI: false,
        eslintConfig: ESLINT_CONFIG_ALL,
        rulesUnderTesting: [
            'no-compare-neg-zero', // Used in initial scan, not in second
            // 'no-undef', // Used in second scan, not in first
            'no-empty', // Used in both scans
        ],
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _ of [1, 2]) {
        const { output } = await runProductionBuild({
            updateComparisonReference: false,
            compare: true,
            CI: false,
            eslintConfig: ESLINT_CONFIG_ALL,
            rulesUnderTesting: [
                // 'no-compare-neg-zero', // Used in initial scan, not in second
                'no-undef', // Used in second scan, not in first
                'no-empty', // Used in both scans
            ],
        });

        // Comparison results should not change between runs
        expect(output.find(row => /comparison/.test(row))).toMatch(
            '[DONE] Result comparison: Added 2. Removed 1.'
        );
    }
});

test('comparison results are rendered on CI mode', async () => {
    await runProductionBuild({
        compare: true,
        CI: true,
        eslintConfig: ESLINT_CONFIG_ALL,
        rulesUnderTesting: [
            'no-compare-neg-zero', // Used in initial scan, not in second
            // 'no-undef', // Used in second scan, not in first
            'no-empty', // Used in both scans
        ],
    });

    const { output } = await runProductionBuild({
        compare: true,
        CI: true,
        eslintConfig: ESLINT_CONFIG_ALL,
        rulesUnderTesting: [
            // 'no-compare-neg-zero', // Used in initial scan, not in second
            'no-undef', // Used in second scan, not in first
            'no-empty', // Used in both scans
        ],
    });

    // Remaining errors should be visible in results but not in comparison
    const [results, comparisonResults] = output.reverse();
    expect(results).toMatch(/no-empty/);

    expect(comparisonResults).toMatchInlineSnapshot(`
      "Comparison results:
      Added:
      Rule: no-undef
      Message: 'window' is not defined.
      Path: AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js
      Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/expected-to-crash-linter.js#L2-L2

        1 | // Identifier.name = attributeForCrashing
      > 2 | window.attributeForCrashing();
          | ^^^^^^
        3 |

      Rule: no-undef
      Message: 'bar' is not defined.
      Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
      Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L1-L1

      > 1 | var foo = bar;
          |           ^^^
        2 |
        3 | if (foo) {
        4 | }


      Removed:
      Rule: no-compare-neg-zero
      Message: Do not use the '===' operator to compare against -0.
      Path: AriPerkkio/eslint-remote-tester-integration-test-target/index.js
      Link: https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L14-L14

        12 |
        13 |
      > 14 | if (foo === -0) {
           |     ^^^^^^^^^^
        15 |   // prevent no-empty
        16 | }


      "
    `);
});

test('calls onComplete hook with the comparison results', async () => {
    await runProductionBuild({
        compare: true,
        CI: true,
        eslintConfig: ESLINT_CONFIG_ALL,
        rulesUnderTesting: [
            'no-compare-neg-zero', // Used in initial scan, not in second
            // 'no-undef', // Used in second scan, not in first
            'no-empty', // Used in both scans
        ],
    });

    const { output } = await runProductionBuild({
        compare: true,
        CI: true,
        eslintConfig: ESLINT_CONFIG_ALL,
        rulesUnderTesting: [
            // 'no-compare-neg-zero', // Used in initial scan, not in second
            'no-undef', // Used in second scan, not in first
            'no-empty', // Used in both scans
        ],
        onComplete: function onComplete(_, comparisonResults) {
            console.log(`[TEST-ON-COMPLETE-START]`);

            for (const type of [`added`, `removed`]) {
                console.log(`[${type.toUpperCase()}]`);
                // @ts-expect-error -- intentional
                comparisonResults[type].forEach(result => {
                    Object.entries(result).forEach(([key, value]) => {
                        if (key === `__internalHash`) return;
                        const block = `[${key.toUpperCase()}]`;

                        console.log(`.`);
                        console.log(block);
                        console.log(value);
                        console.log(block);
                    });
                });
                console.log(`[${type.toUpperCase()}]`);
            }

            console.log(`[TEST-ON-COMPLETE-END]`);
        },
    });

    const [onCompleteCall] = output
        .join('\n')
        .match(/\[TEST-ON-COMPLETE-START\]([\s|\S]*)\[TEST-ON-COMPLETE-END\]/)!;

    expect(onCompleteCall).toMatchInlineSnapshot(`
      "[TEST-ON-COMPLETE-START]
      [ADDED]
      .
      [REPOSITORY]
      eslint-remote-tester-integration-test-target
      [REPOSITORY]
      .
      [REPOSITORYOWNER]
      AriPerkkio
      [REPOSITORYOWNER]
      .
      [RULE]
      no-undef
      [RULE]
      .
      [MESSAGE]
      'window' is not defined.
      [MESSAGE]
      .
      [PATH]
      AriPerkkio/eslint-remote-tester-integration-test-target/expected-to-crash-linter.js
      [PATH]
      .
      [LINK]
      https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/expected-to-crash-linter.js#L2-L2
      [LINK]
      .
      [EXTENSION]
      js
      [EXTENSION]
      .
      [SOURCE]
        1 | // Identifier.name = attributeForCrashing
      > 2 | window.attributeForCrashing();
          | ^^^^^^
        3 |
      [SOURCE]
      .
      [ERROR]
      undefined
      [ERROR]
      .
      [REPOSITORY]
      eslint-remote-tester-integration-test-target
      [REPOSITORY]
      .
      [REPOSITORYOWNER]
      AriPerkkio
      [REPOSITORYOWNER]
      .
      [RULE]
      no-undef
      [RULE]
      .
      [MESSAGE]
      'bar' is not defined.
      [MESSAGE]
      .
      [PATH]
      AriPerkkio/eslint-remote-tester-integration-test-target/index.js
      [PATH]
      .
      [LINK]
      https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L1-L1
      [LINK]
      .
      [EXTENSION]
      js
      [EXTENSION]
      .
      [SOURCE]
      > 1 | var foo = bar;
          |           ^^^
        2 |
        3 | if (foo) {
        4 | }
      [SOURCE]
      .
      [ERROR]
      undefined
      [ERROR]
      [ADDED]
      [REMOVED]
      .
      [REPOSITORY]
      eslint-remote-tester-integration-test-target
      [REPOSITORY]
      .
      [REPOSITORYOWNER]
      AriPerkkio
      [REPOSITORYOWNER]
      .
      [RULE]
      no-compare-neg-zero
      [RULE]
      .
      [MESSAGE]
      Do not use the '===' operator to compare against -0.
      [MESSAGE]
      .
      [PATH]
      AriPerkkio/eslint-remote-tester-integration-test-target/index.js
      [PATH]
      .
      [LINK]
      https://github.com/AriPerkkio/eslint-remote-tester-integration-test-target/blob/HEAD/index.js#L14-L14
      [LINK]
      .
      [EXTENSION]
      js
      [EXTENSION]
      .
      [SOURCE]
        12 |
        13 |
      > 14 | if (foo === -0) {
           |     ^^^^^^^^^^
        15 |   // prevent no-empty
        16 | }
      [SOURCE]
      [REMOVED]
      [TEST-ON-COMPLETE-END]"
    `);
});

test('enables all rules when rulesUnderTesting returns true', async () => {
    await runProductionBuild({
        CI: false,
        rulesUnderTesting: () => true,
        eslintConfig: ESLINT_CONFIG_ALL,
    });
    const results = getResults();
    const rules = results.match(/Rule: (\S)*/g) || [];

    expect(rules.join('\n')).toMatchInlineSnapshot(`
      "Rule: no-undef
      Rule: no-var
      Rule: no-undef
      Rule: no-empty
      Rule: one-var
      Rule: vars-on-top
      Rule: no-var
      Rule: id-length
      Rule: getter-return
      Rule: capitalized-comments
      Rule: no-compare-neg-zero
      Rule: no-magic-numbers
      Rule: capitalized-comments"
    `);
});

test('calls rulesUnderTesting filter with ruleId and repository', async () => {
    const { output } = await runProductionBuild({
        CI: false,
        logLevel: 'verbose',
        rulesUnderTesting: `(ruleId, options) => {
            void import('worker_threads').then(w => {
                w.parentPort.postMessage({
                    type: 'DEBUG',
                    payload: \`\${ruleId} - \${options.repository}\`,
                });
            });

            return true;
        }`,
        eslintConfig: ESLINT_CONFIG_ALL,
    });

    const finalLog = output.pop();
    const withoutTimestamps = finalLog!.replace(DEBUG_LOG_PATTERN, '');

    expect(withoutTimestamps).toMatchInlineSnapshot(`
      "Full log:
      no-undef - AriPerkkio/eslint-remote-tester-integration-test-target
      no-var - AriPerkkio/eslint-remote-tester-integration-test-target
      no-undef - AriPerkkio/eslint-remote-tester-integration-test-target
      no-empty - AriPerkkio/eslint-remote-tester-integration-test-target
      one-var - AriPerkkio/eslint-remote-tester-integration-test-target
      vars-on-top - AriPerkkio/eslint-remote-tester-integration-test-target
      no-var - AriPerkkio/eslint-remote-tester-integration-test-target
      id-length - AriPerkkio/eslint-remote-tester-integration-test-target
      getter-return - AriPerkkio/eslint-remote-tester-integration-test-target
      capitalized-comments - AriPerkkio/eslint-remote-tester-integration-test-target
      no-compare-neg-zero - AriPerkkio/eslint-remote-tester-integration-test-target
      no-magic-numbers - AriPerkkio/eslint-remote-tester-integration-test-target
      capitalized-comments - AriPerkkio/eslint-remote-tester-integration-test-target
      [ERROR] AriPerkkio/eslint-remote-tester-integration-test-target 13 errors
      [DONE] Finished scan of 1 repositories
      [INFO] Cached repositories (1) at ./node_modules/.cache-eslint-remote-tester

      "
    `);
});

test('calls eslingConfig function with repository and its location', async () => {
    const { output } = await runProductionBuild({
        CI: false,
        logLevel: 'verbose',
        eslintConfig: `async function init(options) {
            const { parentPort } = await import('worker_threads');

            if (parentPort) {
                parentPort.postMessage({
                    type: 'DEBUG',
                    payload: \`location: \${options?.location}\`,
                });

                parentPort.postMessage({
                    type: 'DEBUG',
                    payload: \`repository: \${options?.repository}\`,
                });
            }

            return [];
        }`,
    });

    const finalLog = output.pop();
    const withoutTimestamps = finalLog!.replace(DEBUG_LOG_PATTERN, '');

    expect(withoutTimestamps).toMatchInlineSnapshot(
        `
      "Full log:
      location: <removed>/node_modules/.cache-eslint-remote-tester/AriPerkkio/eslint-remote-tester-integration-test-target
      repository: AriPerkkio/eslint-remote-tester-integration-test-target
      [SUCCESS] AriPerkkio/eslint-remote-tester-integration-test-target
      [DONE] Finished scan of 1 repositories
      [INFO] Cached repositories (1) at ./node_modules/.cache-eslint-remote-tester

      "
    `
    );
});

test('loads typescript configuration file', async () => {
    const { output } = await runProductionBuild(
        {
            CI: true,
            rulesUnderTesting: [],
            onComplete: `async function onComplete() {
                const {readFileSync} = await import('node:fs');

                console.log('[TEST-ON-COMPLETE-START]');

                type SomeType = 'a' | 'b' | 'c';
                const value: SomeType = 'b';
                console.log('Value of typed const', value);

                console.log('config file:');
                const index = process.argv.findIndex(a => a === '--config');
                const config = process.argv[index + 1];
                console.log(readFileSync(config, 'utf8'));

                console.log('[TEST-ON-COMPLETE-END]');
            }`,
        },
        undefined,
        'ts'
    );

    const [onCompleteCall] = output
        .join('\n')
        .match(/\[TEST-ON-COMPLETE-START\]([\s|\S]*)\[TEST-ON-COMPLETE-END\]/)!;

    expect(onCompleteCall).toMatchInlineSnapshot(`
      "[TEST-ON-COMPLETE-START]
      Value of typed const b
      config file:
      export default {
          "repositories": [
              "AriPerkkio/eslint-remote-tester-integration-test-target"
          ],
          "extensions": [
              ".js"
          ],
          "pathIgnorePattern": "(expected-to-be-excluded)",
          "rulesUnderTesting": [],
          "eslintConfig": async function initialize() {
              const { default: js } = await import('@eslint/js');
              const { FlatCompat } = await import('@eslint/eslintrc');
              const compat = new FlatCompat({ baseDirectory: process.cwd() });
              return [
                  js.configs.recommended,
                  ...compat.plugins('eslint-plugin-local-rules'),
                  { rules: { 'local-rules/some-unstable-rule': 'error' } },
              ];
          },
          "CI": true,
          "onComplete": async function onComplete() {
                      const {readFileSync} = await import('node:fs');
                      console.log('[TEST-ON-COMPLETE-START]');
                      type SomeType = 'a' | 'b' | 'c';
                      const value: SomeType = 'b';
                      console.log('Value of typed const', value);
                      console.log('config file:');
                      const index = process.argv.findIndex(a => a === '--config');
                      const config = process.argv[index + 1];
                      console.log(readFileSync(config, 'utf8'));
                      console.log('[TEST-ON-COMPLETE-END]');
                  }
      }
      [TEST-ON-COMPLETE-END]"
    `);
});
