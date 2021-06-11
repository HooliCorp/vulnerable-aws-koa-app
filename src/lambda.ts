import {
  LambdaClient,
  InvokeCommand,
  LambdaClientConfig,
  InvokeCommandInput,
  InvokeCommandOutput,
} from "@aws-sdk/client-lambda";

/**
 * Execute a lambda function with input with automatic retry
 *
 * @param config
 * @param input
 * @returns
 */
export const executeJob = async (
  config: LambdaClientConfig,
  input: InvokeCommandInput
): Promise<InvokeCommandOutput> => {
  const client = new LambdaClient(config);
  const command = new InvokeCommand(input);
  try {
    return await client.send(command);
  } catch (err) {
    console.log(err, "retrying");
    // Infinite loop
    return executeJob(config, input);
  }
};
