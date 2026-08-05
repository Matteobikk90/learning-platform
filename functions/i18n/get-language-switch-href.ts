export function getLanguageSwitchHref(
  pathname: string,
  search: string,
  hash: string
) {
  return `${pathname}${search}${hash}`;
}
