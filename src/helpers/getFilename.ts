export default function getFilename(): string {
  const dirname = __filename.split(/(\/|\\)/gm);
  const filename = dirname[dirname.length - 1]
    .replace("[...", "")
    .replace("].js", "");

  return filename;
}
