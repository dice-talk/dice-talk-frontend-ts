const { withAndroidManifest } = require('@expo/config-plugins');

const withAndroidQueries = (config) => {
  // app.json (또는 app.config.js) 의 최상위 'android' 객체에서 'queries' 배열을 가져옵니다.
  const androidQueries = config.android?.queries;

  // 만약 queries 설정이 없으면 아무것도 하지 않고 반환합니다.
  if (!androidQueries || !Array.isArray(androidQueries) || androidQueries.length === 0) {
    return config;
  }

  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // 기존 manifest에 <queries> 태그가 있는지 확인하고, 없으면 빈 배열로 초기화합니다.
    const existingQueries = manifest.queries || [];

    // app.json에서 가져온 queries 배열을 기존 manifest의 queries에 합칩니다.
    // 여기서는 간단하게 기존 것을 대체하거나, 더 복잡한 병합 로직을 구현할 수 있습니다.
    // 지금은 app.json의 내용을 최우선으로 하여 덮어쓰는 방식으로 구현합니다.
    // Expo의 기본 동작과 유사하게, 기존 queries를 유지하면서 새로운 것을 추가합니다.
    manifest.queries = [...existingQueries, ...androidQueries];

    // 중복 제거 로직 (선택 사항이지만 추가하면 좋음)
    // 간단한 구현을 위해 여기서는 생략하고, app.json에 중복이 없다고 가정합니다.
    
    console.log('[withAndroidQueries] Successfully applied custom queries to AndroidManifest.xml');

    return config;
  });
};

module.exports = withAndroidQueries; 