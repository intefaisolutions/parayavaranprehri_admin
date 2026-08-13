/** Strip S3 signed-query params → permanent object URL (store this in DB). */
export function permanentMediaUrl(url: string): string {
  if (!url) return url;
  if (/amazonaws\.com|\.s3[.-]/i.test(url) || /[?&]X-Amz-/i.test(url)) {
    return url.split("?")[0];
  }
  return url;
}

export function isS3MediaUrl(url: string): boolean {
  if (!url) return false;
  return /amazonaws\.com|\.s3[.-]/i.test(url) || /[?&]X-Amz-/i.test(url);
}
