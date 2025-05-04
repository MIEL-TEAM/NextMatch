export const initializeAudio = (
  videoElement: HTMLVideoElement
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!videoElement) {
      reject(new Error("No video element provided"));
      return;
    }

    try {
      const wasPlaying = !videoElement.paused;
      const currentTime = videoElement.currentTime;
      const wasMuted = videoElement.muted;

      videoElement.muted = false;
      videoElement.volume = 1.0;

      const playPromise = videoElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!wasPlaying) {
              videoElement.pause();
            }
            videoElement.currentTime = currentTime;
            videoElement.muted = wasMuted;
            resolve();
          })
          .catch((error) => {
            console.warn("Autoplay prevented, trying muted playback:", error);
            videoElement.muted = true;
            videoElement
              .play()
              .then(() => {
                if (!wasPlaying) {
                  videoElement.pause();
                }
                videoElement.currentTime = currentTime;
                videoElement.muted = wasMuted;
                console.warn("Audio initialized with mute workaround");
                resolve();
              })
              .catch((e) => {
                console.error("Failed to initialize audio:", e);
                reject(e);
              });
          });
      } else {
        resolve();
      }
    } catch (error) {
      console.error("Error initializing audio:", error);
      reject(error);
    }
  });
};

export const isAudioLikelyBlocked = (): boolean => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  return isIOS || isSafari || isMobile;
};

export const optimizeS3VideoUrl = (url: string): string => {
  if (!url || !url.includes("amazonaws.com")) {
    return url;
  }

  try {
    const urlObj = new URL(url);

    urlObj.searchParams.set("_t", Date.now().toString());

    if (!urlObj.searchParams.has("response-content-type")) {
      urlObj.searchParams.set("response-content-type", "video/mp4");
    }

    return urlObj.toString();
  } catch (error) {
    console.error("Error optimizing S3 URL:", error);
    return url;
  }
};

export const detectUserInteraction = (callback: () => void): (() => void) => {
  const handleInteraction = () => {
    callback();

    document.removeEventListener("click", handleInteraction);
    document.removeEventListener("touchstart", handleInteraction);
    document.removeEventListener("keydown", handleInteraction);
  };

  document.addEventListener("click", handleInteraction);
  document.addEventListener("touchstart", handleInteraction);
  document.addEventListener("keydown", handleInteraction);

  return () => {
    document.removeEventListener("click", handleInteraction);
    document.removeEventListener("touchstart", handleInteraction);
    document.removeEventListener("keydown", handleInteraction);
  };
};
