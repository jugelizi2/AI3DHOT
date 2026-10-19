// 只改明显的宣传词，不改专业结论与技术参数。
export const READER_WORDING: ReadonlyArray<readonly [RegExp, string]> = [
  [/重磅|炸裂|颠覆行业|革命性突破|重新定义建模/gu, "删除夸张的宣传说法，直接说明具体发布、方法、变化或结果，不补充事实"],
];
