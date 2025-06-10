const { withAndroidManifest } = require('@expo/config-plugins');

const QUERIES = [
  { action: "android.intent.action.VIEW", data: { scheme: "https" } },
  { action: "android.intent.action.VIEW", data: { scheme: "about" } },
  { action: "android.intent.action.VIEW", data: { scheme: "supertoss" } },
  { action: "android.intent.action.VIEW", data: { scheme: "kakaotalk" } },
  { action: "android.intent.action.VIEW", data: { scheme: "kakaopay" } },
  { action: "android.intent.action.VIEW", data: { scheme: "naversearchapp" } },
  { action: "android.intent.action.VIEW", data: { scheme: "npay" } },
  { action: "android.intent.action.VIEW", data: { scheme: "payco" } },
  { action: "android.intent.action.VIEW", data: { scheme: "lpay" } },
  { action: "android.intent.action.VIEW", data: { scheme: "com.samsung.android.spay" } },
  { action: "android.intent.action.VIEW", data: { scheme: "ispmobile" } },
  { action: "android.intent.action.VIEW", data: { scheme: "shinhan-sr-ansimclick" } },
  { action: "android.intent.action.VIEW", data: { scheme: "kb-acp" } },
  { action: "android.intent.action.VIEW", data: { scheme: "mpocket.online.ansimclick" } },
  { action: "android.intent.action.VIEW", data: { scheme: "hdcardappcardansimclick" } },
  { action: "android.intent.action.VIEW", data: { scheme: "lotteappcard" } },
  { action: "android.intent.action.VIEW", data: { scheme: "cloudpay" } },
  { action: "android.intent.action.VIEW", data: { scheme: "nhallonepayansimclick" } },
  { action: "android.intent.action.VIEW", data: { scheme: "hanaskcard" } },
  { action: "android.intent.action.VIEW", data: { scheme: "citiaps" } },
  { action: "android.intent.action.VIEW", data: { scheme: "wooripay" } },
  { action: "android.intent.action.VIEW", data: { scheme: "tauthlink" } },
  { action: "android.intent.action.VIEW", data: { scheme: "skpay" } },
  { action: "android.intent.action.VIEW", data: { scheme: "nhb-blp" } },
  { action: "android.intent.action.VIEW", data: { scheme: "kbstar" } },
  { action: "android.intent.action.VIEW", data: { scheme: "shinhan-s-bank" } },
  { action: "android.intent.action.VIEW", data: { scheme: "wooribank" } },
  { action: "android.intent.action.VIEW", data: { scheme: "hanawalletmembers" } },
  { action: "android.intent.action.VIEW", data: { scheme: "com.ibk.pds" } },
];


function addQueries(androidManifest) {
  if (!androidManifest.manifest.queries) {
    androidManifest.manifest.queries = [];
  }

  const existingSchemes = new Set(
    androidManifest.manifest.queries
      .flatMap(q => q.intent || [])
      .flatMap(i => i.data || [])
      .map(d => d.$?.['android:scheme'])
      .filter(Boolean)
  );

  const newQueries = QUERIES.map(q => {
    if (existingSchemes.has(q.data.scheme)) {
      return null; // 이미 있으면 추가하지 않음
    }
    return {
      action: { $: { 'android:name': q.action } },
      data: { $: { 'android:scheme': q.data.scheme } },
    }
  }).filter(Boolean);

  if (newQueries.length > 0) {
     for (const q of newQueries) {
        if (!androidManifest.manifest.queries[0].intent) {
            androidManifest.manifest.queries[0].intent = [];
        }
        androidManifest.manifest.queries[0].intent.push(q);
     }
  }

  return androidManifest;
}

module.exports = (config) => {
  return withAndroidManifest(config, (config) => {
    config.modResults = addQueries(config.modResults);
    return config;
  });
}; 