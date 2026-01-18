import { env } from "@foodnest/env/native";

export const getImageUrl = (path: string) => {
  if (path.startsWith("http")) return path;
  return `${env.EXPO_PUBLIC_SERVER_URL}${path}`;
};
