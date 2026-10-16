// Shared IntersectionObservers for every video on the page.
// - "near" (600px margin): sets the poster from data-poster. Browsers fetch
//   posters eagerly, so they're held back until the video is close.
// - "visible" (40%): plays while visible and not held (e.g. its card is
//   flipped), pauses otherwise. Videos use preload="none", so no video bytes
//   download until a video first plays.

const visible = new WeakMap<HTMLVideoElement, boolean>();
const held = new WeakSet<HTMLVideoElement>();
let nearObserver: IntersectionObserver | null = null;
let playObserver: IntersectionObserver | null = null;

function update(video: HTMLVideoElement) {
  if (visible.get(video) && !held.has(video) && !document.hidden) {
    video.play().catch(() => undefined);
  } else if (!video.paused) {
    video.pause();
  }
}

function observers() {
  if (nearObserver && playObserver) return { nearObserver, playObserver };
  nearObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const video = entry.target as HTMLVideoElement;
        if (video.dataset.poster) video.poster = video.dataset.poster;
        nearObserver!.unobserve(video);
      }
    },
    { rootMargin: "600px 0px" },
  );
  playObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        visible.set(video, entry.isIntersecting);
        update(video);
      }
    },
    { threshold: 0.4 },
  );
  document.addEventListener("visibilitychange", () => {
    document.querySelectorAll<HTMLVideoElement>("video[data-autoplay]").forEach(update);
  });
  return { nearObserver, playObserver };
}

export function observeVideo(video: HTMLVideoElement, { autoplay = true } = {}) {
  const { nearObserver, playObserver } = observers();
  nearObserver.observe(video);
  if (autoplay) {
    video.dataset.autoplay = "";
    playObserver.observe(video);
  }
  return () => {
    nearObserver.unobserve(video);
    playObserver.unobserve(video);
    visible.delete(video);
  };
}

export function holdVideo(video: HTMLVideoElement, hold: boolean) {
  if (hold) held.add(video);
  else held.delete(video);
  update(video);
}
