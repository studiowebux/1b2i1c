# Yet another tool to start CodePipeline

Using a simple and configurable UI to Start and Update CodePipeline.

## Usage

1. Create your configuration

```bash
nano ~/onebtwoionec.config.json
```

```json
[
  {
    "friendlyName": "@yet-another-tool/demo-repo-public", --> the name that will appear in the UI
    "pipeline": "test", --> The codepipeline name to start/update
    "profile": "my-account-deployment", --> Your AWS profile to use
    "region": "us-east-1" --> The AWS Region to target
  }
]
```

2. Then setup your AWS credentials as usual (I only tested the assume role using IAM user and role).

3. Finally open the application.

![Application](./docs/application.png)

---

### Setup

```bash
cd onebtwoionec
npm install

npm run tauri dev
```

```bash
npm run tauri build
```

Enjoy !

---

I did this in ~3hours.  
I didn't take the time to consider everything; I wanted a quick prototype !
If you want to participate please open PR/issues !

But the thing that I wanted to investigate was: **Vue3 + Tauri** and I'm happy :)

I'll continue this project if our tests are good

## Contribution

Tommy Gingras @ Studio Webux 2022
