import childProcess = require("child_process");

const { spawnSync } = childProcess;

export class EnvConfig {
  public static get endpoint(): string {
    if (process.env.KNAPSACK_PRO_ENDPOINT) {
      return process.env.KNAPSACK_PRO_ENDPOINT;
    }

    return "https://api-staging.knapsackpro.com";
  }

  public static get testSuiteToken(): string | void {
    if (process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN) {
      return process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN;
    }

    throw new Error(
      `Please set test suite API token in CI environment variables.
      Please check README for the Knapsack Pro client library.`,
    );
  }

  public static get fixedQueueSplit(): boolean {
    if (process.env.KNAPSACK_PRO_FIXED_QUEUE_SPLIT) {
      return process.env.KNAPSACK_PRO_FIXED_QUEUE_SPLIT.toLowerCase() === "true";
    }

    return false;
  }

  public static get branch(): string | void {
    if (process.env.KNAPSACK_PRO_BRANCH) {
      return process.env.KNAPSACK_PRO_BRANCH;
    }

    const gitProccess = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"]);

    if (gitProccess.status === 0) {
      const gitBranch = gitProccess.stdout.toString().trim();

      // set env variable so next function call won't spawn git process again
      process.env.KNAPSACK_PRO_BRANCH = gitBranch;

      return gitBranch;
    } else if (gitProccess.stderr === null) {
      // gitProcess may fail with stderr null, for instance when git command does not exist on the machine
      console.error(
        "We tried to detect branch name using git but it failed.",
        "Please ensure you have have git installed or set KNAPSACK_PRO_BRANCH environment variable.",
      );
    } else {
      const gitErrorMessage = gitProccess.stderr.toString();
      console.error("There was error in detecting branch name using git installed on the machine:");
      console.error(gitErrorMessage);
    }

    throw new Error("Undefined git branch name! Please set KNAPSACK_PRO_BRANCH environment variable.");
  }
}
