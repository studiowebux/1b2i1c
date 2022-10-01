// Studio Webux @ 2022
import { readTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

const readCredentials = async () =>
  readTextFile(".aws/credentials", { dir: BaseDirectory.Home });

const convertToArray = ({ rawCredentials }) => {
  if (!rawCredentials || rawCredentials.length === 0) {
    throw new Error("Missing credentials content");
  }
  return rawCredentials.split("\n");
};

const determineSection = ({ profile, rawCredentials }) => {
  if (!profile || profile.length === 0) {
    throw new Error("Missing profile");
  }
  if (profile && (!profile.startsWith("[") || !profile.endsWith("]"))) {
    throw new Error("Profile must starts with '[' and ends with ']'");
  }

  if (!rawCredentials || rawCredentials.length === 0) {
    throw new Error("Missing credentials content");
  }

  const credentialsArray = convertToArray({ rawCredentials });
  const start = credentialsArray.findIndex((line) => line.includes(profile));
  if (start === -1) {
    throw new Error("Profile (" + profile + ") not found in credentials");
  }
  let end = credentialsArray
    .slice(start + 1)
    .findIndex((line) => line.startsWith("["));

  if (end === -1) {
    end = credentialsArray.length - 1;
  }

  return {
    start,
    end: start + end + 1,
    section: credentialsArray.slice(start, start + end + 1),
  };
};

const extractOneProfile = async ({ profile, rawCredentials }) => {
  const { section } = determineSection({ profile, rawCredentials });

  const extractedCredentials = {
    profile,
    accessKeyId: null,
    secretAccessKey: null,
    sessionToken: null,
    mfaSerial: null,
    sourceProfile: null,
    roleArn: null,
    hasMfa: false,
    assumeRole: false,
  };

  section.forEach((line) => {
    if (line.includes("aws_access_key_id")) {
      extractedCredentials.accessKeyId = line
        .split("aws_access_key_id = ")[1]
        .replace(/\s/g, "");
    }

    if (line.includes("aws_secret_access_key")) {
      extractedCredentials.secretAccessKey = line
        .split("aws_secret_access_key = ")[1]
        .replace(/\s/g, "");
    }

    if (line.includes("session_token")) {
      extractedCredentials.sessionToken = line
        .split("session_token = ")[1]
        .replace(/\s/g, "");
    }

    if (line.includes("mfa_serial")) {
      extractedCredentials.mfaSerial = line
        .split("mfa_serial = ")[1]
        .replace(/\s/g, "");
      extractedCredentials.hasMfa = true;
    }

    if (line.includes("source_profile")) {
      extractedCredentials.sourceProfile = line
        .split("source_profile = ")[1]
        .replace(/\s/g, "");
      extractedCredentials.assumeRole = true;
    }

    if (line.includes("role_arn")) {
      extractedCredentials.roleArn = line
        .split("role_arn = ")[1]
        .replace(/\s/g, "");
      extractedCredentials.assumeRole = true;
    }
  });

  if (extractedCredentials.assumeRole) {
    console.debug("Loading source profile.");
    const sourceProfile = await extractOneProfile({
      profile: `[${extractedCredentials.sourceProfile}]`,
      rawCredentials,
    });
    extractedCredentials.sourceProfile = { ...sourceProfile };
  }

  extractedCredentials.credentials = {
    accessKeyId: extractedCredentials.accessKeyId,
    secretAccessKey: extractedCredentials.secretAccessKey,
    sessionToken: extractedCredentials.sessionToken,
  };

  return Promise.resolve(extractedCredentials);
};

const extractProfiles = async ({ rawCredentials }) => {
  if (!rawCredentials || rawCredentials.length === 0) {
    throw new Error("Missing credentials content");
  }

  return Promise.all(
    convertToArray({ rawCredentials })
      .filter((opt) => opt.startsWith("["))
      .map((profile) => extractOneProfile({ rawCredentials, profile }))
  );
};

async function assumeRole({ profiles, profile }) {
  console.debug(profiles);
  let _profile = profiles.find((pv) => pv.profile.includes(profile));

  if (!_profile) throw new Error("Profile not found");

  const client = new STSClient({
    region: "us-east-1", // this is ok that it is hardcoded
    credentials:
      _profile.credentials?.AccessKeyId && _profile.credentials?.secretAccessKey
        ? _profile.credentials
        : _profile.sourceProfile?.credentials,
  });
  const command = new AssumeRoleCommand({
    RoleSessionName: "onebtwoionec", // this is ok that it is hardcoded
    RoleArn: _profile.roleArn,
  });

  return await client.send(command);
}

export {
  readCredentials,
  convertToArray,
  determineSection,
  extractProfiles,
  extractOneProfile,
  assumeRole,
};
