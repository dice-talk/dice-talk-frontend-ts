const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');

// 안드로이드 매니페스트에 <queries>를 추가하는 공식적이고 안전한 방법
function addQueries(androidManifest, queries) {
  if (!Array.isArray(androidManifest.queries)) {
    androidManifest.queries = [];
  }
  // app.json에서 정의한 queries 배열을 순회
  for (const userQuery of queries) {
    // 각 query 객체 안에 있는 intent 배열을 순회
    for (const intent of userQuery.intent) {
      // 기존에 동일한 action을 가진 intent-filter가 있는지 확인 (중복 방지)
      const existingIntent = androidManifest.queries.some(q => 
        q.intent && q.intent.some(i => i.action && i.action.some(a => a.$['android:name'] === intent.action))
      );

      if (!existingIntent) {
        // XML 빌더가 이해할 수 있는 형식으로 intent-filter를 구성
        const newIntentFilter = {
          action: [{ $: { 'android:name': intent.action } }],
          data: intent.data.scheme.map(s => ({ $: { 'android:scheme': s } })),
        };
        // <intent> 태그를 <queries> 블록 안에 추가
        androidManifest.queries.push({ intent: [newIntentFilter] });
      }
    }
  }
  return androidManifest;
}

const withAndroidQueries = (config) => {
  const userQueries = config.android?.queries;

  if (!userQueries || !Array.isArray(userQueries) || userQueries.length === 0) {
    return config;
  }

  return withAndroidManifest(config, (config) => {
    config.modResults.manifest = addQueries(config.modResults.manifest, userQueries);
    
    // 더 이상 필요 없어진 app.json의 queries를 삭제하여 Expo의 기본 처리와 충돌 방지
    delete config.android.queries;

    console.log('[withAndroidQueries] Safely applied custom queries to AndroidManifest.xml');
    
    return config;
  });
};

module.exports = withAndroidQueries; 