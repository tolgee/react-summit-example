import { useTranslate } from "@tolgee/react";
import { useEffect } from "react";

export const Title = () => {
  const { t } = useTranslate();
  const title = 'Tolgee | ' +
    t('app-title', 'Pick Your Stack – Win Some Swag');
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}
