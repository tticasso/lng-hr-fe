export const hasAvatar = (url) => Boolean(url && url !== "default-avatar.jpg");

export const getAvatarUrl = (url, size = 128) => {
  if (!hasAvatar(url)) return "";

  const marker = "/image/upload/";
  const uploadIndex = url.indexOf(marker);
  if (uploadIndex === -1) return url;

  const transform = `f_auto,q_auto,c_fill,g_face,w_${size * 2},h_${size * 2}/`;
  const insertAt = uploadIndex + marker.length;
  return `${url.slice(0, insertAt)}${transform}${url.slice(insertAt)}`;
};
