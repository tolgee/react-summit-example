export const getUserLocale = (): string | undefined => {
  return localStorage.getItem("userLocale") || undefined;
};

export const setUserLocale = (locale: string): void => {
  localStorage.setItem("userLocale", locale);
};