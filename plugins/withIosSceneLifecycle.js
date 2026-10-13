const fs = require("node:fs");
const path = require("node:path");
const {
    IOSConfig,
    withDangerousMod,
    withInfoPlist,
    withXcodeProject,
} = require("expo/config-plugins");

const SCENE_DELEGATE_FILE = "SceneDelegate.swift";
const SCENE_DELEGATE_SOURCE = `import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard
      let windowScene = scene as? UIWindowScene,
      let appDelegate = UIApplication.shared.delegate as? AppDelegate,
      let window = appDelegate.window
    else {
      return
    }

    window.windowScene = windowScene
    self.window = window
    window.makeKeyAndVisible()

    for context in connectionOptions.urlContexts {
      open(context)
    }
    for userActivity in connectionOptions.userActivities {
      continueActivity(userActivity)
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
      open(context)
    }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    continueActivity(userActivity)
  }

  private func open(_ context: UIOpenURLContext) {
    var options: [UIApplication.OpenURLOptionsKey: Any] = [
      .openInPlace: context.options.openInPlace,
    ]
    if let sourceApplication = context.options.sourceApplication {
      options[.sourceApplication] = sourceApplication
    }
    if let annotation = context.options.annotation {
      options[.annotation] = annotation
    }

    if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
      _ = appDelegate.application(
        UIApplication.shared,
        open: context.url,
        options: options
      )
    }
  }

  private func continueActivity(_ userActivity: NSUserActivity) {
    if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
      _ = appDelegate.application(
        UIApplication.shared,
        continue: userActivity,
        restorationHandler: { _ in }
      )
    }
  }
}
`;

function withSceneManifest(config) {
    return withInfoPlist(config, (result) => {
        result.modResults.UIApplicationSceneManifest = {
            UIApplicationSupportsMultipleScenes: false,
            UISceneConfigurations: {
                UIWindowSceneSessionRoleApplication: [
                    {
                        UISceneConfigurationName: "Default Configuration",
                        UISceneDelegateClassName:
                            "$(PRODUCT_MODULE_NAME).SceneDelegate",
                    },
                ],
            },
        };
        return result;
    });
}

function withSceneDelegateFile(config) {
    const withFile = withDangerousMod(config, [
        "ios",
        (result) => {
            const projectName = IOSConfig.XcodeUtils.getProjectName(
                result.modRequest.projectRoot,
            );
            const filePath = path.join(
                result.modRequest.platformProjectRoot,
                projectName,
                SCENE_DELEGATE_FILE,
            );
            fs.writeFileSync(filePath, SCENE_DELEGATE_SOURCE);
            return result;
        },
    ]);

    return withXcodeProject(withFile, (result) => {
        const projectName = IOSConfig.XcodeUtils.getProjectName(
            result.modRequest.projectRoot,
        );
        const filePath = path.join(projectName, SCENE_DELEGATE_FILE);
        if (!result.modResults.hasFile(filePath)) {
            IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
                filepath: filePath,
                groupName: projectName,
                project: result.modResults,
            });
        }
        return result;
    });
}

module.exports = function withIosSceneLifecycle(config) {
    return withSceneDelegateFile(withSceneManifest(config));
};
