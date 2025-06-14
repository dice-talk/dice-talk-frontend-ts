import DaoSvg from "@/assets/images/dice/dao.svg";
import DoriSvg from "@/assets/images/dice/dori.svg";
import HanaSvg from "@/assets/images/dice/hana.svg";
import NemoSvg from "@/assets/images/dice/nemo.svg";
import SezziSvg from "@/assets/images/dice/sezzi.svg";
import YukdaengSvg from "@/assets/images/dice/yukdaeng.svg";
import { SvgProps } from "react-native-svg";

const profileMap: Record<string, React.FC<SvgProps>> = {
  HANA: HanaSvg,
  DORI: DoriSvg,
  SEZZI: SezziSvg,
  NEMO: NemoSvg,
  DAO: DaoSvg,
  YUKDAENG: YukdaengSvg,
};

/**
 * 프로필 이름(문자열)에 해당하는 SVG 컴포넌트를 반환합니다.
 * @param profileName - 프로필 이름 (예: "HANA")
 * @returns 해당하는 SVG 컴포넌트 또는 기본값(Nemo)
 */
export const getProfileComponent = (profileName?: string | null): React.FC<SvgProps> => {
  if (profileName && profileMap[profileName]) {
    return profileMap[profileName];
  }
  return NemoSvg; // 기본값
}; 