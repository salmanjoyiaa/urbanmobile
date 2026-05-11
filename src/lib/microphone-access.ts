/**
 * User-facing message when getUserMedia fails (caller should toast or display).
 */
export function getMicrophoneAccessErrorMessage(err: unknown): string {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "Voice recording only works on a secure (HTTPS) connection.";
  }

  if (typeof navigator !== "undefined" && !navigator.mediaDevices?.getUserMedia) {
    return "This browser does not support microphone recording here.";
  }

  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Microphone access was blocked. Allow the microphone in your browser (lock or site icon in the address bar) and try again.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No microphone was found on this device.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The microphone is busy or unavailable. Close other apps using the mic and try again.";
  }
  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
    return "Could not use the microphone with the requested settings. Try another browser or device.";
  }

  return "Could not start recording. Check microphone permissions and try again.";
}
