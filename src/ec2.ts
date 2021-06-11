import {
  EC2Client,
  EC2ClientConfig,
  CreateLaunchTemplateCommand,
  CreateLaunchTemplateCommandInput,
  RequestLaunchTemplateData,
} from "@aws-sdk/client-ec2";

/**
 * Method to launch a EC2 VM
 *
 * @param config
 * @param input
 */
export const createVM = async (
  config: EC2ClientConfig,
  input: CreateLaunchTemplateCommandInput
) => {
  const client = new EC2Client(config);
  const command = new CreateLaunchTemplateCommand(enforceDefaults(input));
  return await client.send(command);
};

/**
 * Method to enforce organizational defaults
 *
 * @param input
 */
const enforceDefaults = (input: CreateLaunchTemplateCommandInput) => {
  let { LaunchTemplateData } = input;
  // Handle empty template
  if (!LaunchTemplateData) {
    LaunchTemplateData = {
      EbsOptimized: true,
      DisableApiTermination: false,
    };
  }
  // Enforce cpu options
  if (!LaunchTemplateData?.CpuOptions) {
    LaunchTemplateData.CpuOptions = {
      CoreCount: 4,
      ThreadsPerCore: 2,
    };
  }
  // UserData and ImageId can be used to inject malicious scripts into the VM and should never be attacker-controlled
  // In this example, we are just logging without performing any validation or sanitization of these two attributes
  console.log(LaunchTemplateData.UserData, LaunchTemplateData.ImageId);
  return {
    ClientToken: "Request-" + new Date().getTime(),
    LaunchTemplateName: "template-" + new Date().getTime(), // Would lead to too many templates being created
    LaunchTemplateData,
  };
};
