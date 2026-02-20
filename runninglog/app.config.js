const path = require('path');
const fs = require('fs');
const { withDangerousMod } = require('expo/config-plugins');

const base = require('./app.json');

// .env를 명시적으로 로드 (prebuild/빌드 시 API 키 적용 보장)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

// 카카오 SDK Maven 저장소 (react-native-kakao 의존성)
const KAKAO_MAVEN_URL = 'https://devrepo.kakao.com/nexus/content/groups/public/';

const expo = {
  ...base.expo,
  android: {
    ...base.expo.android,
    ...(googleMapsApiKey && {
      config: {
        ...base.expo.android?.config,
        googleMaps: { apiKey: googleMapsApiKey },
      },
    }),
  },
  plugins: [
    ...base.expo.plugins.map((plugin) => {
      if (Array.isArray(plugin) && plugin[0] === 'expo-build-properties') {
        const config = plugin[1] ?? {};
        const android = config.android ?? {};
        const existing = android.extraMavenRepos ?? [];
        const extraMavenRepos = existing.includes(KAKAO_MAVEN_URL)
          ? existing
          : [...existing, KAKAO_MAVEN_URL];
        const minSdkVersion = Math.max(android.minSdkVersion ?? 26, 24);
        return [
          'expo-build-properties',
          { ...config, android: { ...android, minSdkVersion, extraMavenRepos } },
        ];
      }
      return plugin;
    }),
    // hermestooling/prefab 호환: rootProject.ext.minSdkVersion을 26으로 고정 (22 사용 시 CMake 실패)
    (config) =>
      withDangerousMod(config, [
        'android',
        async (config) => {
          const platformRoot = config.modRequest.platformProjectRoot;
          const rootBuildGradlePath = path.join(platformRoot, 'build.gradle');
          let contents = fs.readFileSync(rootBuildGradlePath, 'utf8');
          const marker =
            '// [expo-build-properties] Force minSdkVersion 26 for prefab/hermestooling';
          if (!contents.includes(marker)) {
            const injectFirst =
              "gradle.projectsLoaded { rootProject.ext.minSdkVersion = 26 }\n\n";
            contents = injectFirst + contents;
            const injectBegin = `${marker}\nrootProject.ext.minSdkVersion = 26\n\n`;
            contents = contents.replace(
              /(apply plugin: "expo-root-project")/,
              injectBegin + '$1'
            );
            const injectEnd = `\n${marker} (after plugins)\nrootProject.ext.minSdkVersion = 26\n`;
            contents = contents.trimEnd() + injectEnd + '\n';
            fs.writeFileSync(rootBuildGradlePath, contents);
          }
          // prefab/hermestooling 호환: minSdkVersion 26 강제 (22 사용 시 CMake 실패)
          const nodeModules = path.join(
            config.modRequest.projectRoot,
            'node_modules'
          );
          const patches = [
            ['react-native-worklets', 'android/build.gradle', /minSdkVersion 24/g, 'minSdkVersion 26'],
            ['react-native-nitro-modules', 'android/build.gradle', /minSdkVersion 24/g, 'minSdkVersion 26'],
            ['react-native-screens', 'android/build.gradle', /minSdkVersion 24/g, 'minSdkVersion 26'],
            [
              'expo-modules-core',
              'android/build.gradle',
              /rootProject\.ext\.has\("minSdkVersion"\) \? rootProject\.ext\.get\("minSdkVersion"\) : 24/g,
              '26'
            ],
          ];
          for (const [pkg, relPath, pattern, replacement] of patches) {
            const buildPath = path.join(nodeModules, pkg, relPath);
            if (fs.existsSync(buildPath)) {
              let buildContents = fs.readFileSync(buildPath, 'utf8');
              if (pattern.test(buildContents)) {
                buildContents = buildContents.replace(pattern, replacement);
                fs.writeFileSync(buildPath, buildContents);
              }
            }
          }
          // 앱 minSdkVersion 26 고정 (prefab "user" 검사에 사용됨)
          const appBuildPath = path.join(platformRoot, 'app', 'build.gradle');
          if (fs.existsSync(appBuildPath)) {
            let appContents = fs.readFileSync(appBuildPath, 'utf8');
            if (appContents.includes('minSdkVersion rootProject.ext.minSdkVersion')) {
              appContents = appContents.replace(
                /minSdkVersion rootProject\.ext\.minSdkVersion/,
                'minSdkVersion 26'
              );
              fs.writeFileSync(appBuildPath, appContents);
            }
          }
          return config;
        },
      ]),
  ],
};

module.exports = { expo };
