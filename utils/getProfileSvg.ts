import DaoSvg from '@/assets/images/dice/dao.svg';
import DoriSvg from '@/assets/images/dice/dori.svg';
import HanaSvg from '@/assets/images/dice/hana.svg';
import NemoSvg from '@/assets/images/dice/nemo.svg';
import SezziSvg from '@/assets/images/dice/sezzi.svg';
import YukdaengSvg from '@/assets/images/dice/yukdaeng.svg';
import React from 'react';
import { SvgProps } from 'react-native-svg';

// SvgProps 타입을 react-native-svg에서 가져와 일관성 유지
export type SvgComponent = React.FC<SvgProps>;

// 닉네임과 SVG 컴포넌트를 매핑합니다.
const nicknameToSvgMap: Record<string, SvgComponent> = {
  '한가로운 하나': HanaSvg,
  '두 얼굴의 매력 두리': DoriSvg,
  '세침한 세찌': SezziSvg,
  '네모지만 부드러운 네몽': NemoSvg,
  '단호한데 다정한 다오': DaoSvg,
  '육감적인 직감파 육땡': YukdaengSvg,
};

/**
 * nickname을 기반으로 적절한 프로필 SVG 컴포넌트를 반환합니다.
 * @param nickname - 사용자의 닉네임
 * @returns 해당하는 SVG 컴포넌트 또는 null
 */
export const getProfileSvg = (nickname: string | null): SvgComponent | null => {
  if (nickname === null) {
    return null;
  }

  const profileSvg = nicknameToSvgMap[nickname];
  if (!profileSvg) {
    console.warn(`[getProfileSvg] 닉네임 '${nickname}'에 해당하는 프로필을 찾을 수 없습니다.`);
    return null;
  }

  return profileSvg;
}; 