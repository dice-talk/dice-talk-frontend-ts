const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

// 공식 문서에서 제공된 전체 패키지 목록
const TOSS_PAYMENTS_PACKAGES = [
  "com.kakao.talk", "com.nhn.android.search", "com.samsung.android.spay",
  "net.ib.android.smcard", "com.mobiletoong.travelwallet", "com.samsung.android.spaylite",
  "com.ssg.serviceapp.android.egiftcertificate", "com.nhnent.payapp", "com.lottemembers.android",
  "viva.republica.toss", "com.shinhan.smartcaremgr", "com.shinhan.sbanking",
  "com.shcard.smartpay", "com.shinhancard.smartshinhan", "com.hyundaicard.appcard",
  "com.lumensoft.touchenappfree", "kr.co.samsungcard.mpocket", "nh.smart.nhallonepay",
  "com.kbcard.cxh.appcard", "com.kbstar.liivbank", "com.kbstar.reboot",
  "com.kbstar.kbbank", "kvp.jjy.MispAndroid320", "com.lcacApp",
  "com.hanaskcard.paycla", "com.hanaskcard.rocomo.potal", "kr.co.hanamembers.hmscustomer",
  "kr.co.citibank.citimobile", "com.wooricard.wpay", "com.wooricard.smartapp",
  "com.wooribank.smart.npib", "com.lguplus.paynow", "com.kftc.bankpay.android",
  "com.TouchEn.mVaccine.webs", "kr.co.shiftworks.vguardweb", "com.ahnlab.v3mobileplus",
  "com.kakaobank.channel"
];

// AndroidManifest.xml에 <queries>와 그 안의 <package> 태그들을 추가하는 플러그인
const withAndroidQueries = (config) => {
  return withAndroidManifest(config, (config) => {
    let manifest = config.modResults.manifest;

    // <manifest> 태그에 'xmlns:tools="http://schemas.android.com/tools"' 속성이 없으면 추가
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }
    
    // <queries> 태그가 없으면 초기화
    if (!manifest.queries) {
      manifest.queries = [{}];
    }

    // <queries> 태그 안에 <package> 배열이 없으면 초기화
    if (!manifest.queries[0].package) {
      manifest.queries[0].package = [];
    }
    
    const existingPackages = manifest.queries[0].package.map(p => p.$['android:name']);

    TOSS_PAYMENTS_PACKAGES.forEach(pkgName => {
      // 중복 추가 방지
      if (!existingPackages.includes(pkgName)) {
        manifest.queries[0].package.push({
          $: { 'android:name': pkgName },
        });
        console.log(`[withAndroidQueries] Added package to AndroidManifest: ${pkgName}`);
      }
    });

    return config;
  });
};

module.exports = withAndroidQueries; 