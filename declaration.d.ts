// src/declaration.d.ts 또는 src/@types/svg.d.ts
declare module "*.svg" {
    import React from "react";
    import { SvgProps } from "react-native-svg";
    const content: React.FC<SvgProps>;
    export default content;
  }
  declare module "*.png" {
    const content: number;
    export default content;
  }