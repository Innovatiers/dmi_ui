/** Offers a downloaded file to the viewer as a download. */
export type SaveFile = (blob: Blob, filename: string) => void;

/** Saves a file through a temporary object URL and a hidden download link. */
export const saveFile: SaveFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
